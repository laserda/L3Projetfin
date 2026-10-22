import { test, expect, type Page, type Browser } from "@playwright/test";
import path from "node:path";

// Refonte des pages de demande d'acte de mariage et de décès (US-3.f) : même structure
// visuelle que la demande d'acte de naissance (CA-3.6, CA-3.f.1), message sous le champ
// obligatoire vide sans envoi (CA-3.f.2), demande valide -> page de paiement comme avant.
// Données fictives uniquement.
//   SHOTS_DIR  dossier où enregistrer une capture par exigence (optionnel)

const SHOTS_DIR = process.env.SHOTS_DIR;
const stamp = Date.now();
const MOBILE = { width: 360, height: 740 };

const admin = {
    nom: "Testeur",
    prenom: "Fictif",
    email: `admin.mariage.${stamp}@exemple.test`,
    password: "MotDePasse1",
};
const citoyen = {
    nom: "Brou",
    prenom: "Fictif",
    dateNaissance: "1992-04-18",
    lieu: "Bouaké",
    telephone: "+2250708091011",
    adresse: "Rue fictive 7, Plateau",
    email: `citoyen.mariage.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

const PAGES = [
    { nom: "naissance", url: "/nouvelle-demande-naissance?type=Naissance", titre: "Demande d'acte de naissance" },
    { nom: "mariage", url: "/nouvelle-demande-mariage?type=Mariage", titre: "Demande d'acte de mariage" },
    { nom: "décès", url: "/nouvelle-demande-deces?type=Décès", titre: "Demande d'acte de décès" },
];

async function shot(page: Page, name: string, fullPage = true) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage });
}

async function mobileContext(browser: Browser) {
    return browser.newContext({ viewport: MOBILE, locale: "fr-FR", isMobile: true, hasTouch: true });
}

async function loginCitoyen(page: Page) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(citoyen.email);
    await page.getByLabel("Mot de passe").fill(citoyen.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
}

// Structure visuelle relevée dans la page : cadre, titres, sections, champs, bloc des frais, bouton
async function structure(page: Page) {
    return page.evaluate(() => {
        const px = (el: Element, p: string) => (getComputedStyle(el) as any)[p] as string;
        const un = (sel: string) => document.querySelector(sel);
        const cadre = un("[data-slot='demande-form']")!;
        const carte = cadre.querySelector("[data-slot='card']")!;
        const titre = cadre.querySelector("[data-slot='card-title']")!;
        const section = cadre.querySelector("[data-slot='demande-section']")!;
        const grille = section.querySelector(":scope > div")!;
        const champ = cadre.querySelector("form input:not([type=hidden])")!;
        const frais = cadre.querySelector("form .bg-muted")!;
        const bouton = cadre.querySelector("[data-slot='demande-actions'] button")!;
        const sousTitreSection = cadre.querySelector("[data-slot='demande-section'] h3");
        return {
            cadreMaxWidth: px(cadre, "maxWidth"),
            cartePadding: px(carte, "paddingTop") + "/" + px(carte, "gap"),
            titreTaille: px(titre, "fontSize") + "/" + px(titre, "fontWeight"),
            sectionPadding: px(section, "padding") + "/" + px(section, "borderTopWidth") + "/" + px(section, "borderRadius"),
            grilleGap: px(grille, "rowGap") + "/" + px(grille, "columnGap"),
            champHauteur: px(champ, "height") + "/" + px(champ, "fontSize"),
            fraisPadding: px(frais, "padding") + "/" + px(frais, "borderRadius"),
            fraisTitre: px(frais.querySelector("h3")!, "fontWeight"),
            boutonHauteur: px(bouton, "height") + "/" + px(bouton, "width") + "/" + px(bouton, "fontSize"),
            sousTitreSection: sousTitreSection ? px(sousTitreSection, "fontSize") + "/" + px(sousTitreSection, "fontWeight") : null,
            ecartSections: Array.from(document.querySelectorAll("form > *"))
                .map((e) => px(e, "marginTop"))
                .filter((_, i) => i > 0)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(","),
        };
    });
}

async function erreurSousLeChamp(page: Page, champ: ReturnType<Page["getByLabel"]>, message: string) {
    await expect(champ).toHaveAttribute("aria-invalid", "true");
    const item = page.locator("[data-slot='form-item']").filter({ has: champ });
    const msg = item.locator("[data-slot='form-message']");
    await expect(msg).toHaveText(message);
    await expect(msg).toBeVisible();
    const id = await msg.getAttribute("id");
    expect(await champ.getAttribute("aria-describedby")).toContain(id!);
    const ecart = await champ.evaluate((el, msgId) => {
        const c = el.getBoundingClientRect();
        const m = document.getElementById(msgId)!.getBoundingClientRect();
        return m.top - c.bottom;
    }, id!);
    expect(ecart).toBeGreaterThanOrEqual(-1);
    expect(ecart).toBeLessThan(24);
}

async function sansDebordement(page: Page) {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
}

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
    await page.goto("/admin/dashboard/tarif");
    await page.waitForLoadState("networkidle");
    for (const [ligne, option] of [
        ["Naissance", "Acte de naissance"],
        ["Mariage", "Acte de mariage"],
        ["Décès", "Acte de décès"],
    ]) {
        if ((await page.locator("tbody tr", { hasText: ligne }).count()) === 0) {
            await page.getByText("Ajouter un tarif").click();
            const dialog = page.getByRole("dialog");
            await dialog.getByRole("combobox").click();
            await page.getByRole("option", { name: option }).click();
            await dialog.getByLabel("Frais de timbre").fill("1500");
            await dialog.getByLabel("Frais d'expedition").fill("5000");
            await dialog.getByRole("button", { name: "Enregistrer" }).click();
            await expect(page.locator("tbody tr", { hasText: ligne })).toHaveCount(1);
        }
    }
    await page.close();

    const context = await browser.newContext();
    const reg = await context.newPage();
    await reg.goto("/register");
    await reg.getByLabel("Nom", { exact: true }).fill(citoyen.nom);
    await reg.getByLabel("Prénom", { exact: true }).fill(citoyen.prenom);
    await reg.getByLabel("Date de naissance", { exact: true }).fill(citoyen.dateNaissance);
    await reg.getByLabel("Lieu de naissance", { exact: true }).fill(citoyen.lieu);
    await reg.getByLabel("Téléphone", { exact: true }).fill(citoyen.telephone);
    await reg.getByLabel("Adresse", { exact: true }).fill(citoyen.adresse);
    await reg.getByLabel("Email", { exact: true }).fill(citoyen.email);
    await reg.getByLabel("Mot de passe", { exact: true }).fill(citoyen.password);
    await reg.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(reg).toHaveURL(/\/$/);
    await context.close();
});

test("CA-3.6 / CA-3.f.1 — les 3 pages ont la même structure visuelle", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    const relevés: Record<string, Awaited<ReturnType<typeof structure>>> = {};
    for (const p of PAGES) {
        await page.goto(p.url);
        await expect(page.getByText(p.titre, { exact: true })).toBeVisible();
        await expect(page.getByText("Les frais de timbre s'élèvent à 1500 FCFA pour ce document.")).toBeVisible();
        await expect(page.getByText("Remplissez ce formulaire pour demander votre document officiel.")).toBeVisible();
        await expect(page.getByRole("button", { name: "Soumettre ma demande" })).toBeVisible();
        await sansDebordement(page);
        relevés[p.nom] = await structure(page);
        await shot(page, `CA-3.f.1-${p.nom}-360px`);
    }
    expect(relevés["mariage"]).toEqual(relevés["naissance"]);
    expect(relevés["décès"]).toEqual(relevés["naissance"]);
    // Aucun reste de l'ancien style (séparateurs, titres de section d'avant la refonte)
    for (const p of PAGES.slice(1)) {
        await page.goto(p.url);
        await expect(page.locator("form [data-slot='separator'], form [role='none'].bg-border")).toHaveCount(0);
        await expect(page.locator("[data-slot='demande-section']").first()).toBeVisible();
        await expect(page.locator("form input:not([type=hidden])").first()).toHaveCSS("height", "44px");
    }
    await context.close();
});

test("CA-3.6 — pages en bureau : même cadre, 2 colonnes de champs", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "fr-FR" });
    const page = await context.newPage();
    await loginCitoyen(page);
    const relevés: Record<string, Awaited<ReturnType<typeof structure>>> = {};
    for (const p of PAGES) {
        await page.goto(p.url);
        await expect(page.getByText(p.titre, { exact: true })).toBeVisible();
        relevés[p.nom] = await structure(page);
        await shot(page, `CA-3.f.1-${p.nom}-bureau`);
    }
    expect(relevés["mariage"]).toEqual(relevés["naissance"]);
    expect(relevés["décès"]).toEqual(relevés["naissance"]);
    await context.close();
});

test("CA-3.f.2 — mariage : champ obligatoire vide, message sous le champ, demande non envoyée", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await page.goto(PAGES[1].url);
    await page.waitForLoadState("networkidle");
    const envois: string[] = [];
    page.on("request", (r) => {
        if (r.method() === "POST" && r.headers()["next-action"]) envois.push(r.url());
    });
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await erreurSousLeChamp(page, page.getByLabel("Numéro de l'acte de mariage", { exact: true }), "Le numéro d'acte est requis.");
    await erreurSousLeChamp(page, page.getByLabel("Date du mariage", { exact: true }), "La date de l'acte est requise.");
    await expect(page.locator("[data-slot='form-message']")).toHaveCount(2);
    await shot(page, "CA-3.f.2-mariage-champs-vides-360px");
    // Seule la date manque
    await page.getByLabel("Numéro de l'acte de mariage", { exact: true }).fill("MAR-FICTIF-0001");
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await erreurSousLeChamp(page, page.getByLabel("Date du mariage", { exact: true }), "La date de l'acte est requise.");
    await expect(page.locator("[data-slot='form-message']")).toHaveCount(1);
    await shot(page, "CA-3.f.2-mariage-date-manquante-360px");
    await page.waitForTimeout(1000);
    expect(envois).toEqual([]);
    await expect(page).toHaveURL(/\/nouvelle-demande-mariage/);
    await context.close();
});

test("CA-3.f.2 — décès : champ obligatoire vide, message sous le champ, demande non envoyée", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await page.goto(PAGES[2].url);
    await page.waitForLoadState("networkidle");
    const envois: string[] = [];
    page.on("request", (r) => {
        if (r.method() === "POST" && r.headers()["next-action"]) envois.push(r.url());
    });
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await erreurSousLeChamp(page, page.getByLabel("Numéro de l'acte du décès", { exact: true }), "Le numéro d'acte est requis.");
    await erreurSousLeChamp(page, page.getByLabel("Date de décès", { exact: true }), "La date de l'acte est requise.");
    await erreurSousLeChamp(page, page.getByLabel("Nom du défunt", { exact: true }), "Le nom du défunt est requis.");
    await erreurSousLeChamp(page, page.getByLabel("Prénom du défunt", { exact: true }), "Le prénom du défunt est requis.");
    await shot(page, "CA-3.f.2-deces-champs-vides-360px");
    await page.waitForTimeout(1000);
    expect(envois).toEqual([]);
    await expect(page).toHaveURL(/\/nouvelle-demande-deces/);
    await context.close();
});

test("CA-3.6 — mariage : demande correctement remplie -> page de paiement (3 choix de « Qui fait la demande »)", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);

    const choix = async (option: string) => {
        await page.getByRole("combobox").click();
        await page.getByRole("option", { name: option, exact: true }).click();
        await expect(page.getByRole("combobox")).toContainText(option);
    };

    for (const cas of [
        { qui: "Le mari", titres: ["Epouse"], remplir: async () => {
            await page.getByLabel("Nom", { exact: true }).fill("Koné");
            await page.getByLabel("Prénom", { exact: true }).fill("Awa");
            await page.getByLabel("Date de naissance", { exact: true }).fill("1993-05-02");
        } },
        { qui: "La femme", titres: ["Epoux"], remplir: async () => {
            await page.getByLabel("Nom", { exact: true }).fill("Yao");
            await page.getByLabel("Prénom", { exact: true }).fill("Kouadio");
            await page.getByLabel("Date de naissance", { exact: true }).fill("1990-07-21");
        } },
        { qui: "Autre", titres: ["Epoux", "Epouse"], remplir: async () => {
            for (const [i, v] of [["0", "Yao"], ["1", "Kouadio"]] as const) {
                await page.getByLabel(i === "0" ? "Nom" : "Prénom", { exact: true }).nth(0).fill(v);
            }
            await page.getByLabel("Date de naissance", { exact: true }).nth(0).fill("1990-07-21");
            await page.getByLabel("Nom", { exact: true }).nth(1).fill("Koné");
            await page.getByLabel("Prénom", { exact: true }).nth(1).fill("Awa");
            await page.getByLabel("Date de naissance", { exact: true }).nth(1).fill("1993-05-02");
        } },
    ]) {
        await page.goto(PAGES[1].url);
        await expect(page.getByText("Les frais de timbre s'élèvent à 1500 FCFA pour ce document.")).toBeVisible();
        await page.waitForLoadState("networkidle");
        await choix(cas.qui);
        for (const t of ["Epoux", "Epouse"]) {
            await expect(page.locator("[data-slot='demande-section'] h3", { hasText: new RegExp(`^${t}$`) }))
                .toHaveCount(cas.titres.includes(t) ? 1 : 0);
        }
        await page.getByLabel("Numéro de l'acte de mariage", { exact: true }).fill(`MAR-FICTIF-${cas.qui.length}`);
        await page.getByLabel("Date du mariage", { exact: true }).fill("2015-06-20");
        await cas.remplir();
        await shot(page, `CA-3.6-mariage-${cas.qui.replace(" ", "-")}-rempli-360px`);
        await page.getByRole("button", { name: "Soumettre ma demande" }).click();
        await expect(page).toHaveURL(/\/paiement\/.+/);
    }
    await context.close();
});

test("CA-3.6 — décès : demande correctement remplie -> page de paiement", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await page.goto(PAGES[2].url);
    await expect(page.getByText("Les frais de timbre s'élèvent à 1500 FCFA pour ce document.")).toBeVisible();
    await page.waitForLoadState("networkidle");
    const saisie: Record<string, string> = {
        "Numéro de l'acte du décès": "DEC-FICTIF-0001",
        "Date de décès": "2020-03-11",
        "Nom du défunt": "Koffi",
        "Prénom du défunt": "Jean",
    };
    for (const [l, v] of Object.entries(saisie)) await page.getByLabel(l, { exact: true }).fill(v);
    await page.getByPlaceholder("Nom du père", { exact: true }).fill("Koffi");
    await page.getByPlaceholder("Prénom du père", { exact: true }).fill("Paul");
    await page.getByPlaceholder("Profession du père", { exact: true }).fill("Menuisier");
    await page.getByPlaceholder("Nom de la mère", { exact: true }).fill("Bamba");
    await page.getByPlaceholder("Prénom de la mère", { exact: true }).fill("Awa");
    await page.getByPlaceholder("Profession de la mère", { exact: true }).fill("Couturière");
    await shot(page, "CA-3.6-deces-rempli-360px");
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expect(page).toHaveURL(/\/paiement\/.+/);
    await context.close();
});
