import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Charte graphique (US-3.a) : pages principales sur ordinateur et sur téléphone 360 px,
// logo et écran de chargement, puis parcours complet d'un citoyen (non-régression) :
// inscription -> demande d'acte de naissance -> paiement -> suivi.
// Données fictives uniquement. Le paiement Paystack est simulé dans le navigateur de test
// (aucun appel réel à Paystack) : la fenêtre de paiement renvoie directement « succès »,
// ce qui déclenche le même traitement que l'application après un vrai paiement.
//   SHOTS_DIR      dossier où enregistrer une capture par exigence (optionnel)
//   TEXT_DUMP_DIR  dossier où enregistrer le texte visible de chaque page (optionnel,
//                  pour comparer les textes avant / après la refonte)

const SHOTS_DIR = process.env.SHOTS_DIR;
const TEXT_DUMP_DIR = process.env.TEXT_DUMP_DIR;
const stamp = Date.now();
const MONTANT = "1500";

const admin = {
    nom: "Testeur",
    prenom: "Fictif",
    email: `admin.charte.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

const citoyen = {
    nom: "Kouadio",
    prenom: "Fictif",
    dateNaissance: "1990-05-12",
    lieu: "Abidjan",
    telephone: "+2250102030405",
    adresse: "Rue fictive 12, Cocody",
    email: `citoyen.charte.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

// Citoyen inscrit pendant le parcours complet (CA-3.a.2)
const citoyenParcours = {
    ...citoyen,
    nom: "Yao",
    email: `parcours.charte.${stamp}@exemple.test`,
};

const MOBILE = { width: 360, height: 740 };

async function shot(page: Page, name: string, fullPage = true) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage });
}

async function dumpText(page: Page, name: string) {
    if (!TEXT_DUMP_DIR) return;
    fs.mkdirSync(TEXT_DUMP_DIR, { recursive: true });
    const text = await page.locator("body").innerText();
    fs.writeFileSync(path.join(TEXT_DUMP_DIR, `${name}.txt`), text);
}

async function expectNoHorizontalScroll(page: Page) {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect.soft(overflow, "défilement horizontal (px)").toBeLessThanOrEqual(0);
}

// Sur 360 px, tout texte visible doit garder une taille lisible sans zoom (>= 12 px).
async function expectReadableText(page: Page) {
    const tooSmall = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            const el = node.parentElement;
            if (!el || !node.textContent?.trim()) continue;
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (style.visibility === "hidden" || style.display === "none" || rect.width === 0) continue;
            if (el.closest(".sr-only")) continue;
            if (parseFloat(style.fontSize) < 12) out.push(`${node.textContent.trim()} (${style.fontSize})`);
        }
        return out;
    });
    expect.soft(tooSmall, "textes de moins de 12 px").toEqual([]);
}

// Couleurs de la marque : vérifie que l'orange #FF7900 et le vert #009E60 sont bien rendus.
async function brandColorsOnPage(page: Page) {
    return page.evaluate(() => {
        const found = new Set<string>();
        for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
            const s = getComputedStyle(el);
            for (const c of [s.color, s.backgroundColor, s.borderTopColor, s.fill, s.stroke]) {
                if (!c) continue;
                const n = c.replace(/\s/g, "");
                if (n.startsWith("rgb(255,121,0")) found.add("orange");
                if (n.startsWith("rgb(0,158,96")) found.add("vert");
            }
        }
        return Array.from(found).sort();
    });
}

async function registerAdmin(page: Page) {
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(admin.nom);
    await page.getByLabel("Prénom").fill(admin.prenom);
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Administrateur" }).click();
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
}

async function loginAdmin(page: Page) {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

async function fillRegisterForm(page: Page, c: typeof citoyen) {
    await page.goto("/register");
    await page.getByLabel("Nom", { exact: true }).fill(c.nom);
    await page.getByLabel("Prénom", { exact: true }).fill(c.prenom);
    await page.getByLabel("Date de naissance", { exact: true }).fill(c.dateNaissance);
    await page.getByLabel("Lieu de naissance", { exact: true }).fill(c.lieu);
    await page.getByLabel("Téléphone", { exact: true }).fill(c.telephone);
    await page.getByLabel("Adresse", { exact: true }).fill(c.adresse);
    await page.getByLabel("Email", { exact: true }).fill(c.email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(c.password);
}

async function loginCitoyen(page: Page, c: typeof citoyen) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(c.email);
    await page.getByLabel("Mot de passe").fill(c.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
    // Connecté : le lien « Suivre mes demandes » est proposé dans le menu
    await expect(page.getByRole("link", { name: "Suivre mes demandes", includeHidden: true }).first()).toBeAttached();
}

// Informations de l'acte (mêmes champs qu'avant la refonte), données fictives
async function remplirDemandeNaissance(page: Page) {
    const champs: [string, string][] = [
        ["Numéro d'acte", "ACTE-FICTIF-0001"],
        ["Nom de la mère", "Koffi"],
        ["Prénom de la mère", "Aya"],
        ["Date de naissance de la mère", "1965-03-10"],
        ["Profession de la mère", "Commerçante"],
        ["Nom du père", "Kouadio"],
        ["Prénom du père", "Konan"],
        ["Date de naissance du père", "1960-07-21"],
        ["Profession du père", "Enseignant"],
    ];
    for (const [label, valeur] of champs) {
        await page.getByLabel(label, { exact: true }).fill(valeur);
    }
}

async function creerDemandeNaissance(page: Page) {
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await expect(page.getByText(`Les frais de timbre s'élèvent à ${MONTANT} FCFA pour ce document.`)).toBeVisible();
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Moi même" }).click();
    await remplirDemandeNaissance(page);
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expect(page).toHaveURL(/\/paiement\/[^/]+$/);
    return page.url().split("/paiement/")[1];
}

// Simule la fenêtre de paiement Paystack (aucun appel réseau réel vers Paystack).
async function mockPaystack(context: BrowserContext) {
    const cors = {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
    };
    await context.route(/https:\/\/api\.paystack\.co\/.*/, async (route) => {
        if (route.request().method() === "OPTIONS") {
            return route.fulfill({ status: 204, headers: cors });
        }
        return route.fulfill({
            status: 200,
            headers: { ...cors, "content-type": "application/json" },
            body: JSON.stringify({
                status: true,
                message: "ok",
                data: {
                    id: 1,
                    access_code: "acces-fictif",
                    transaction_status: "pending",
                    channels: ["card"],
                    log: null,
                },
            }),
        });
    });
    await context.route(/https:\/\/checkout\.paystack\.com\/.*/, (route) =>
        route.fulfill({
            status: 200,
            contentType: "text/html",
            body: `<!doctype html><html><body><script>
                parent.postMessage({ event: "loaded:checkout" }, "*");
                setTimeout(function () {
                    parent.postMessage({ event: "success", data: { reference: "ref-fictive", status: "success" } }, "*");
                }, 800);
            </script></body></html>`,
        })
    );
    await context.route(/https:\/\/(standard\.paystack\.co|paystack\.com)\/.*/, (route) =>
        route.fulfill({ status: 200, body: "" })
    );
}

test.beforeAll(async ({ browser }) => {
    // Préparation : un administrateur fictif définit le tarif de l'acte de naissance.
    const page = await browser.newPage();
    await registerAdmin(page);
    await loginAdmin(page);
    await page.goto("/admin/dashboard/tarif");
    const existing = page.locator("tbody tr", { hasText: "Naissance" });
    if ((await existing.count()) === 0) {
        await page.getByText("Ajouter un tarif").click();
        const dialog = page.getByRole("dialog");
        await dialog.getByRole("combobox").click();
        await page.getByRole("option", { name: "Acte de naissance" }).click();
        await dialog.getByLabel("Frais de timbre").fill(MONTANT);
        await dialog.getByLabel("Frais d'expedition").fill("5000");
        await dialog.getByRole("button", { name: "Enregistrer" }).click();
        await expect(page.locator("tbody tr", { hasText: "Naissance" })).toHaveCount(1);
    }
    await page.close();
    // Un citoyen fictif déjà inscrit, utilisé par les tests d'affichage
    const context = await browser.newContext();
    const p2 = await context.newPage();
    await fillRegisterForm(p2, citoyen);
    await p2.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(p2).toHaveURL(/\/$/);
    await context.close();
});

test("CA-3.1 accueil et connexion : nouvelle charte, couleurs de la marque, ordinateur et 360 px", async ({ browser }) => {
    for (const [label, viewport] of [
        ["desktop", { width: 1366, height: 900 }],
        ["mobile-360", MOBILE],
    ] as const) {
        const context = await browser.newContext({ viewport, locale: "fr-FR", isMobile: label !== "desktop", hasTouch: label !== "desktop" });
        const page = await context.newPage();
        for (const [url, name] of [
            ["/", "accueil"],
            ["/login", "connexion"],
            ["/register", "inscription"],
            ["/admin", "connexion-admin"],
        ] as const) {
            const response = await page.goto(url);
            expect(response?.status()).toBe(200);
            await expect(page.getByText("Application error")).toHaveCount(0);
            const colors = await brandColorsOnPage(page);
            expect.soft(colors).toContain("orange");
            if (url === "/" || url === "/login" || url === "/register") expect.soft(colors).toContain("vert");
            if (label === "mobile-360") {
                await expectNoHorizontalScroll(page);
                await expectReadableText(page);
            }
            if (label === "desktop") await dumpText(page, name);
            await shot(page, `CA-3.1-${name}-${label}`);
        }
        await context.close();
    }
});

test("CA-3.a.1 logo net et sans débordement sur 360 px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE, locale: "fr-FR", isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    const page = await context.newPage();
    await page.goto("/");
    await page.locator("nav").first().screenshot({ path: SHOTS_DIR ? path.join(SHOTS_DIR, "CA-3.a.1-logo-entete-360.png") : undefined });
    const logo = page.locator("nav [data-slot='logo']").first();
    await expect(logo).toBeVisible();
    // Logo vectoriel (SVG) : net quelle que soit la densité de l'écran
    await expect(logo.locator("svg")).toHaveCount(1);
    await expect(logo).toContainText("État");
    await expect(logo).toContainText("Civil");
    await expect(logo).toContainText("CI");
    const box = await logo.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(MOBILE.width);
    // Le logo ne doit pas passer sur deux lignes ni être coupé
    const clipped = await logo.evaluate((el) => el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().height > 48);
    expect(clipped).toBe(false);
    await expectNoHorizontalScroll(page);
    await context.close();
});


test("CA-3.a.2 parcours complet citoyen : inscription, demande de naissance, paiement, suivi", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "fr-FR" });
    await mockPaystack(context);
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    // 1. Inscription : mêmes informations demandées qu'avant
    await page.goto("/register");
    await dumpText(page, "parcours-1-inscription");
    for (const label of ["Nom", "Prénom", "Date de naissance", "Lieu de naissance", "Téléphone", "Adresse", "Email", "Mot de passe"]) {
        await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
    await fillRegisterForm(page, citoyenParcours);
    await shot(page, "CA-3.a.2-1-inscription");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);
    // Inscrit et connecté : le lien « Suivre mes demandes » est proposé
    await expect(page.getByRole("link", { name: "Suivre mes demandes", includeHidden: true }).first()).toBeAttached();
    await page.close();
    await context.clearCookies();
    // Nouvelle connexion avec le compte créé
    const page2 = await context.newPage();
    page2.on("pageerror", (e) => pageErrors.push(e.message));
    await page2.goto("/login");
    await dumpText(page2, "parcours-1b-connexion");
    await loginCitoyen(page2, citoyenParcours);
    await shot(page2, "CA-3.a.2-1b-connecte-accueil");
    await parcoursSuite(page2, context);
});

async function parcoursSuite(page: Page, context: BrowserContext) {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    // 2. Demande d'acte de naissance pour soi-même
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await expect(page.getByText(`Les frais de timbre s'élèvent à ${MONTANT} FCFA pour ce document.`)).toBeVisible();
    await dumpText(page, "parcours-2-demande-naissance");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Moi même" }).click();
    await remplirDemandeNaissance(page);
    await shot(page, "CA-3.a.2-2-demande-naissance");
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expect(page).toHaveURL(/\/paiement\/[^/]+$/);
    const demandeId = page.url().split("/paiement/")[1];

    // 3. Paiement (fenêtre Paystack simulée) -> confirmation
    await expect(page.getByText("Faite le paiement de votre demande Acte de naissance")).toBeVisible();
    await expect(page.getByText(`${MONTANT} FCFA`)).toBeVisible();
    await dumpText(page, "parcours-3-paiement");
    await shot(page, "CA-3.a.2-3-paiement");
    await page.getByRole("button", { name: "Payer" }).click();
    await expect(page).toHaveURL(new RegExp(`/confirmation/${demandeId}$`), { timeout: 30_000 });
    await expect(page.getByText("Demande enregistrée avec succès !")).toBeVisible();
    await expect(page.getByText(demandeId)).toBeVisible();
    await dumpText(page, "parcours-4-confirmation");
    await shot(page, "CA-3.a.2-4-confirmation");

    // 4. Suivi : la demande apparaît, payée, dans le tableau de bord citoyen
    await page.goto("/suivi-demande");
    const ligne = page.locator("tbody tr", { hasText: demandeId.substring(0, 8).toUpperCase() });
    await expect(ligne).toHaveCount(1);
    await expect(ligne).toContainText("Acte de naissance");
    await expect(ligne).not.toContainText("attente de paiement");
    await dumpText(page, "parcours-5-suivi");
    await shot(page, "CA-3.a.2-5-suivi");

    // 5. L'administration voit la demande payée et peut l'ouvrir (session séparée)
    const adminContext = await context.browser()!.newContext({ viewport: { width: 1366, height: 900 }, locale: "fr-FR" });
    const adminPage = await adminContext.newPage();
    await loginAdmin(adminPage);
    await adminPage.goto("/admin/dashboard/liste-demande");
    await expect(adminPage.locator("tbody tr", { hasText: demandeId.substring(0, 8).toUpperCase() })).toHaveCount(1);
    await adminPage.goto(`/admin/dashboard/details-demande/${demandeId}`);
    await expect(adminPage.getByText("Application error")).toHaveCount(0);
    await adminPage.waitForLoadState("networkidle");
    await dumpText(adminPage, "parcours-6-details-admin");
    await shot(adminPage, "CA-3.a.2-6-details-demande-admin");
    await adminContext.close();

    expect(pageErrors).toEqual([]);
    await context.close();
}

test("CA-3.1 pages citoyen sur 360 px : demande, paiement, tableau de bord citoyen", async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE, locale: "fr-FR", isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await loginCitoyen(page, citoyen);
    await expectNoHorizontalScroll(page);
    await shot(page, "CA-3.1-accueil-connecte-mobile-360");
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await expect(page.getByText(`${MONTANT} FCFA`).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectReadableText(page);
    expect.soft(await brandColorsOnPage(page)).toContain("orange");
    await shot(page, "CA-3.1-demande-naissance-mobile-360");
    await creerDemandeNaissance(page);
    await expect(page.getByText(`${MONTANT} FCFA`)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectReadableText(page);
    await shot(page, "CA-3.1-paiement-mobile-360");
    await page.goto("/suivi-demande");
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectReadableText(page);
    expect.soft(await brandColorsOnPage(page)).toContain("orange");
    await shot(page, "CA-3.1-tableau-de-bord-citoyen-mobile-360");
    await context.close();
});

test("CA-3.1 pages citoyen sur ordinateur : demande, paiement, tableau de bord citoyen", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "fr-FR" });
    const page = await context.newPage();
    await loginCitoyen(page, citoyen);
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await expect(page.getByText(`${MONTANT} FCFA`).first()).toBeVisible();
    expect.soft(await brandColorsOnPage(page)).toContain("orange");
    await shot(page, "CA-3.1-demande-naissance-desktop");
    await creerDemandeNaissance(page);
    await expect(page.getByText(`${MONTANT} FCFA`)).toBeVisible();
    expect.soft(await brandColorsOnPage(page)).toContain("orange");
    await shot(page, "CA-3.1-paiement-desktop");
    await page.goto("/suivi-demande");
    await expect(page.locator("tbody tr").first()).toBeVisible();
    expect.soft(await brandColorsOnPage(page)).toContain("orange");
    await dumpText(page, "tableau-de-bord-citoyen");
    await shot(page, "CA-3.1-tableau-de-bord-citoyen-desktop");
    await context.close();
});

test("CA-3.1 tableau de bord de l'administration : ordinateur et 360 px", async ({ browser }) => {
    for (const [label, viewport] of [
        ["desktop", { width: 1366, height: 900 }],
        ["mobile-360", MOBILE],
    ] as const) {
        const context = await browser.newContext({ viewport, locale: "fr-FR", isMobile: label !== "desktop", hasTouch: label !== "desktop" });
        const page = await context.newPage();
        await loginAdmin(page);
        await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
        await page.waitForLoadState("networkidle");
        expect.soft(await brandColorsOnPage(page)).toContain("orange");
        if (label === "mobile-360") {
            await expectNoHorizontalScroll(page);
            await expectReadableText(page);
        } else {
            await dumpText(page, "tableau-de-bord-admin");
        }
        await shot(page, `CA-3.1-tableau-de-bord-admin-${label}`);
        for (const [url, name] of [
            ["/admin/dashboard/liste-demande", "liste-demandes-admin"],
            ["/admin/dashboard/stats", "statistiques-admin"],
            ["/admin/dashboard/tarif", "tarifs-admin"],
        ] as const) {
            await page.goto(url);
            await expect(page.getByText("Application error")).toHaveCount(0);
            await page.waitForLoadState("networkidle");
            if (label === "desktop") await dumpText(page, name);
            await shot(page, `CA-3.1-${name}-${label}`);
        }
        await context.close();
    }
});

test("CA-3.a.1 écran de chargement aux couleurs de la charte (ordinateur et 360 px)", async ({ browser }) => {
    for (const [label, viewport] of [
        ["desktop", { width: 1366, height: 900 }],
        ["mobile-360", MOBILE],
    ] as const) {
        const context = await browser.newContext({ viewport, locale: "fr-FR", isMobile: label !== "desktop", hasTouch: label !== "desktop" });
        const page = await context.newPage();
        await loginCitoyen(page, citoyen);
        // Ralentit les appels serveur de la page de suivi pour observer l'écran de chargement
        await page.route("**/suivi-demande", async (route) => {
            if (route.request().method() === "POST") await new Promise((r) => setTimeout(r, 4000));
            await route.continue();
        });
        await page.goto("/suivi-demande");
        await page.waitForTimeout(800);
        await shot(page, `CA-3.a.1-ecran-de-chargement-${label}`, false);
        const loader = page.locator("[data-slot='loader']");
        await expect(loader).toBeVisible();
        const colors = await brandColorsOnPage(page);
        expect(colors).toContain("orange");
        expect(colors).toContain("vert");
        await expect(loader).toBeHidden({ timeout: 20_000 });
        await context.close();
    }
});
