import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// US-3.i.c : tableau de bord et statistiques de l'administration (données fictives uniquement).
// Variables d'environnement :
//   E2E_DATABASE_URL  base de test : insertion de 6 demandes fictives (supprimées à la fin)
//                     et comparaison des indicateurs avec la base (module « pg » du projet)
//   SHOTS_DIR         dossier où enregistrer une capture par exigence (optionnel)
// Le test R2 lit le code source : le dossier app/ doit être disponible à côté de e2e/.

const SHOTS_DIR = process.env.SHOTS_DIR;
const DATABASE_URL = process.env.E2E_DATABASE_URL;
const MOBILE = { width: 360, height: 740 };
const CIBLE_TACTILE_MIN = 44;
const stamp = Date.now();
const admin = { nom: "AdminStats", prenom: "Fictif", email: `admin.stats.${stamp}@exemple.test`, password: "MotDePasse1" };
const citoyen = {
    id: `3ic0c170-0000-4000-8000-${String(stamp).slice(-12).padStart(12, "0")}`,
    nom: "CitoyenStatsFictif",
    email: `citoyen.stats.${stamp}@exemple.test`,
};
// 6 demandes datées de 2099 : ce sont les plus récentes de la base. La n° 1 (la plus ancienne)
// ne doit pas figurer parmi les 5 dernières demandes.
const demandes = [
    { n: 1, type: "Naissance", statut: "Livrée", jour: 1 },
    { n: 2, type: "Mariage", statut: "SoumisePayee", jour: 2 },
    { n: 3, type: "Décès", statut: "EnTraitement", jour: 3 },
    { n: 4, type: "Naissance", statut: "Validée", jour: 4 },
    { n: 5, type: "Mariage", statut: "Refusée", jour: 5 },
    { n: 6, type: "Naissance", statut: "SoumisePayee", jour: 6 },
].map((d) => ({ ...d, id: `3ic0000${d.n}-${stamp}`, ref: `3IC0000${d.n}` }));

async function db() {
    const pg = await import("pg");
    const { Client } = (pg as any).default ?? pg;
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    return client;
}

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    // Capture de toute la page : la fenêtre est agrandie à la hauteur du document puis on attend
    // la fin de l'animation des graphiques (1,5 s), relancée par le redimensionnement.
    const vp = page.viewportSize()!;
    const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: vp.width, height: Math.max(hauteur, vp.height) });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`) });
    await page.setViewportSize(vp);
}

async function loginAdmin(page: Page) {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

async function pageNeDebordePas(page: Page) {
    const { scroll, inner } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
    }));
    expect(scroll, "pas de défilement horizontal de la page").toBeLessThanOrEqual(inner);
}

// Élément entièrement visible dans la largeur de l'écran (sans zoom ni défilement horizontal).
async function dansLEcran(loc: Locator, largeur = MOBILE.width) {
    await loc.scrollIntoViewIfNeeded();
    await expect(loc).toBeVisible();
    const box = await loc.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(largeur + 1);
}

// Tous les éléments tactiles visibles à l'écran font au moins 44 px de haut.
async function ciblesTactiles(page: Page) {
    const petites = await page.evaluate((min) => {
        const els = Array.from(
            document.querySelectorAll<HTMLElement>("a[href], button, [role='tab'], input, select, textarea, [role='combobox']")
        );
        return els
            .filter((el) => {
                const r = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                return r.width > 0 && r.height > 0 && style.visibility !== "hidden"
                    && r.right > 0 && r.left < window.innerWidth;
            })
            .map((el) => ({ texte: (el.innerText || el.getAttribute("aria-label") || el.tagName).trim(), h: el.getBoundingClientRect().height }))
            .filter((e) => e.h < min);
    }, CIBLE_TACTILE_MIN);
    expect(petites, "éléments tactiles de moins de 44 px").toEqual([]);
}

// Indicateurs : { titre: valeur } lus dans la zone « Indicateurs ».
async function indicateurs(page: Page) {
    const zone = page.getByRole("region", { name: "Indicateurs" });
    await expect(zone).toBeVisible();
    const cartes = zone.locator('[data-slot="card"]');
    const res: Record<string, string> = {};
    for (const carte of await cartes.all()) {
        const lignes = (await carte.innerText()).split("\n").map((l) => l.trim()).filter(Boolean);
        res[lignes[0]] = lignes.slice(1).join(" ");
    }
    return { zone, cartes, res };
}

async function comptes() {
    const client = await db();
    try {
        const { rows } = await client.query(
            `SELECT "Statut"::text AS s, "TypeActe"::text AS t, count(*)::int AS n FROM "Demande"
             WHERE "Statut" <> 'SoumiseEnAttenteDePaiment' GROUP BY 1, 2`
        );
        const somme = (f: (r: any) => boolean) => rows.filter(f).reduce((a: number, r: any) => a + r.n, 0);
        return {
            total: somme(() => true),
            naissance: somme((r) => r.t === "Naissance"),
            mariage: somme((r) => r.t === "Mariage"),
            deces: somme((r) => r.t === "Décès"),
            attente: somme((r) => r.s === "SoumisePayee"),
            traitement: somme((r) => r.s === "EnTraitement"),
            validee: somme((r) => r.s === "Validée"),
            refusee: somme((r) => r.s === "Refusée"),
            livree: somme((r) => r.s === "Livrée"),
        };
    } finally {
        await client.end();
    }
}

function carteDemandesRecentes(page: Page) {
    return page.locator('[data-slot="card"]').filter({ has: page.getByText("Demandes récentes", { exact: true }) });
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
    await page.getByRole("option", { name: "Agent", exact: true }).click();
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
    await page.close();

    if (!DATABASE_URL) return;
    const client = await db();
    try {
        await client.query(
            `INSERT INTO "Citoyen" ("ID_Citoyen","Nom","Prenom","DateNaissance","LieuNaissance","Adresse","Email","Telephone","Password")
             VALUES ($1,$2,'Fictif','1990-01-01','Ville fictive','Adresse fictive',$3,'0000000000','non-utilise')`,
            [citoyen.id, citoyen.nom, citoyen.email]
        );
        for (const d of demandes) {
            await client.query(
                `INSERT INTO "Demande" ("ID_Demande","ID_Citoyen","TypeActe","Statut","DemandePourTier","DateDemande")
                 VALUES ($1,$2,$3,$4,'Moi',$5)`,
                [d.id, citoyen.id, d.type, d.statut, `2099-01-0${d.jour}T10:00:00Z`]
            );
        }
    } finally {
        await client.end();
    }
});

test.afterAll(async () => {
    if (!DATABASE_URL) return;
    const client = await db();
    try {
        await client.query(`DELETE FROM "Demande" WHERE "ID_Citoyen" = $1`, [citoyen.id]);
        await client.query(`DELETE FROM "Citoyen" WHERE "ID_Citoyen" = $1`, [citoyen.id]);
        await client.query(`DELETE FROM "Agent" WHERE "Email" = $1`, [admin.email]);
    } finally {
        await client.end();
    }
});

test("CA-3.i.1 / R4 sans compte agent : renvoi vers la connexion, aucune donnée personnelle", async ({ page }) => {
    for (const url of ["/admin/dashboard", "/admin/dashboard/stats"]) {
        await page.goto(url);
        await expect(page).toHaveURL(/\/admin\?redirect=/);
        await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
        const texte = await page.locator("body").innerText();
        expect(texte).not.toContain(citoyen.nom);
        expect(texte).not.toContain(citoyen.email);
        expect(texte).not.toContain("Demandes récentes");
        for (const d of demandes) expect(texte).not.toContain(d.ref);
        await shot(page, `CA-3.i.1-non-connecte-${url.endsWith("stats") ? "stats" : "tableau-de-bord"}`);
    }
});

test.describe("CA-3.i.c.1 téléphone 360 px", () => {
    test.use({ viewport: MOBILE, hasTouch: true });

    test("tableau de bord : indicateurs, graphiques et 5 dernières demandes sans scroll horizontal, cibles ≥ 44 px", async ({ page }) => {
        test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : demandes fictives impossibles à créer");
        await loginAdmin(page);
        await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
        await pageNeDebordePas(page);

        const { cartes } = await indicateurs(page);
        await expect(cartes).toHaveCount(6);
        for (const carte of await cartes.all()) await dansLEcran(carte);

        const graphiques = page.locator(".recharts-wrapper");
        await expect(graphiques).toHaveCount(2);
        for (const g of await graphiques.all()) await dansLEcran(g);

        const liste = carteDemandesRecentes(page);
        await dansLEcran(liste);
        const lignes = liste.locator("tbody tr");
        await expect(lignes).toHaveCount(5);
        for (const ligne of await lignes.all()) {
            await dansLEcran(ligne);
            await dansLEcran(ligne.getByRole("link", { name: "Voir" }));
        }
        await pageNeDebordePas(page);
        await ciblesTactiles(page);
        await shot(page, "CA-3.i.c.1-tableau-de-bord-360");
    });

    test("statistiques : indicateurs et graphiques des 3 onglets sans scroll horizontal, cibles ≥ 44 px", async ({ page }) => {
        test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : demandes fictives impossibles à créer");
        await loginAdmin(page);
        await page.goto("/admin/dashboard/stats");
        await expect(page.getByRole("heading", { name: "Statistiques" })).toBeVisible();
        await pageNeDebordePas(page);

        const { cartes } = await indicateurs(page);
        await expect(cartes).toHaveCount(4);
        for (const carte of await cartes.all()) await dansLEcran(carte);

        for (const [onglet, nom] of [["Par type", "type"], ["Par statut", "statut"], ["Évolution temporelle", "evolution"]]) {
            const tab = page.getByRole("tab", { name: onglet });
            await dansLEcran(tab);
            await tab.click();
            await expect(tab).toHaveAttribute("data-state", "active");
            const graphique = page.getByRole("tabpanel").locator(".recharts-wrapper");
            await expect(graphique).toHaveCount(1);
            await dansLEcran(graphique);
            await pageNeDebordePas(page);
            await ciblesTactiles(page);
            await shot(page, `CA-3.i.c.1-statistiques-${nom}-360`);
        }
    });
});

// Tablette et petit écran d'ordinateur (menu latéral affiché) : la liste reste entière dans sa carte.
for (const largeur of [768, 1024]) {
    test.describe(`CA-3.i.c.1 largeur ${largeur} px`, () => {
        test.use({ viewport: { width: largeur, height: 900 } });

        test(`tableau de bord : 5 dernières demandes et action « Voir » visibles sans débordement (${largeur} px)`, async ({ page }) => {
            test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : demandes fictives impossibles à créer");
            await loginAdmin(page);
            await pageNeDebordePas(page);
            const liste = carteDemandesRecentes(page);
            const cadre = (await liste.boundingBox())!;
            const lignes = liste.locator("tbody tr");
            await expect(lignes).toHaveCount(5);
            for (const ligne of await lignes.all()) {
                const voir = ligne.getByRole("link", { name: "Voir" });
                await voir.scrollIntoViewIfNeeded();
                await expect(voir).toBeVisible();
                const box = (await voir.boundingBox())!;
                expect(box.x).toBeGreaterThanOrEqual(cadre.x);
                expect(box.x + box.width).toBeLessThanOrEqual(cadre.x + cadre.width);
                expect(box.x + box.width).toBeLessThanOrEqual(largeur);
                expect(box.height).toBeGreaterThanOrEqual(CIBLE_TACTILE_MIN);
            }
            await shot(page, `CA-3.i.c.1-tableau-de-bord-${largeur}`);
        });
    });
}

test.describe("CA-3.i.c.2 mêmes indicateurs, graphiques et actions", () => {
    test.use({ viewport: { width: 1280, height: 900 } });

    test("tableau de bord : mêmes indicateurs (valeurs de la base) et mêmes graphiques", async ({ page }) => {
        test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : comparaison avec la base impossible");
        await loginAdmin(page);
        const c = await comptes();
        const { res } = await indicateurs(page);
        expect(res).toEqual({
            "Total demandes": String(c.total),
            "En traitement": String(c.traitement),
            "En attente": String(c.attente),
            "Validées": String(c.validee),
            "Livrées": String(c.livree),
            "Refusées": String(c.refusee),
        });

        const type = page.locator('[data-slot="card"]').filter({ has: page.getByText("Répartition par type", { exact: true }) });
        await expect(type.getByText("Distribution des demandes par type de document")).toBeVisible();
        await expect(type.locator(".recharts-pie")).toHaveCount(1);
        await expect(type.locator(".recharts-pie-sector")).toHaveCount(3);
        for (const n of ["Naissance", "Mariage", "Décès"]) {
            await expect(type.locator(".recharts-legend-item-text", { hasText: n })).toBeVisible();
        }

        const statut = page.locator('[data-slot="card"]').filter({ has: page.getByText("Statut des demandes", { exact: true }) });
        await expect(statut.getByText("Répartition des demandes par statut")).toBeVisible();
        await expect(statut.locator(".recharts-bar-rectangle")).toHaveCount(5);
        await expect(statut.locator(".recharts-legend-item-text", { hasText: "Nombre" })).toBeVisible();
        for (const n of ["En attente", "En traitement", "Approuvées", "Rejetées", "Livrées"]) {
            await expect(statut.locator(".recharts-cartesian-axis-tick-value", { hasText: n })).toBeVisible();
        }
        await shot(page, "CA-3.i.c.2-tableau-de-bord-bureau");
    });

    test("tableau de bord : les 5 dernières demandes, de la plus récente à la plus ancienne", async ({ page }) => {
        test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : demandes fictives impossibles à créer");
        await loginAdmin(page);
        const liste = carteDemandesRecentes(page);
        await expect(liste.getByText("Les 5 dernières demandes reçues")).toBeVisible();
        for (const col of ["Référence", "Type", "Nom", "Date", "Statut", "Action"]) {
            await expect(liste.locator("th", { hasText: col })).toBeVisible();
        }
        const lignes = liste.locator("tbody tr");
        await expect(lignes).toHaveCount(5);
        const attendues = demandes.slice(1).reverse(); // n° 6 à 2
        for (let i = 0; i < attendues.length; i++) {
            await expect(lignes.nth(i)).toContainText(attendues[i].ref);
            await expect(lignes.nth(i)).toContainText(new Date(`2099-01-0${attendues[i].jour}T10:00:00Z`).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }));
        }
        await expect(liste).not.toContainText(demandes[0].ref);
        await expect(lignes.nth(0)).toContainText("Acte de naissance");
        await expect(lignes.nth(0)).toContainText("En attente de traitement");
    });

    test("action : consulter une demande récente ouvre son détail", async ({ page }) => {
        test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : demandes fictives impossibles à créer");
        await loginAdmin(page);
        const plusRecente = demandes[5];
        const ligne = carteDemandesRecentes(page).locator("tbody tr").filter({ hasText: plusRecente.ref });
        await ligne.getByRole("link", { name: "Voir" }).click();
        await expect(page).toHaveURL(new RegExp(`/admin/dashboard/details-demande/${plusRecente.id}$`));
        await expect(page.getByRole("heading", { name: "Détails de la demande" })).toBeVisible();
        await shot(page, "CA-3.i.c.2-action-voir");
    });

    test("statistiques : mêmes indicateurs (valeurs de la base) et mêmes graphiques", async ({ page }) => {
        test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : comparaison avec la base impossible");
        await loginAdmin(page);
        await page.goto("/admin/dashboard/stats");
        const c = await comptes();
        const pct = (v: number) => (v === 0 ? "0%" : `${((v / c.total) * 100).toFixed(1)}%`);
        const { res } = await indicateurs(page);
        expect(res).toEqual({
            "Total des demandes": String(c.total),
            Naissances: `${c.naissance} ${pct(c.naissance)}`,
            Mariages: `${c.mariage} ${pct(c.mariage)}`,
            "Décès": `${c.deces} ${pct(c.deces)}`,
        });

        await expect(page.getByRole("tab")).toHaveText(["Par type", "Par statut", "Évolution temporelle"]);
        const panneau = page.getByRole("tabpanel");

        await expect(panneau.getByText("Répartition par type de document")).toBeVisible();
        await expect(panneau.locator(".recharts-pie-sector")).toHaveCount(3);
        for (const n of ["Naissance", "Mariage", "Décès"]) {
            await expect(panneau.locator(".recharts-legend-item-text", { hasText: n })).toBeVisible();
        }

        await page.getByRole("tab", { name: "Par statut" }).click();
        await expect(panneau.getByText("Répartition par statut", { exact: true })).toBeVisible();
        await expect(panneau.locator(".recharts-bar-rectangle")).toHaveCount(4);
        for (const n of ["En attente", "En traitement", "Validées", "Refusées"]) {
            await expect(panneau.locator(".recharts-cartesian-axis-tick-value", { hasText: n })).toBeVisible();
        }

        await page.getByRole("tab", { name: "Évolution temporelle" }).click();
        await expect(panneau.getByText("Évolution du nombre de demandes au fil du temps")).toBeVisible();
        await expect(panneau.locator(".recharts-line")).toHaveCount(4);
        await expect(panneau.locator(".recharts-legend-item-text")).toHaveText(["Total", "Naissance", "Mariage", "Décès"]);
        await expect(panneau.locator(".recharts-cartesian-axis-tick-value", { hasText: "1/2099" })).toBeVisible();
        await shot(page, "CA-3.i.c.2-statistiques-bureau");
    });
});

test("R2 — aucune couleur codée en dur dans le tableau de bord et les statistiques", async () => {
    const fichiers = ["../app/admin/dashboard/page.tsx", "../app/admin/dashboard/stats/page.tsx"];
    // Couleurs littérales (#hex, rgb/hsl/oklch sans variable) et classes Tailwind de palette fixe
    const interdits = [
        /#[0-9a-fA-F]{3,8}\b/,
        /\brgba?\(/,
        /\bhsla?\((?!\s*var\()/,
        /\boklch\(/,
        /\b(?:bg|text|border|fill|stroke|ring|from|to|via)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/,
    ];
    const trouvees: string[] = [];
    for (const f of fichiers) {
        const lignes = fs.readFileSync(path.join(__dirname, f), "utf8").split("\n");
        lignes.forEach((l, i) => {
            if (interdits.some((re) => re.test(l))) trouvees.push(`${f}:${i + 1}: ${l.trim()}`);
        });
    }
    expect(trouvees).toEqual([]);
});
