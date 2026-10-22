import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// US-3.d — Pages de connexion (/login) et d'inscription (/register) refondues.
// Données fictives uniquement. SHOTS_DIR : dossier des captures (optionnel).

const SHOTS_DIR = process.env.SHOTS_DIR;
const stamp = Date.now();
const compte = {
    nom: "Testeur",
    prenom: "Citoyen",
    naissance: "1990-05-12",
    lieu: "Abidjan",
    telephone: "0102030405",
    adresse: "Rue des Tests 12",
    email: `citoyen.e2e.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

test.use({ viewport: { width: 360, height: 740 } });

async function remplirInscription(page: Page, email: string) {
    await page.getByLabel("Nom", { exact: true }).fill(compte.nom);
    await page.getByLabel("Prénom").fill(compte.prenom);
    await page.getByLabel("Date de naissance").fill(compte.naissance);
    await page.getByLabel("Lieu de naissance").fill(compte.lieu);
    await page.getByLabel("Téléphone").fill(compte.telephone);
    await page.getByLabel("Adresse").fill(compte.adresse);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(compte.password);
}

test("CA-3.4 — champs et boutons d'au moins 44 px sur 360 px, sans défilement horizontal", async ({ page }) => {
    for (const url of ["/login", "/register"]) {
        await page.goto(url);
        const champs = page.locator("form input");
        const total = await champs.count();
        expect(total).toBeGreaterThanOrEqual(2);
        for (let i = 0; i < total; i++) {
            const box = await champs.nth(i).boundingBox();
            expect(box!.height).toBeGreaterThanOrEqual(44);
        }
        const bouton = await page.locator("form button[type=submit]").boundingBox();
        expect(bouton!.height).toBeGreaterThanOrEqual(44);
        const debordement = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(debordement).toBe(false);
        await shot(page, `CA-3.4-${url.slice(1)}-360`);
    }
});

test("CA-3.d.1 — inscription vide : message en français sous chaque champ, rien d'envoyé", async ({ page }) => {
    const envois: string[] = [];
    page.on("request", (r) => {
        if (r.method() === "POST") envois.push(r.url());
    });
    await page.goto("/register");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    const messages = page.locator("form p.text-destructive");
    await expect(messages).toHaveCount(8);
    for (const nom of ["Nom", "Prénom", "Date de naissance", "Lieu de naissance", "Téléphone", "Adresse", "Email", "Mot de passe"]) {
        const champ = page.getByLabel(nom, { exact: nom === "Nom" });
        await expect(champ).toHaveAttribute("aria-invalid", "true");
    }
    const textes = await messages.allTextContents();
    expect(textes.join(" ")).not.toMatch(/\bInvalid\b|must be|\bRequired\b/);
    expect(textes).toContain("Veuillez saisir votre adresse e-mail");
    expect(textes).toContain("Veuillez indiquer votre date de naissance");
    expect(textes).toContain("Le mot de passe doit contenir au moins 8 caractères");
    await page.waitForTimeout(500);
    expect(envois).toHaveLength(0);
    await expect(page).toHaveURL(/\/register$/);
    await shot(page, "CA-3.d.1-inscription-vide-360");
});

test("CA-3.4 — connexion avec champs vides : messages sous les champs, rien d'envoyé", async ({ page }) => {
    const envois: string[] = [];
    page.on("request", (r) => {
        if (r.method() === "POST") envois.push(r.url());
    });
    await page.goto("/login");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator("form p.text-destructive")).toHaveCount(2);
    await expect(page.getByText("Veuillez saisir votre adresse e-mail")).toBeVisible();
    await expect(page.getByText("Le mot de passe doit contenir au moins 8 caractères").first()).toBeVisible();
    await page.waitForTimeout(500);
    expect(envois).toHaveLength(0);
    await shot(page, "CA-3.4-connexion-vide-360");
});

test("e-mail mal formé : message en français sous le champ", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("pas-un-email");
    await page.getByLabel("Mot de passe").fill("MotDePasse1");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Veuillez saisir une adresse e-mail valide")).toBeVisible();
});

test("CA-3.4 — inscription puis connexion valide conduisent à l'accueil connecté", async ({ page, context }) => {
    await page.goto("/register");
    await remplirInscription(page, compte.email);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);
    await context.clearCookies();

    await page.goto("/login");
    await page.getByLabel("Email").fill(compte.email);
    await page.getByLabel("Mot de passe").fill(compte.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
    await shot(page, "CA-3.4-apres-connexion-360");
});

test("CA-3.d.2 — mot de passe erroné : erreur sur la page, aucun accès", async ({ page, context }) => {
    // crée le compte, puis se déconnecte
    await page.goto("/register");
    const email = `citoyen.err.${stamp}@exemple.test`;
    await remplirInscription(page, email);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);
    await context.clearCookies();

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill("Mauvais1234");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator("[data-slot=alert]")).toContainText("Email ou Mot de passe incorrect");
    await expect(page).toHaveURL(/\/login$/);
    const cookies = await context.cookies();
    expect(cookies.some((c) => /session/i.test(c.name))).toBe(false);
    await shot(page, "CA-3.d.2-mot-de-passe-errone-360");
});
