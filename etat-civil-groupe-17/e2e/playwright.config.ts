import { defineConfig, devices } from "@playwright/test";

// Tests de bout en bout de l'espace d'administration.
// Ils visent une application déjà démarrée (base de test, données fictives) :
//   BASE_URL   adresse de l'application (défaut : http://localhost:3000)
//   SHOTS_DIR  dossier où enregistrer une capture par exigence (optionnel)
//   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD / E2E_ADMIN_NOM : compte admin existant (optionnel)
// Exemple avec l'image officielle Playwright :
//   docker run --rm --network <réseau-de-l-app> -e BASE_URL=http://app:3000 \
//     -v "$PWD/e2e:/work/e2e" -w /work mcr.microsoft.com/playwright:v1.56.1-noble \
//     bash -c "npm i --no-save @playwright/test@1.56.1 && npx playwright test -c e2e"
export default defineConfig({
    testDir: ".",
    timeout: 60_000,
    expect: { timeout: 15_000 },
    fullyParallel: false,
    workers: 1,
    reporter: [["list"]],
    use: {
        baseURL: process.env.BASE_URL || "http://localhost:3000",
        locale: "fr-FR",
        trace: "retain-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
