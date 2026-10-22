import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// US-3.i.b : tableaux et listes de l'administration (données fictives uniquement).
// Prérequis : au moins une demande à traiter (statut « SoumisePayee ») appartenant au citoyen
// fictif ci-dessous (mot de passe hashé en base), et un tarif existant.
const SHOTS_DIR = process.env.SHOTS_DIR;
const DEMANDE_ID = process.env.E2E_DEMANDE_ID || "11111111-aaaa-bbbb-cccc-000000000001";
const stamp = Date.now();
const admin = { nom: "AdminTableaux", prenom: "Fictif", email: `admin.tableaux.${stamp}@exemple.test`, password: "MotDePasse1" };
const citoyen = { email: process.env.E2E_CITOYEN_EMAIL || "citoyen.fictif@exemple.test", password: process.env.E2E_CITOYEN_PASSWORD || "MotDePasseCitoyen1" };

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

async function loginAdmin(page: Page) {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

// La page ne déborde pas de l'écran : tout défilement horizontal se fait dans le tableau.
async function pageNeDebordePas(page: Page) {
    const { scroll, inner } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(inner);
}

// Un élément est accessible sans zoom : visible, et atteignable (défilement du tableau compris).
async function accessible(page: Page, loc: ReturnType<Page["locator"]>) {
    await loc.scrollIntoViewIfNeeded();
    await expect(loc).toBeVisible();
    const box = await loc.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360 + 1);
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
    await page.close();
});

test.describe("CA-3.i.b.1 listes lisibles sur téléphone (360 px)", () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test("liste des demandes : colonnes, filtres et action accessibles", async ({ page }) => {
        await loginAdmin(page);
        await page.goto("/admin/dashboard/liste-demande");
        await expect(page.getByRole("heading", { name: "Liste des demandes" })).toBeVisible();
        await pageNeDebordePas(page);
        for (const filtre of [page.locator("#search"), page.locator("#status-filter"), page.locator("#type-filter")]) {
            await accessible(page, filtre);
        }
        const ligne = page.getByRole("row").filter({ hasText: "11111111" });
        await expect(ligne).toHaveCount(1);
        for (const colonne of ["Référence", "Type", "Nom", "Numéro d acte", "Date", "Statut", "Action"]) {
            await accessible(page, page.locator("th").getByText(colonne, { exact: true }));
        }
        for (const valeur of ["11111111", "Acte de naissance", "ACTE-FICTIF-0001"]) {
            await accessible(page, ligne.getByText(valeur, { exact: false }).first());
        }
        await accessible(page, ligne.getByRole("link", { name: "Détails" }));
        await shot(page, "CA-3.i.b.1-demandes-360");
    });

    test("liste des agents : colonnes et action accessibles", async ({ page }) => {
        await loginAdmin(page);
        await page.goto("/admin/dashboard/agents");
        await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();
        await pageNeDebordePas(page);
        await accessible(page, page.getByRole("button", { name: "Ajouter un agent" }));
        for (const colonne of ["Type", "Nom", "Email", "Action"]) {
            await accessible(page, page.locator("th").getByText(colonne, { exact: true }));
        }
        const ligne = page.getByRole("row").filter({ hasText: admin.email });
        await accessible(page, ligne.getByText(admin.email));
        await accessible(page, ligne.getByRole("link", { name: "Voir" }));
        await shot(page, "CA-3.i.b.1-agents-360");
    });

    test("liste des tarifs : colonnes et action accessibles", async ({ page }) => {
        await loginAdmin(page);
        await page.goto("/admin/dashboard/tarif");
        await expect(page.getByRole("heading", { name: "Tarifs" })).toBeVisible();
        await pageNeDebordePas(page);
        await accessible(page, page.getByRole("button", { name: "Ajouter un tarif" }));
        for (const colonne of ["Type", "Prix timbre", "Prix expedition", "Action"]) {
            await accessible(page, page.locator("th").getByText(colonne, { exact: true }));
        }
        const ligne = page.getByRole("row").filter({ hasText: "Naissance" });
        await accessible(page, ligne.getByRole("button"));
        await shot(page, "CA-3.i.b.1-tarifs-360");
    });

    test("détail d'une demande : page sans débordement", async ({ page }) => {
        await loginAdmin(page);
        await page.goto(`/admin/dashboard/details-demande/${DEMANDE_ID}`);
        await expect(page.getByRole("heading", { name: "Détails de la demande" })).toBeVisible();
        await pageNeDebordePas(page);
        await accessible(page, page.getByRole("button", { name: "M'occuper de la demande" }));
        await shot(page, "CA-3.i.b.1-detail-360");
    });
});

test("CA-3.i.b.2 sans compte agent : renvoi vers la connexion, aucune donnée personnelle", async ({ page }) => {
    for (const url of ["/admin/dashboard/liste-demande", `/admin/dashboard/details-demande/${DEMANDE_ID}`]) {
        await page.goto(url);
        await expect(page).toHaveURL(/\/admin\?redirect=/);
        await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
        const texte = await page.locator("body").innerText();
        expect(texte).not.toContain("CitoyenFictif");
        expect(texte).not.toContain("citoyen.fictif@exemple.test");
        await shot(page, `CA-3.i.b.2-${url.includes("details") ? "detail" : "liste"}`);
    }
});

test("CA-3.i.2 traitement d'une demande non régressif, état visible côté citoyen", async ({ page, browser }) => {
    await loginAdmin(page);
    await page.goto("/admin/dashboard/liste-demande");
    await page.getByRole("row").filter({ hasText: "11111111" }).getByRole("link", { name: "Détails" }).click();
    await expect(page).toHaveURL(new RegExp(`/details-demande/${DEMANDE_ID}$`));
    await page.getByRole("button", { name: "M'occuper de la demande" }).first().click();
    await expect(page.getByRole("button", { name: "Valider la demande" })).toBeVisible();
    await shot(page, "CA-3.i.2-agent");

    const ctx = await browser.newContext({ locale: "fr-FR" });
    const citoyenPage = await ctx.newPage();
    await citoyenPage.goto("/login");
    await citoyenPage.getByLabel("Email").fill(citoyen.email);
    await citoyenPage.getByLabel("Mot de passe").fill(citoyen.password);
    await citoyenPage.getByRole("button", { name: "Se connecter" }).click();
    await citoyenPage.waitForURL((u) => !u.pathname.startsWith("/login"));
    await citoyenPage.goto("/suivi-demande");
    await expect(citoyenPage.getByText("En cours de traitement").first()).toBeVisible();
    await shot(citoyenPage, "CA-3.i.2-citoyen");
    await ctx.close();
});
