import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";

// US-3.k — Mode sombre sur tout le site (données fictives uniquement), sur téléphone de 360 px.
// Bouton de bascule dans l'en-tête public et dans le menu de l'administration, choix mémorisé par
// navigateur, retour au mode clair, impression des actes sur fond blanc, parcours complet en mode
// sombre. La fenêtre de paiement Paystack est simulée dans le navigateur de test.
//   SHOTS_DIR         dossier où enregistrer une capture par exigence (optionnel)
//   E2E_DATABASE_URL  base de test : création d'une demande « Livrée » fictive pour l'impression
//                     (optionnel ; le module « pg » du projet doit être disponible)

const SHOTS_DIR = process.env.SHOTS_DIR;
const DATABASE_URL = process.env.E2E_DATABASE_URL;
const MOBILE = { width: 360, height: 740 };
const stamp = Date.now();
const admin = { nom: "AdminSombre", prenom: "Fictif", email: `admin.sombre.${stamp}@exemple.test`, password: "MotDePasse1" };
const citoyen = {
    nom: "Sombrefictif",
    prenom: "Awa",
    dateNaissance: "1992-04-12",
    lieu: "Bouaké",
    telephone: "0700000004",
    adresse: "Cocody, Abidjan",
    email: `citoyen.sombre.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

const PAGES_PUBLIQUES = ["/", "/login", "/register", "/nos-service"];
const PAGES_CITOYEN = ["/citoyen-dashboard", "/suivi-demande", "/nouvelle-demande-naissance?type=Naissance"];
const PAGES_ADMIN = [
    "/admin/dashboard",
    "/admin/dashboard/liste-demande",
    "/admin/dashboard/stats",
    "/admin/dashboard/agents",
    "/admin/dashboard/tarif",
];
const PAGES_ADMIN_SORTIE = ["/admin", "/admin/register"];

let idDemandeLivree = "";

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

async function contexteMobile(browser: Browser, storageState?: Awaited<ReturnType<BrowserContext["storageState"]>>) {
    return browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true, locale: "fr-FR", storageState });
}

const html = (page: Page) => page.locator("html");
const estSombre = (page: Page) => page.evaluate(() => document.documentElement.classList.contains("dark"));
const bascule = (page: Page) => page.locator('[data-slot="theme-toggle"]:visible').first();

async function activerSombre(page: Page) {
    await expect(bascule(page)).toBeVisible();
    await bascule(page).click();
    await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
}

// Contraste minimal 2,5 : le texte blanc sur l'orange de la marque (2,6) est identique en mode clair, hors périmètre.
// Luminance relative (0 = noir, 1 = blanc) d'une couleur « rgb(a) » calculée par le navigateur
function analyseCouleurs() {
    return () => {
        const lum = (c: string) => {
            const m = c.match(/[\d.]+/g)!.map(Number);
            const [r, g, b] = m.slice(0, 3).map((v) => {
                const s = v / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            });
            return { l: 0.2126 * r + 0.7152 * g + 0.0722 * b, a: m.length > 3 ? m[3] : 1 };
        };
        const fond = (el: Element | null): string => {
            for (let e = el; e; e = e.parentElement) {
                const bg = getComputedStyle(e).backgroundColor;
                if (lum(bg).a > 0.5) return bg;
            }
            return "rgb(255, 255, 255)";
        };
        const illisibles: string[] = [];
        const blancs: string[] = [];
        for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
            const r = el.getBoundingClientRect();
            const st = getComputedStyle(el);
            if (r.width === 0 || r.height === 0 || st.visibility === "hidden" || st.display === "none") continue;
            if (el.closest("[data-slot='bandeau-drapeau'], svg, [data-paper]")) continue;
            if (r.width * r.height > 8000 && lum(st.backgroundColor).a > 0.5 && lum(st.backgroundColor).l > 0.8) {
                blancs.push(`${el.tagName}.${String(el.className).slice(0, 60)}`);
            }
            const direct = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent || "").trim());
            if (!direct) continue;
            const fg = lum(st.color).l;
            const bg = lum(fond(el)).l;
            const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
            if (ratio < 2.5) illisibles.push(`${(el.textContent || "").trim().slice(0, 30)} (${ratio.toFixed(1)})`);
        }
        const bodyBg = lum(getComputedStyle(document.body).backgroundColor).l;
        return { illisibles, blancs, bodyBg };
    };
}

async function pageSombreLisible(page: Page, url: string) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    expect(await estSombre(page), `${url} en mode sombre`).toBe(true);
    const res = await page.evaluate(analyseCouleurs());
    expect(res.bodyBg, `${url} : fond de page sombre`).toBeLessThan(0.1);
    expect(res.blancs, `${url} : zones restées blanches`).toEqual([]);
    expect(res.illisibles, `${url} : textes illisibles`).toEqual([]);
}

async function pageClaire(page: Page, url: string) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    expect(await estSombre(page), `${url} en mode clair`).toBe(false);
    const res = await page.evaluate(analyseCouleurs());
    expect(res.bodyBg, `${url} : fond de page clair`).toBeGreaterThan(0.8);
}

async function connexionCitoyen(page: Page) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(citoyen.email);
    await page.getByLabel("Mot de passe").fill(citoyen.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
}

async function connexionAdmin(page: Page) {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

async function db() {
    const pg = await import("pg");
    const { Client } = (pg as any).default ?? pg;
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    return client;
}

// Simule la fenêtre de paiement Paystack (succès)
async function simulerPaystackSucces(context: BrowserContext) {
    const cors = {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
    };
    await context.route(/https:\/\/api\.paystack\.co\/.*/, async (route) => {
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
        return route.fulfill({
            status: 200,
            headers: { ...cors, "content-type": "application/json" },
            body: JSON.stringify({
                status: true,
                message: "ok",
                data: { id: 1, access_code: "acces-fictif", transaction_status: "pending", channels: ["mobile_money"], log: null },
            }),
        });
    });
    await context.route(/https:\/\/checkout\.paystack\.com\/.*/, (route) =>
        route.fulfill({
            status: 200,
            contentType: "text/html",
            body: `<!doctype html><html><body><script>
                parent.postMessage({ event: "loaded:checkout" }, "*");
                setTimeout(function () { parent.postMessage({ event: "success", data: { reference: "ref-fictive", status: "success" } }, "*"); }, 800);
            </script></body></html>`,
        })
    );
    await context.route(/https:\/\/(standard\.paystack\.co|paystack\.com)\/.*/, (route) => route.fulfill({ status: 200, body: "" }));
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(admin.nom);
    await page.getByLabel("Prénom").fill(admin.prenom);
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Administrateur" }).click();
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    // Un tarif pour l'acte de naissance, nécessaire au parcours de demande
    await page.goto("/admin/dashboard/tarif");
    await page.waitForLoadState("networkidle");
    const ligne = page.locator("tbody tr", { hasText: "Naissance" });
    if ((await ligne.count()) === 0) {
        await page.getByText("Ajouter un tarif").click();
        const dialog = page.getByRole("dialog");
        await dialog.getByRole("combobox").click();
        await page.getByRole("option", { name: "Acte de naissance" }).click();
        await dialog.getByLabel("Frais de timbre").fill("1500");
        await dialog.getByLabel("Frais d'expedition").fill("5000");
        await dialog.getByRole("button", { name: "Enregistrer" }).click();
        await expect(ligne).toHaveCount(1);
    }
    await page.close();
});

test.afterAll(async () => {
    if (!DATABASE_URL) return;
    const client = await db();
    try {
        await client.query(`DELETE FROM "Naissance" WHERE "ID_Demande" IN (SELECT "ID_Demande" FROM "Demande" WHERE "ID_Citoyen" IN (SELECT "ID_Citoyen" FROM "Citoyen" WHERE "Email" = $1))`, [citoyen.email]);
        await client.query(`DELETE FROM "Demande" WHERE "ID_Citoyen" IN (SELECT "ID_Citoyen" FROM "Citoyen" WHERE "Email" = $1)`, [citoyen.email]);
        await client.query(`DELETE FROM "Agent" WHERE "Email" = $1`, [admin.email]);
    } catch {
        // nettoyage au mieux : données fictives uniquement
    } finally {
        await client.end();
    }
});

test("CA-3.11 — bouton de bascule dans l'en-tête public (360 px), choix mémorisé après réouverture du navigateur", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await page.goto("/");
    // Mode clair par défaut
    expect(await estSombre(page)).toBe(false);
    const bouton = page.locator("body > nav").locator('[data-slot="theme-toggle"]');
    await expect(bouton).toBeVisible();
    const box = (await bouton.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(MOBILE.width);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(bouton).toHaveAccessibleName("Passer en mode sombre");
    await shot(page, "CA-3.11-accueil-clair-360");
    await activerSombre(page);
    await expect(bouton).toHaveAccessibleName("Passer en mode clair");
    await shot(page, "CA-3.11-accueil-sombre-360");
    // Fermeture puis réouverture du navigateur : seul le stockage du navigateur est conservé
    const etat = await context.storageState();
    await context.close();
    const context2 = await contexteMobile(browser, etat);
    const page2 = await context2.newPage();
    await page2.goto("/");
    await expect(html(page2)).toHaveClass(/(^|\s)dark(\s|$)/);
    await context2.close();
});

test("CA-3.11 — pages publiques en mode sombre : aucun texte illisible, aucune zone blanche", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await page.goto("/");
    await activerSombre(page);
    for (const url of PAGES_PUBLIQUES) {
        await pageSombreLisible(page, url);
        await shot(page, `CA-3.11-sombre-${url.replace(/\W+/g, "_") || "accueil"}-360`);
    }
    await context.close();
});

test("CA-3.11 — pages du citoyen connecté en mode sombre : aucun texte illisible, aucune zone blanche", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await page.goto("/register");
    for (const [label, valeur] of [
        ["Nom", citoyen.nom], ["Prénom", citoyen.prenom], ["Date de naissance", citoyen.dateNaissance],
        ["Lieu de naissance", citoyen.lieu], ["Téléphone", citoyen.telephone], ["Adresse", citoyen.adresse],
        ["Email", citoyen.email], ["Mot de passe", citoyen.password],
    ]) await page.getByLabel(label, { exact: true }).fill(valeur);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);
    await activerSombre(page);
    for (const url of PAGES_CITOYEN) {
        await pageSombreLisible(page, url);
        await shot(page, `CA-3.11-sombre-${url.split("?")[0].replace(/\W+/g, "_")}-360`);
    }
    await context.close();
});

test("CA-3.11 — administration : bouton dans le menu, pages en mode sombre, choix commun aux deux espaces", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    // Le choix fait sur le site public s'applique aussi à l'administration
    await page.goto("/");
    await activerSombre(page);
    for (const url of PAGES_ADMIN_SORTIE) await pageSombreLisible(page, url);
    await connexionAdmin(page);
    expect(await estSombre(page)).toBe(true);
    // Bouton dans le menu latéral (ouvert avec le bouton du menu sur téléphone)
    await page.getByRole("button").first().click();
    const bouton = page.locator("aside").locator('[data-slot="theme-toggle"]');
    await expect(bouton).toBeVisible();
    expect((await bouton.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(bouton).toHaveAccessibleName("Passer en mode clair");
    await shot(page, "CA-3.11-menu-admin-sombre-360");
    for (const url of PAGES_ADMIN) {
        await pageSombreLisible(page, url);
        await shot(page, `CA-3.11-sombre-${url.replace(/\W+/g, "_")}-360`);
    }
    await context.close();
});

test("CA-3.11 — bascule faite depuis le menu de l'administration : mémorisée, visible aussi sur le site public", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexionAdmin(page);
    expect(await estSombre(page)).toBe(false);
    await page.getByRole("button").first().click();
    await page.locator("aside").locator('[data-slot="theme-toggle"]').click();
    await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
    const etat = await context.storageState();
    await context.close();
    const context2 = await contexteMobile(browser, etat);
    const page2 = await context2.newPage();
    await page2.goto("/admin/dashboard");
    expect(await estSombre(page2)).toBe(true);
    await page2.goto("/");
    expect(await estSombre(page2)).toBe(true);
    await context2.close();
});

test("CA-3.k.1 — retour au mode clair : public et administration, choix mémorisé", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await page.goto("/");
    await activerSombre(page);
    await bascule(page).click();
    await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(bascule(page)).toHaveAccessibleName("Passer en mode sombre");
    for (const url of PAGES_PUBLIQUES) await pageClaire(page, url);
    await shot(page, "CA-3.k.1-accueil-clair-360");
    await connexionAdmin(page);
    for (const url of PAGES_ADMIN) await pageClaire(page, url);
    // Retour au clair depuis le menu de l'administration, après être passé au sombre
    await page.getByRole("button").first().click();
    await page.locator("aside").locator('[data-slot="theme-toggle"]').click();
    await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
    await page.locator("aside").locator('[data-slot="theme-toggle"]').click();
    await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);
    await shot(page, "CA-3.k.1-admin-clair-360");
    // Mémorisé après réouverture du navigateur
    const etat = await context.storageState();
    await context.close();
    const context2 = await contexteMobile(browser, etat);
    const page2 = await context2.newPage();
    for (const url of ["/", "/admin/dashboard"]) {
        await page2.goto(url);
        expect(await estSombre(page2), url).toBe(false);
    }
    await context2.close();
});

test("CA-3.k.2 — impression des actes en mode sombre : fond blanc, texte noir, comme en mode clair", async ({ browser }) => {
    test.skip(!DATABASE_URL, "E2E_DATABASE_URL requis pour créer une demande livrée fictive");
    const client = await db();
    try {
        const { rows } = await client.query(`SELECT "ID_Citoyen" FROM "Citoyen" WHERE "Email" = $1`, [citoyen.email]);
        idDemandeLivree = `3ksombre-${stamp}`;
        await client.query(
            `INSERT INTO "Demande" ("ID_Demande","ID_Citoyen","TypeActe","Statut","DemandePourTier","DateDemande","DateActe","NumeroActe")
             VALUES ($1,$2,'Naissance','Livrée','Moi',now(),'1992-04-12','ACTE-FICTIF-3K')`,
            [idDemandeLivree, rows[0].ID_Citoyen]
        );
        await client.query(
            `INSERT INTO "Naissance" ("ID_Naissance","ID_Demande","Nom","Prenom","NomMere","PrenomMere","NomPere","PrenomPere")
             VALUES ($1,$2,'Sombrefictif','Awa','Koffi','Aya','Kouadio','Konan')`,
            [`3knais-${stamp}`, idDemandeLivree]
        );
    } finally {
        await client.end();
    }
    const mesures: Record<string, { fond: string; texte: string; bordure: string; page: string }> = {};
    for (const mode of ["clair", "sombre"] as const) {
        const context = await contexteMobile(browser);
        const page = await context.newPage();
        await connexionCitoyen(page);
        if (mode === "sombre") {
            await activerSombre(page);
        }
        await page.goto(`/confirmation/${idDemandeLivree}`);
        await page.waitForLoadState("networkidle");
        await expect(page.getByRole("button", { name: "Télécharger le document" })).toBeVisible();
        expect(await estSombre(page)).toBe(mode === "sombre");
        await shot(page, `CA-3.k.2-confirmation-${mode}-360`);
        const acte = page.locator("div.bg-paper").first();
        await expect(acte).toHaveCount(1);
        await page.emulateMedia({ media: "print" });
        mesures[mode] = await acte.evaluate((el) => {
            const st = getComputedStyle(el);
            return {
                fond: st.backgroundColor,
                texte: st.color,
                bordure: st.borderTopColor,
                page: getComputedStyle(document.body).backgroundColor + "|" + getComputedStyle(document.body).color,
            };
        });
        if (mode === "sombre") {
            // À l'impression, la page elle-même reste noir sur blanc
            expect(mesures[mode].page).toBe("rgb(255, 255, 255)|rgb(0, 0, 0)");
            // Contenu envoyé à l'impression (même mise en forme que la fenêtre d'impression du navigateur)
            await page.evaluate(() => {
                const acte = document.querySelector<HTMLElement>("div.bg-paper")!;
                const parent = acte.closest<HTMLElement>(".hidden")!;
                parent.classList.remove("hidden");
            });
            await page.pdf({ path: SHOTS_DIR ? path.join(SHOTS_DIR, "CA-3.k.2-acte-sombre.pdf") : undefined, printBackground: true });
        }
        await context.close();
    }
    expect(mesures.sombre.fond).toBe("rgb(255, 255, 255)");
    expect(mesures.sombre.texte).toBe("rgb(0, 0, 0)");
    expect(mesures.sombre.fond).toBe(mesures.clair.fond);
    expect(mesures.sombre.texte).toBe(mesures.clair.texte);
    expect(mesures.sombre.bordure).toBe(mesures.clair.bordure);
});

test("CA-3.k.2 — l'impression d'une page du site en mode sombre se fait en noir sur blanc", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await page.goto("/");
    await activerSombre(page);
    await page.emulateMedia({ media: "print" });
    const { fond, texte } = await page.evaluate(() => ({
        fond: getComputedStyle(document.body).backgroundColor,
        texte: getComputedStyle(document.body).color,
    }));
    expect(fond).toBe("rgb(255, 255, 255)");
    expect(texte).toBe("rgb(0, 0, 0)");
    await context.close();
});

test("CA-3.k.3 — parcours complet en mode sombre : inscription, demande d'acte de naissance, paiement, suivi", async ({ browser }) => {
    const context = await contexteMobile(browser);
    await simulerPaystackSucces(context);
    const page = await context.newPage();
    const citoyen2 = { ...citoyen, email: `citoyen.sombre2.${stamp}@exemple.test` };

    await page.goto("/");
    await activerSombre(page);

    // Inscription : mêmes champs, même résultat qu'en mode clair
    await page.goto("/register");
    expect(await estSombre(page)).toBe(true);
    for (const [label, valeur] of [
        ["Nom", citoyen2.nom], ["Prénom", citoyen2.prenom], ["Date de naissance", citoyen2.dateNaissance],
        ["Lieu de naissance", citoyen2.lieu], ["Téléphone", citoyen2.telephone], ["Adresse", citoyen2.adresse],
        ["Email", citoyen2.email], ["Mot de passe", citoyen2.password],
    ]) await page.getByLabel(label, { exact: true }).fill(valeur);
    await shot(page, "CA-3.k.3-inscription-sombre-360");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await estSombre(page)).toBe(true);

    // Demande d'acte de naissance
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Moi même" }).click();
    const champs: [string, string][] = [
        ["Numéro d'acte", "ACTE-FICTIF-3K"],
        ["Nom de la mère", "Koffi"],
        ["Prénom de la mère", "Aya"],
        ["Date de naissance de la mère", "1965-03-10"],
        ["Profession de la mère", "Commerçante"],
        ["Nom du père", "Kouadio"],
        ["Prénom du père", "Konan"],
        ["Date de naissance du père", "1960-07-21"],
        ["Profession du père", "Enseignant"],
    ];
    for (const [label, valeur] of champs) await page.getByLabel(label, { exact: true }).fill(valeur);
    await shot(page, "CA-3.k.3-demande-sombre-360");
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expect(page).toHaveURL(/\/paiement\/[^/]+$/);
    const id = page.url().split("/paiement/")[1];
    await expect(page.getByText("Frais de timbre", { exact: true })).toBeVisible();
    await shot(page, "CA-3.k.3-paiement-sombre-360");

    // Paiement : succès -> page de confirmation avec le numéro de suivi
    await page.getByRole("button", { name: "Payer" }).click();
    await expect(page).toHaveURL(new RegExp(`/confirmation/${id}$`), { timeout: 30_000 });
    await expect(page.locator('[data-slot="numero-suivi"]')).toContainText(id);
    expect(await estSombre(page)).toBe(true);
    await shot(page, "CA-3.k.3-confirmation-sombre-360");

    // Suivi : la demande payée apparaît avec son état
    await page.goto("/suivi-demande");
    const ligne = page.locator("tbody tr", { hasText: id.substring(0, 8).toUpperCase() });
    await expect(ligne).toHaveCount(1);
    expect(await estSombre(page)).toBe(true);
    await shot(page, "CA-3.k.3-suivi-sombre-360");
    await context.close();
});
