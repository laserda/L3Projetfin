import { test, expect, type BrowserContext } from "@playwright/test";

// Page d'accueil refondue (US-3.c) : accès aux 3 types d'acte, connexion et inscription
// sur téléphone 360 px (boutons d'au moins 44 px), navigation sans erreur, texte et boutons
// affichés avant les images et sans décalage de mise en page.
//   SHOTS_DIR  dossier où enregistrer les captures (optionnel)

const SHOTS_DIR = process.env.SHOTS_DIR;
const MOBILE = { width: 360, height: 740 };

const ACCES = [
    { nom: "Acte de naissance", url: /\/nouvelle-demande-naissance/ },
    { nom: "Acte de mariage", url: /\/nouvelle-demande-mariage/ },
    { nom: "Acte de décès", url: /\/nouvelle-demande-deces/ },
    { nom: "Connexion", url: /\/login/ },
    { nom: "Inscription", url: /\/register/ },
];

test.use({ viewport: MOBILE });

test("CA-3.3 : chaque accès est visible, d'au moins 44 px, sans défilement horizontal", async ({ page }) => {
    await page.goto("/");
    for (const a of ACCES) {
        const lien = page.getByRole("main").getByRole("link", { name: a.nom }).first();
        await expect(lien).toBeVisible();
        const box = await lien.boundingBox();
        expect(box!.height, a.nom).toBeGreaterThanOrEqual(44);
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(scroll).toBe(true);
    if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/CA-3.3-accueil-360.png`, fullPage: true });
});

test("CA-3.3 : les boutons « Faire une demande » font au moins 44 px", async ({ page }) => {
    await page.goto("/");
    const boutons = page.getByRole("button", { name: "Faire une demande" });
    expect(await boutons.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
        const box = await boutons.nth(i).boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
    }
});

// Les pages de demande exigent d'être connecté : un visiteur est renvoyé vers la connexion
// (comportement existant, inchangé), un citoyen connecté arrive sur la demande.
const citoyen = {
    nom: "Kouame",
    prenom: "Fictif",
    dateNaissance: "1991-04-02",
    lieu: "Bouaké",
    telephone: "+2250506070809",
    adresse: "Rue fictive 7, Plateau",
    email: `citoyen.accueil.${Date.now()}@exemple.test`,
    password: "MotDePasse1",
};

let session: Awaited<ReturnType<BrowserContext["storageState"]>>;

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/register");
    await page.getByLabel("Nom", { exact: true }).fill(citoyen.nom);
    await page.getByLabel("Prénom", { exact: true }).fill(citoyen.prenom);
    await page.getByLabel("Date de naissance", { exact: true }).fill(citoyen.dateNaissance);
    await page.getByLabel("Lieu de naissance", { exact: true }).fill(citoyen.lieu);
    await page.getByLabel("Téléphone", { exact: true }).fill(citoyen.telephone);
    await page.getByLabel("Adresse", { exact: true }).fill(citoyen.adresse);
    await page.getByLabel("Email", { exact: true }).fill(citoyen.email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(citoyen.password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/$/);
    session = await context.storageState();
    await context.close();
});

for (const a of ACCES) {
    const demande = a.nom.startsWith("Acte");
    test(`CA-3.c.1 : « ${a.nom} » ouvre la bonne page sans erreur`, async ({ browser }) => {
        const context = await browser.newContext({
            viewport: MOBILE,
            storageState: demande ? session : undefined,
        });
        const page = await context.newPage();
        const erreurs: string[] = [];
        page.on("pageerror", (e) => erreurs.push(e.message));
        await page.goto("/");
        await page.getByRole("main").getByRole("link", { name: a.nom }).first().click();
        await expect(page).toHaveURL(a.url);
        await expect(page.getByRole("main").first()).toBeVisible();
        expect(erreurs).toEqual([]);
        if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/CA-3.c.1-${a.nom.replace(/\W+/g, "-")}.png` });
        await context.close();
    });
}

test("CA-3.c.2 : textes et boutons affichés avec images bloquées, sans décalage", async ({ page }) => {
    await page.route(/\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/, (r) => r.abort());
    await page.addInitScript(() => {
        (window as any).__cls = 0;
        new PerformanceObserver((l) => {
            for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Connexion" })).toBeVisible();
    await page.waitForTimeout(1500);
    const cls = await page.evaluate(() => (window as any).__cls);
    expect(cls).toBeLessThan(0.01);
    if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/CA-3.c.2-sans-images.png`, fullPage: true });
});

test("Règle : aucune couleur codée en dur dans la page d'accueil", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("app/(home)/page.tsx", "utf8");
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/);
});
