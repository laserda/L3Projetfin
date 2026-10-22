import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// Page de paiement /paiement/[id] : affichage sans erreur serveur ("window is not defined"),
// montant en FCFA sans décimales, bouton de paiement utilisable (y compris sur téléphone 360 px).
// Nécessite une demande fictive en attente de paiement et un tarif défini pour son type d'acte :
//   E2E_DEMANDE_ID     identifiant de cette demande (défaut : demande-fictive-1)
//   E2E_MONTANT        montant attendu en FCFA (défaut : 1500)
//   SHOTS_DIR          dossier où enregistrer une capture par exigence (optionnel)

const SHOTS_DIR = process.env.SHOTS_DIR;
const DEMANDE_ID = process.env.E2E_DEMANDE_ID || "demande-fictive-1";
const MONTANT = process.env.E2E_MONTANT || "1500";
// Montant affiché au format « 15 000 FCFA » (US-3.g) : chiffres groupés par trois
const MONTANT_AFFICHE = `${MONTANT.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
const MONTANT_REGEX = MONTANT_AFFICHE.replace(/ /g, "[\\s\\u00a0]");

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

test("CA-2.9 / CA-2.10 : la page de paiement s'affiche sans erreur", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    const response = await page.goto(`/paiement/${DEMANDE_ID}`);
    expect(response?.status()).toBe(200);

    await expect(page.getByText("Faite le paiement de votre demande Acte de naissance")).toBeVisible();
    await expect(page.getByText(MONTANT_AFFICHE)).toBeVisible();
    await expect(page.getByRole("button", { name: "Payer" })).toBeEnabled();
    expect(await page.locator("body").innerText()).not.toMatch(/window is not defined|Application error/i);
    expect(pageErrors.filter((m) => /window is not defined/.test(m))).toEqual([]);
    await shot(page, "01-ca-2.9-ca-2.10-page-paiement");
});

test("CA-2.11 : le clic sur Payer lance l'étape suivante, montant sans décimales", async ({ page }) => {
    const requetesPaystack: string[] = [];
    page.on("request", (r) => {
        if (/paystack/i.test(r.url())) requetesPaystack.push(r.url());
    });
    await page.goto(`/paiement/${DEMANDE_ID}`);
    await expect(page.getByText(MONTANT_AFFICHE)).toBeVisible();
    const texte = await page.locator("body").innerText();
    expect(texte).toMatch(new RegExp(MONTANT_REGEX));
    expect(texte).not.toMatch(/[0-9][.,][0-9]+ *FCFA/);

    const bouton = page.getByRole("button", { name: "Payer" });
    await bouton.click();
    // Le bouton passe à l'état "chargement" (désactivé, libellé remplacé par un indicateur) et la fenêtre de paiement Paystack est sollicitée.
    await expect(page.locator('button[data-slot="button"]:disabled')).toHaveCount(1);
    await expect.poll(() => requetesPaystack.length).toBeGreaterThan(0);
    await shot(page, "02-ca-2.11-clic-payer");
});

test("CA-2.12 : affichage sur téléphone 360 px", async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 360, height: 740 },
        hasTouch: true,
        isMobile: true,
        locale: "fr-FR",
    });
    const page = await context.newPage();
    await page.goto(`/paiement/${DEMANDE_ID}`);
    const bouton = page.getByRole("button", { name: "Payer" });
    await expect(bouton).toBeEnabled();
    await expect(page.getByText(MONTANT_AFFICHE)).toBeVisible();

    const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(debordement).toBeLessThanOrEqual(0);
    const box = await bouton.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(36);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    await shot(page, "03-ca-2.12-mobile-360");
    await context.close();
});
