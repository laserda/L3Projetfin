import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// US-3.j — Pages de connexion (/admin), d'inscription (/admin/register) et « introuvable » de l'administration.
// Données fictives uniquement. SHOTS_DIR : dossier des captures (optionnel).

const SHOTS_DIR = process.env.SHOTS_DIR;
const stamp = Date.now();
const agent = {
    nom: "Agent",
    prenom: "Fictif",
    email: `agent.us3j.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

async function connecter(page: Page, email: string, password: string) {
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(agent.nom);
    await page.getByLabel("Prénom").fill(agent.prenom);
    await page.getByLabel("Email").fill(agent.email);
    await page.getByLabel("Mot de passe").fill(agent.password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
    await page.close();
});

test("CA-3.10 nouveau design : carte d'entrée en couleurs du thème sur connexion et inscription", async ({ page }) => {
    for (const url of ["/admin", "/admin/register"]) {
        await page.goto(url);
        const carte = page.locator("[data-slot=card]");
        await expect(carte).toHaveClass(/border-t-primary/);
        await expect(carte).toHaveClass(/rounded-xl/);
        await expect(page.locator("[data-slot=logo]")).toBeVisible();
        // La bordure haute reprend la couleur primaire du thème (variable CSS), pas une couleur fixe
        const attendu = await page.evaluate(() => {
            const probe = document.createElement("div");
            probe.className = "border-t-4 border-t-primary";
            document.body.appendChild(probe);
            const c = getComputedStyle(probe).borderTopColor;
            probe.remove();
            return c;
        });
        expect(await carte.evaluate((e) => getComputedStyle(e).borderTopColor)).toBe(attendu);
        await shot(page, `CA-3.10-${url === "/admin" ? "connexion" : "inscription"}-bureau`);
    }
});

test("CA-3.j.1 / CA-3.10 identifiants valides : accès au tableau de bord", async ({ page }) => {
    await page.goto("/admin");
    await connecter(page, agent.email, agent.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.locator("header h1")).toContainText(agent.email);
    await shot(page, "CA-3.j.1-tableau-de-bord-apres-connexion");
});

test("CA-3.10 identifiants erronés : message clair, on reste sur la page", async ({ page, context }) => {
    await page.goto("/admin");
    await connecter(page, agent.email, "Mauvais1234");
    const item = page.locator('[data-slot="form-item"]', { has: page.getByLabel("Mot de passe") });
    await expect(item.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
    expect((await context.cookies()).some((c) => /session/i.test(c.name))).toBe(false);
    await shot(page, "CA-3.10-identifiants-errones");
});

test("CA-3.10 connexion avec e-mail inconnu : même message, on reste sur la page", async ({ page }) => {
    await page.goto("/admin");
    await connecter(page, `inconnu.${stamp}@exemple.test`, "MotDePasse1");
    await expect(page.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
});

test("CA-3.j.2 inscription vide : message en français sous chaque champ obligatoire, rien d'envoyé", async ({ page }) => {
    const envois: string[] = [];
    page.on("request", (r) => {
        if (r.method() === "POST") envois.push(r.url());
    });
    await page.goto("/admin/register");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    const messages = page.locator("form p.text-destructive");
    await expect(messages).toHaveCount(4);
    for (const champ of [
        page.getByLabel("Nom", { exact: true }),
        page.getByLabel("Prénom"),
        page.getByLabel("Email"),
        page.getByLabel("Mot de passe"),
    ]) {
        await expect(champ).toHaveAttribute("aria-invalid", "true");
    }
    await expect(page.getByText("Veuillez saisir votre nom.")).toBeVisible();
    await expect(page.getByText("Veuillez saisir votre prénom.")).toBeVisible();
    await expect(page.getByText("Veuillez saisir votre adresse e-mail.")).toBeVisible();
    await expect(page.getByText("Veuillez saisir votre mot de passe.")).toBeVisible();
    const textes = (await messages.allTextContents()).join(" ");
    expect(textes).not.toMatch(/Invalid|must be|Required/);
    await page.waitForTimeout(500);
    expect(envois).toHaveLength(0);
    await expect(page).toHaveURL(/\/admin\/register$/);
    await shot(page, "CA-3.j.2-inscription-vide");
});

test("inscription : mêmes règles, messages en français (e-mail invalide, mot de passe court)", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill("Ab");
    await page.getByLabel("Prénom").fill("Ab");
    await page.getByLabel("Email").fill("pas-un-email");
    await page.getByLabel("Mot de passe").fill("court");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Le nom doit contenir au moins 3 caractères")).toBeVisible();
    await expect(page.getByText("Le prénom doit contenir au moins 3 caractères")).toBeVisible();
    await expect(page.getByText("Veuillez saisir une adresse e-mail valide.")).toBeVisible();
    await expect(page.getByText("Le mot de passe doit contenir au moins 8 caractères.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/register$/);
});

test("inscription : un e-mail déjà utilisé affiche une erreur sur la page", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(agent.nom);
    await page.getByLabel("Prénom").fill(agent.prenom);
    await page.getByLabel("Email").fill(agent.email);
    await page.getByLabel("Mot de passe").fill(agent.password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.locator("[data-slot=alert]")).toContainText("Cet email est déjà utilisé");
    await expect(page).toHaveURL(/\/admin\/register$/);
});

test("CA-3.10 adresse inconnue de l'administration : page « introuvable » avec lien de retour", async ({ page }) => {
    await page.goto("/admin");
    await connecter(page, agent.email, agent.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    for (const url of ["/admin/adresse-inconnue", "/admin/dashboard/page-inconnue"]) {
        const reponse = await page.goto(url);
        expect(reponse?.status()).toBe(404);
        await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
        await expect(page.locator("[data-slot=logo]")).toBeVisible();
        await expect(page.getByText("This page could not be found")).toHaveCount(0);
        await shot(page, `CA-3.10-introuvable-${url.includes("dashboard") ? "tableau-de-bord" : "admin"}`);
        const lien = page.getByRole("link", { name: "Retour à l'accueil" });
        await expect(lien).toHaveAttribute("href", "/");
        await lien.click();
        await expect(page).toHaveURL(/\/(login)?$/);
    }
});

test.describe("téléphone 360 px", () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test("connexion, inscription et introuvable : champs de 44 px, sans défilement horizontal", async ({ page }) => {
        for (const url of ["/admin", "/admin/register"]) {
            await page.goto(url);
            const champs = page.locator("form input");
            const total = await champs.count();
            expect(total).toBeGreaterThanOrEqual(2);
            for (let i = 0; i < total; i++) {
                expect((await champs.nth(i).boundingBox())!.height).toBeGreaterThanOrEqual(44);
            }
            expect((await page.locator("form button[type=submit]").boundingBox())!.height).toBeGreaterThanOrEqual(44);
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
            ).toBe(false);
            await shot(page, `360-${url === "/admin" ? "connexion" : "inscription"}`);
        }
        await page.goto("/admin");
        await connecter(page, agent.email, agent.password);
        await expect(page).toHaveURL(/\/admin\/dashboard$/);
        await page.goto("/admin/adresse-inconnue");
        await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
        expect(
            await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
        ).toBe(false);
        await shot(page, "360-introuvable");
    });
});