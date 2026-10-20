import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// US-3.i.a : menu latéral de l'administration (données fictives uniquement).
const SHOTS_DIR = process.env.SHOTS_DIR;
const stamp = Date.now();
const admin = { nom: "AdminMenu", prenom: "Fictif", email: `admin.menu.${stamp}@exemple.test`, password: "MotDePasse1" };
const simple = { nom: "AgentMenu", prenom: "Fictif", email: `agent.menu.${stamp}@exemple.test`, password: "MotDePasse2" };

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

async function register(page: Page, a: typeof admin, role: "Agent" | "Administrateur") {
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(a.nom);
    await page.getByLabel("Prénom").fill(a.prenom);
    await page.getByLabel("Email").fill(a.email);
    await page.getByLabel("Mot de passe").fill(a.password);
    if (role === "Administrateur") {
        await page.getByRole("combobox").click();
        await page.getByRole("option", { name: "Administrateur" }).click();
    }
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
}

async function login(page: Page, a: typeof admin) {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(a.email);
    await page.getByLabel("Mot de passe").fill(a.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

const entrees = [
    { nom: "Tableau de bord", href: "/admin/dashboard" },
    { nom: "Demandes", href: "/admin/dashboard/liste-demande" },
    { nom: "Statistiques", href: "/admin/dashboard/stats" },
    { nom: "Agents", href: "/admin/dashboard/agents" },
    { nom: "Tarifs", href: "/admin/dashboard/tarif" },
];

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await register(page, admin, "Administrateur");
    await register(page, simple, "Agent");
    await page.close();
});

test("CA-3.i.a.1 administrateur : toutes les entrées, mêmes pages qu'avant", async ({ page }) => {
    await login(page, admin);
    const nav = page.locator("aside nav");
    for (const e of entrees) {
        await expect(nav.getByRole("link", { name: e.nom, exact: true })).toHaveAttribute("href", e.href);
    }
    await expect(page.locator("aside").getByRole("button", { name: "Se déconnecter" })).toBeVisible();
    await shot(page, "CA-3.i.a.1-menu-administrateur");
    await nav.getByRole("link", { name: "Tarifs", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard\/tarif$/);
    await page.locator("aside").getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/admin$/);
});

test("CA-3.i.a.2 agent simple : pas d'entrées Agents ni Tarifs", async ({ page }) => {
    await login(page, simple);
    const nav = page.locator("aside nav");
    for (const nom of ["Tableau de bord", "Demandes", "Statistiques"]) {
        await expect(nav.getByRole("link", { name: nom, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Agents", exact: true })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Tarifs", exact: true })).toHaveCount(0);
    await shot(page, "CA-3.i.a.2-menu-agent-simple");
});

test("CA-3.i.a.3 non connecté renvoyé vers la connexion sans donnée", async ({ page }) => {
    for (const url of ["/admin/dashboard", "/admin/dashboard/liste-demande", "/admin/dashboard/agents"]) {
        await page.goto(url);
        await expect(page).toHaveURL(/\/admin\?redirect=/);
        await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
        await expect(page.locator("aside")).toHaveCount(0);
        await expect(page.getByText(admin.email)).toHaveCount(0);
    }
    await shot(page, "CA-3.i.a.3-non-connecte");
});

test.describe("CA-3.i.3 téléphone 360 px", () => {
    test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

    test("le menu s'ouvre, se ferme, et chaque entrée fait au moins 44 px", async ({ page }) => {
        await login(page, admin);
        const aside = page.locator("aside");
        const hamburger = page.locator("button.fixed");
        await expect(hamburger).toBeVisible();
        expect((await hamburger.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        expect((await aside.boundingBox())!.x).toBeLessThan(0);
        await hamburger.click();
        await expect.poll(async () => (await aside.boundingBox())!.x).toBeGreaterThanOrEqual(0);
        for (const e of entrees) {
            const box = await aside.getByRole("link", { name: e.nom, exact: true }).boundingBox();
            expect(box!.height).toBeGreaterThanOrEqual(44);
        }
        expect((await aside.getByRole("button", { name: "Se déconnecter" }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await shot(page, "CA-3.i.3-menu-ouvert-360px");
        // fermeture au toucher de la zone grisée
        await page.mouse.click(340, 400);
        await expect.poll(async () => (await aside.boundingBox())!.x).toBeLessThan(0);
        // touche d'une entrée : le menu se ferme et la page s'affiche
        await hamburger.click();
        await aside.getByRole("link", { name: "Statistiques", exact: true }).click();
        await expect(page).toHaveURL(/\/admin\/dashboard\/stats$/);
        await expect.poll(async () => (await aside.boundingBox())!.x).toBeLessThan(0);
        await shot(page, "CA-3.i.3-apres-entree-360px");
    });
});