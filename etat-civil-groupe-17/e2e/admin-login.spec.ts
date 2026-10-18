import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// Connexion à l'espace d'administration (/admin) et accès au tableau de bord.
// Données fictives uniquement. Un compte administrateur existant peut être fourni
// via E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD ; sinon un compte est créé pour le test.

const SHOTS_DIR = process.env.SHOTS_DIR;
const stamp = Date.now();

const existingAdmin = {
    email: process.env.E2E_ADMIN_EMAIL || `admin.e2e.${stamp}@exemple.test`,
    password: process.env.E2E_ADMIN_PASSWORD || "MotDePasse1",
    nom: process.env.E2E_ADMIN_NOM || "Testeur",
};

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

async function registerAgent(
    page: Page,
    agent: { nom: string; prenom: string; email: string; password: string },
    role: "Agent" | "Administrateur" = "Administrateur"
) {
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(agent.nom);
    await page.getByLabel("Prénom").fill(agent.prenom);
    await page.getByLabel("Email").fill(agent.email);
    await page.getByLabel("Mot de passe").fill(agent.password);
    if (role === "Administrateur") {
        await page.getByRole("combobox").click();
        await page.getByRole("option", { name: "Administrateur" }).click();
    }
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
}

async function loginAdmin(page: Page, email: string, password: string) {
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
}

async function expectNoHorizontalScroll(page: Page) {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
    if (process.env.E2E_ADMIN_EMAIL) return;
    const page = await browser.newPage();
    await registerAgent(page, {
        nom: existingAdmin.nom,
        prenom: "Fictif",
        email: existingAdmin.email,
        password: existingAdmin.password,
    });
    await page.close();
});

test("CA-2.1 un administrateur existant arrive sur le tableau de bord", async ({ page }) => {
    await page.goto("/admin");
    await loginAdmin(page, existingAdmin.email, existingAdmin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.locator("header h1")).toContainText(existingAdmin.email);
    await expect(page.locator("header h1")).toContainText(existingAdmin.nom);
    await shot(page, "CA-2.1-admin-existant-tableau-de-bord");
});

test("CA-2.2 un compte tout juste créé se connecte immédiatement", async ({ page }) => {
    const nouveau = {
        nom: "Nouveau",
        prenom: "Fictif",
        email: `nouveau.${stamp}@exemple.test`,
        password: "MotDePasse2",
    };
    await registerAgent(page, nouveau);
    await expect(page.getByText("Votre compte a bien été créé")).toBeVisible();
    await loginAdmin(page, nouveau.email, nouveau.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.locator("header h1")).toContainText(nouveau.email);
    await shot(page, "CA-2.2-nouveau-compte-tableau-de-bord");
});

test("CA-2.3 mot de passe erroné : message sous le champ, reste sur /admin", async ({ page }) => {
    await page.goto("/admin");
    await loginAdmin(page, existingAdmin.email, "MauvaisMotDePasse9");
    const passwordItem = page.locator('[data-slot="form-item"]', { has: page.getByLabel("Mot de passe") });
    await expect(passwordItem.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
    await shot(page, "CA-2.3-mot-de-passe-errone");
});

test("CA-2.4 champs vides : message sous chaque champ, reste sur /admin", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Veuillez saisir votre adresse e-mail.")).toBeVisible();
    await expect(page.getByText("Veuillez saisir votre mot de passe.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
    await shot(page, "CA-2.4-champs-vides");
});

test("CA-2.5 accès direct non connecté : connexion puis retour à la page demandée", async ({ page }) => {
    await page.goto("/admin/dashboard/stats");
    await expect(page).toHaveURL(/\/admin\?redirect=%2Fadmin%2Fdashboard%2Fstats$/);
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
    await shot(page, "CA-2.5a-redirection-vers-connexion");
    await loginAdmin(page, existingAdmin.email, existingAdmin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard\/stats$/);
    await shot(page, "CA-2.5b-page-demandee-apres-connexion");
});

test("CA-2.6 pages publiques inchangées pour un visiteur", async ({ page }) => {
    for (const url of ["/", "/nos-service", "/login"]) {
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        await expect(page).toHaveURL(new RegExp(`${url === "/" ? "/$" : url + "$"}`));
    }
    await page.goto("/");
    await shot(page, "CA-2.6-accueil-visiteur");
});

test("CA-2.13 navigation dans plusieurs pages du tableau de bord", async ({ page }) => {
    await page.goto("/admin");
    await loginAdmin(page, existingAdmin.email, existingAdmin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    for (const url of [
        "/admin/dashboard/liste-demande",
        "/admin/dashboard/stats",
        "/admin/dashboard/agents",
        "/admin/dashboard/tarif",
        "/admin/dashboard",
    ]) {
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        await expect(page).toHaveURL(new RegExp(`${url}$`));
        await expect(page.locator("header h1")).toContainText(existingAdmin.email);
        await expect(page.getByText("Application error")).toHaveCount(0);
    }
    // Navigation par le menu (côté client) : la connexion reste active
    await page.getByRole("link", { name: "Statistiques" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard\/stats$/);
    await shot(page, "CA-2.13-navigation-tableau-de-bord");
});

test("CA-2.7 déconnexion : tableau de bord inaccessible ensuite", async ({ page }) => {
    await page.goto("/admin");
    await loginAdmin(page, existingAdmin.email, existingAdmin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\?redirect=%2Fadmin%2Fdashboard$/);
    await shot(page, "CA-2.7-apres-deconnexion");
});

test.describe("CA-2.8 téléphone 360 px", () => {
    test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

    test("connexion et tableau de bord sans défilement horizontal", async ({ page }) => {
        await page.goto("/admin");
        await expectNoHorizontalScroll(page);
        const button = await page.getByRole("button", { name: "Se connecter" }).boundingBox();
        expect(button?.height ?? 0).toBeGreaterThanOrEqual(36);
        await shot(page, "CA-2.8a-connexion-360px");
        await loginAdmin(page, existingAdmin.email, existingAdmin.password);
        await expect(page).toHaveURL(/\/admin\/dashboard$/);
        await expectNoHorizontalScroll(page);
        // L'en-tête fixe ne recouvre pas le titre de la page
        const header = await page.locator("header").boundingBox();
        const title = await page.getByRole("heading", { name: "Tableau de bord" }).boundingBox();
        expect(title!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
        await shot(page, "CA-2.8b-tableau-de-bord-360px");
    });
});

test("Non-régression citoyen : après connexion, retour à l'accueil comme avant", async ({ page }) => {
    const citoyen = { email: `citoyen.${stamp}@exemple.test`, password: "MotDePasse3" };
    await page.goto("/register");
    await page.getByLabel("Nom", { exact: true }).fill("Citoyen");
    await page.getByLabel("Prénom").fill("Fictif");
    await page.getByLabel("Date de naissance").fill("1990-01-01");
    await page.getByLabel("Lieu de naissance").fill("Abidjan");
    await page.getByLabel("Téléphone").fill("0102030405");
    await page.getByLabel("Adresse").fill("Rue fictive");
    await page.getByLabel("Email").fill(citoyen.email);
    await page.getByLabel("Mot de passe").fill(citoyen.password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill(citoyen.email);
    await page.getByLabel("Mot de passe").fill(citoyen.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
    await shot(page, "NR-citoyen-connexion-accueil");
});
