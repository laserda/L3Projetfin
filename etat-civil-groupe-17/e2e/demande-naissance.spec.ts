import { test, expect, type Page, type Browser, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Refonte de la page de demande d'acte de naissance (US-3.e), sur téléphone de 360 px :
// formulaire lisible et utilisable au doigt, messages d'erreur en français sous le champ
// concerné sans envoi de la demande, demande valide -> page de paiement avec des données
// enregistrées identiques à la saisie, mêmes champs qu'avant, style porté par CustomForm.tsx.
// Données fictives uniquement.
//   SHOTS_DIR         dossier où enregistrer une capture par exigence (optionnel)
//   E2E_DATABASE_URL  base de test, pour relire la demande enregistrée (CA-3.e.2)
//                     (le module « pg » du projet doit être disponible pour les tests)

const SHOTS_DIR = process.env.SHOTS_DIR;
const DATABASE_URL = process.env.E2E_DATABASE_URL;
const stamp = Date.now();
const MONTANT = "1500";
// Page de paiement : montant au format « 15 000 FCFA » (US-3.g)
const MONTANT_PAIEMENT = "1 500 FCFA";
const MOBILE = { width: 360, height: 740 };
const URL_DEMANDE = "/nouvelle-demande-naissance?type=Naissance";

const admin = {
    nom: "Testeur",
    prenom: "Fictif",
    email: `admin.naissance.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

const citoyen = {
    nom: "Brou",
    prenom: "Fictif",
    dateNaissance: "1992-04-18",
    lieu: "Bouaké",
    telephone: "+2250708091011",
    adresse: "Rue fictive 7, Plateau",
    email: `citoyen.naissance.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

// Libellés du formulaire, identiques à ceux d'avant la refonte (R-1)
const LIBELLE_POUR_QUI = "Pour qui faite vous la demande ?";
const CHAMPS_COMMUNS = [
    "Numéro d'acte",
    "Nom de la mère",
    "Prénom de la mère",
    "Date de naissance de la mère",
    "Profession de la mère",
    "Nom du père",
    "Prénom du père",
    "Date de naissance du père",
    "Profession du père",
];
const CHAMPS_TIERS = ["Date de naissance", "Nom du tier", "Prenom du tier"];
const OPTIONS_POUR_QUI = ["Moi même", "Mon enfant", "Un mebre de la famille", "Autre"];

// Messages d'erreur attendus (français clair)
const MSG_POUR_QUI = "Veuillez choisir pour qui vous faites la demande.";
const MSG_NUMERO = "Le numéro d'acte est requis.";

async function shot(page: Page, name: string, fullPage = true) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage });
}

async function mobileContext(browser: Browser) {
    return browser.newContext({ viewport: MOBILE, locale: "fr-FR", isMobile: true, hasTouch: true });
}

async function registerAdmin(page: Page) {
    await page.goto("/admin/register");
    await page.getByLabel("Nom", { exact: true }).fill(admin.nom);
    await page.getByLabel("Prénom").fill(admin.prenom);
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Administrateur" }).click();
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/admin\?inscrit=1$/);
}

async function loginAdmin(page: Page) {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

async function registerCitoyen(page: Page) {
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
}

async function loginCitoyen(page: Page) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(citoyen.email);
    await page.getByLabel("Mot de passe").fill(citoyen.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
}

async function ouvrirDemande(page: Page) {
    await page.goto(URL_DEMANDE);
    await expect(page.getByText(`Les frais de timbre s'élèvent à ${MONTANT} FCFA pour ce document.`)).toBeVisible();
}

async function choisirPourQui(page: Page, option: string) {
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: option }).click();
    await expect(page.getByRole("combobox")).toContainText(option);
}

// Compte les requêtes d'envoi au serveur (actions serveur Next.js) émises par la page.
function compteurEnvois(page: Page) {
    const envois: string[] = [];
    page.on("request", (r) => {
        if (r.method() === "POST" && r.headers()["next-action"]) envois.push(r.url());
    });
    return envois;
}

async function expectNoHorizontalScroll(page: Page) {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect.soft(overflow, "défilement horizontal (px)").toBeLessThanOrEqual(0);
}

async function expectReadableText(page: Page) {
    const tooSmall = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            const el = node.parentElement;
            if (!el || !node.textContent?.trim()) continue;
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (style.visibility === "hidden" || style.display === "none" || rect.width === 0) continue;
            if (el.closest(".sr-only")) continue;
            if (parseFloat(style.fontSize) < 12) out.push(`${node.textContent.trim()} (${style.fontSize})`);
        }
        return out;
    });
    expect.soft(tooSmall, "textes de moins de 12 px").toEqual([]);
}

// Cible tactile : au moins 44 px de haut, entièrement visible dans la largeur de l'écran.
async function expectTouchTarget(locator: Locator, nom: string) {
    const box = await locator.boundingBox();
    expect.soft(box, `${nom} : visible`).not.toBeNull();
    if (!box) return;
    expect.soft(box.height, `${nom} : hauteur (px)`).toBeGreaterThanOrEqual(44);
    expect.soft(box.x, `${nom} : bord gauche`).toBeGreaterThanOrEqual(0);
    expect.soft(box.x + box.width, `${nom} : bord droit`).toBeLessThanOrEqual(MOBILE.width);
    // Le champ ne déborde pas de son groupe de champs
    const debord = await locator.evaluate((el) => {
        const section = el.closest("[data-slot='demande-section'], [data-slot='demande-actions'], [role='listbox']");
        if (!section) return 0;
        const s = section.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        // Contenu (texte, flèche) qui dépasserait du champ lui-même
        let contenu = 0;
        for (const c of Array.from(el.querySelectorAll("*"))) {
            const b = c.getBoundingClientRect();
            if (b.width > 0) contenu = Math.max(contenu, b.right - r.right, r.left - b.left);
        }
        return Math.max(s.left - r.left, r.right - s.right, contenu);
    });
    expect.soft(debord, `${nom} : débordement hors de son groupe (px)`).toBeLessThanOrEqual(0.5);
}

// Le message d'erreur est affiché juste sous le champ et rattaché à lui (aria-describedby).
async function expectErreurSousLeChamp(page: Page, champ: Locator, message: string) {
    await expect(champ).toHaveAttribute("aria-invalid", "true");
    const item = page.locator("[data-slot='form-item']").filter({ has: champ });
    const msg = item.locator("[data-slot='form-message']");
    await expect(msg).toHaveText(message);
    await expect(msg).toBeVisible();
    const id = await msg.getAttribute("id");
    expect(await champ.getAttribute("aria-describedby")).toContain(id!);
    // Positions relevées au même instant (la page peut défiler vers le champ en erreur)
    const ecart = await champ.evaluate((el, msgId) => {
        const c = el.getBoundingClientRect();
        const m = document.getElementById(msgId)!.getBoundingClientRect();
        return m.top - c.bottom;
    }, id!);
    expect(ecart).toBeGreaterThanOrEqual(-1);
    expect(ecart).toBeLessThan(24);
    expect(await msg.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(12);
}

async function libellesVisibles(page: Page) {
    return page.locator("form [data-slot='form-label']").allInnerTexts();
}

type Saisie = Record<string, string>;

const saisieParents: Saisie = {
    "Numéro d'acte": "ACTE-FICTIF-3E-0001",
    "Nom de la mère": "Koné",
    "Prénom de la mère": "Awa",
    "Date de naissance de la mère": "1966-02-14",
    "Profession de la mère": "Couturière",
    "Nom du père": "Brou",
    "Prénom du père": "Yao",
    "Date de naissance du père": "1961-09-03",
    "Profession du père": "Menuisier",
};

async function remplir(page: Page, saisie: Saisie) {
    for (const [label, valeur] of Object.entries(saisie)) {
        await page.getByLabel(label, { exact: true }).fill(valeur);
    }
}

async function lireDemande(id: string) {
    // Module « pg » du projet (dépendance de l'application)
    const { Client } = (await import("pg")).default ?? (await import("pg"));
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
        const res = await client.query(
            `SELECT d."TypeActe", d."NumeroActe", d."DemandePourTier", d."Statut", d."DateActe",
                    n."Nom", n."Prenom", n."NomMere", n."PrenomMere", n."ProfessionMere", n."DateNaisMere",
                    n."NomPere", n."PrenomPere", n."ProfessionPere", n."DateNaisPere",
                    c."DateNaissance" AS "DateNaissanceCompte"
             FROM "Demande" d JOIN "Naissance" n ON n."ID_Demande" = d."ID_Demande"
             JOIN "Citoyen" c ON c."ID_Citoyen" = d."ID_Citoyen"
             WHERE d."ID_Demande" = $1`,
            [id]
        );
        return res.rows;
    } finally {
        await client.end();
    }
}

const jour = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : null);

test.beforeAll(async ({ browser }) => {
    // Préparation : un administrateur fictif définit le tarif de l'acte de naissance (s'il manque),
    // puis un citoyen fictif s'inscrit.
    const page = await browser.newPage();
    await registerAdmin(page);
    await loginAdmin(page);
    await page.goto("/admin/dashboard/tarif");
    await page.waitForLoadState("networkidle");
    if ((await page.locator("tbody tr", { hasText: "Naissance" }).count()) === 0) {
        await page.getByText("Ajouter un tarif").click();
        const dialog = page.getByRole("dialog");
        await dialog.getByRole("combobox").click();
        await page.getByRole("option", { name: "Acte de naissance" }).click();
        await dialog.getByLabel("Frais de timbre").fill(MONTANT);
        await dialog.getByLabel("Frais d'expedition").fill("5000");
        await dialog.getByRole("button", { name: "Enregistrer" }).click();
        await expect(page.locator("tbody tr", { hasText: "Naissance" })).toHaveCount(1);
    }
    await page.close();
    const context = await browser.newContext();
    await registerCitoyen(await context.newPage());
    await context.close();
});

test("CA-3.5 — page de demande lisible et utilisable au doigt sur un téléphone de 360 px", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await ouvrirDemande(page);

    await expect(page.getByText("Demande d'acte de naissance", { exact: true })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectReadableText(page);
    // Champs de saisie, liste « Pour qui » et bouton d'envoi : cibles d'au moins 44 px dans l'écran
    await expectTouchTarget(page.getByRole("combobox"), LIBELLE_POUR_QUI);
    for (const label of CHAMPS_COMMUNS) {
        await expectTouchTarget(page.getByLabel(label, { exact: true }), label);
    }
    await expectTouchTarget(page.getByRole("button", { name: "Soumettre ma demande" }), "Soumettre ma demande");
    // Les saisies au doigt ne déclenchent pas de zoom automatique (texte d'au moins 16 px)
    const tailles = await page.locator("form input:not([type=hidden])").evaluateAll((els) =>
        els.map((el) => parseFloat(getComputedStyle(el).fontSize))
    );
    for (const t of tailles) expect.soft(t).toBeGreaterThanOrEqual(16);
    await shot(page, "CA-3.5-a-formulaire-360px");

    // Choix de la personne : entrées de la liste utilisables au doigt
    await page.getByRole("combobox").click();
    // Attendre la fin de l'animation d'ouverture de la liste avant de mesurer
    await page.locator("[data-slot='select-content']").evaluate((el) =>
        Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished))
    );
    for (const option of OPTIONS_POUR_QUI) {
        await expectTouchTarget(page.getByRole("option", { name: option }), `option ${option}`);
    }
    // Capture de l'écran seul : une capture pleine page redimensionne la fenêtre et referme la liste
    await shot(page, "CA-3.5-a-liste-pour-qui-360px", false);
    await page.getByRole("option", { name: "Mon enfant" }).click();
    for (const label of CHAMPS_TIERS) {
        await expectTouchTarget(page.getByLabel(label, { exact: true }), label);
    }
    await expectNoHorizontalScroll(page);
    await expectReadableText(page);
    await shot(page, "CA-3.5-a-formulaire-tiers-360px");
    await context.close();
});

test("CA-3.5 — champ obligatoire manquant : message en français sous le champ, demande non envoyée", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await ouvrirDemande(page);
    await page.waitForLoadState("networkidle");
    const envois = compteurEnvois(page);

    // 1. Formulaire vide
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expectErreurSousLeChamp(page, page.getByRole("combobox"), MSG_POUR_QUI);
    await expectErreurSousLeChamp(page, page.getByLabel("Numéro d'acte", { exact: true }), MSG_NUMERO);
    await expect(page.locator("[data-slot='form-message']")).toHaveCount(2);
    await expect(page.getByText("Required", { exact: true })).toHaveCount(0);
    // Avec les messages affichés, les champs restent dans l'écran et utilisables au doigt
    await expectTouchTarget(page.getByRole("combobox"), LIBELLE_POUR_QUI);
    await expectTouchTarget(page.getByLabel("Numéro d'acte", { exact: true }), "Numéro d'acte");
    await expectNoHorizontalScroll(page);
    await page.getByRole("combobox").scrollIntoViewIfNeeded();
    await shot(page, "CA-3.5-b-champs-obligatoires-vides-360px");

    // 2. Tous les champs remplis sauf « Pour qui » : seul ce champ est signalé
    await remplir(page, saisieParents);
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expectErreurSousLeChamp(page, page.getByRole("combobox"), MSG_POUR_QUI);
    await expect(page.locator("[data-slot='form-message']")).toHaveCount(1);
    await shot(page, "CA-3.5-b-pour-qui-manquant-360px");
    // Aucune requête d'envoi de la demande pour ces deux soumissions, on reste sur la page
    await page.waitForTimeout(1000);
    expect(envois).toEqual([]);
    await expect(page).toHaveURL(/\/nouvelle-demande-naissance/);

    // 3. « Pour qui » choisi, numéro d'acte jamais saisi : seul ce champ est signalé
    await ouvrirDemande(page);
    await page.waitForLoadState("networkidle");
    const envois2 = compteurEnvois(page);
    await choisirPourQui(page, "Moi même");
    const { "Numéro d'acte": _numero, ...sansNumero } = saisieParents;
    await remplir(page, sansNumero);
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expectErreurSousLeChamp(page, page.getByLabel("Numéro d'acte", { exact: true }), MSG_NUMERO);
    await expect(page.locator("[data-slot='form-message']")).toHaveCount(1);
    await page.getByLabel("Numéro d'acte", { exact: true }).scrollIntoViewIfNeeded();
    await shot(page, "CA-3.5-b-numero-acte-manquant-360px");

    // La demande n'est pas envoyée : aucune requête d'envoi, on reste sur la page
    await page.waitForTimeout(1000);
    expect(envois2).toEqual([]);
    await expect(page).toHaveURL(/\/nouvelle-demande-naissance/);

    // Une fois corrigé, le message disparaît
    await page.getByLabel("Numéro d'acte", { exact: true }).fill("ACTE-FICTIF-3E-0002");
    await expect(page.locator("[data-slot='form-message']")).toHaveCount(0);
    await context.close();
});

test("CA-3.5 / CA-3.e.2 — demande correctement remplie (pour soi) : page de paiement, données enregistrées = saisies", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await ouvrirDemande(page);
    await choisirPourQui(page, "Moi même");
    await remplir(page, saisieParents);
    await shot(page, "CA-3.e.2-formulaire-rempli-360px");
    await page.waitForLoadState("networkidle");
    const envois = compteurEnvois(page);
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();

    // Étape suivante : la page de paiement de la demande, comme avant la refonte
    await expect(page).toHaveURL(/\/paiement\/[^/]+$/);
    // Cette fois la demande a bien été envoyée (le compteur utilisé pour CA-3.5 détecte l'envoi)
    expect(envois.length).toBeGreaterThanOrEqual(1);
    const id = page.url().split("/paiement/")[1];
    await expect(page.getByText("Faite le paiement de votre demande Acte de naissance")).toBeVisible();
    await expect(page.getByText(MONTANT_PAIEMENT)).toBeVisible();
    await expect(page.getByRole("button", { name: "Payer" })).toBeEnabled();
    await shot(page, "CA-3.e.2-page-paiement-360px");

    test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : relecture en base impossible");
    const rows = await lireDemande(id);
    expect(rows).toHaveLength(1);
    const r = rows[0];
    expect(r.TypeActe).toBe("Naissance");
    expect(r.Statut).toBe("SoumiseEnAttenteDePaiment");
    expect(r.DemandePourTier).toBe("Moi");
    expect(r.NumeroActe).toBe(saisieParents["Numéro d'acte"]);
    // Pour soi : nom, prénom et date de l'acte viennent du compte du citoyen (comportement inchangé)
    expect(r.Nom).toBe(citoyen.nom);
    expect(r.Prenom).toBe(citoyen.prenom);
    expect(jour(r.DateActe)).toBe(jour(r.DateNaissanceCompte));
    expect(r.NomMere).toBe(saisieParents["Nom de la mère"]);
    expect(r.PrenomMere).toBe(saisieParents["Prénom de la mère"]);
    expect(jour(r.DateNaisMere)).toBe(saisieParents["Date de naissance de la mère"]);
    expect(r.ProfessionMere).toBe(saisieParents["Profession de la mère"]);
    expect(r.NomPere).toBe(saisieParents["Nom du père"]);
    expect(r.PrenomPere).toBe(saisieParents["Prénom du père"]);
    expect(jour(r.DateNaisPere)).toBe(saisieParents["Date de naissance du père"]);
    expect(r.ProfessionPere).toBe(saisieParents["Profession du père"]);
    await context.close();
});

test("CA-3.5 / CA-3.e.2 — demande correctement remplie (pour un enfant) : page de paiement, données enregistrées = saisies", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await ouvrirDemande(page);
    await choisirPourQui(page, "Mon enfant");
    const saisie: Saisie = {
        ...saisieParents,
        "Numéro d'acte": "ACTE-FICTIF-3E-0003",
        "Date de naissance": "2015-11-23",
        "Nom du tier": "Brou",
        "Prenom du tier": "Ama",
    };
    await remplir(page, saisie);
    await shot(page, "CA-3.e.2-formulaire-tiers-rempli-360px");
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expect(page).toHaveURL(/\/paiement\/[^/]+$/);
    const id = page.url().split("/paiement/")[1];
    await expect(page.getByText(MONTANT_PAIEMENT)).toBeVisible();

    test.skip(!DATABASE_URL, "E2E_DATABASE_URL non défini : relecture en base impossible");
    const [r] = await lireDemande(id);
    expect(r.DemandePourTier).toBe("MonEnfant");
    expect(r.NumeroActe).toBe(saisie["Numéro d'acte"]);
    expect(r.Nom).toBe(saisie["Nom du tier"]);
    expect(r.Prenom).toBe(saisie["Prenom du tier"]);
    expect(jour(r.DateActe)).toBe(saisie["Date de naissance"]);
    expect(r.NomMere).toBe(saisie["Nom de la mère"]);
    expect(r.PrenomMere).toBe(saisie["Prénom de la mère"]);
    expect(jour(r.DateNaisMere)).toBe(saisie["Date de naissance de la mère"]);
    expect(r.ProfessionMere).toBe(saisie["Profession de la mère"]);
    expect(r.NomPere).toBe(saisie["Nom du père"]);
    expect(r.PrenomPere).toBe(saisie["Prénom du père"]);
    expect(jour(r.DateNaisPere)).toBe(saisie["Date de naissance du père"]);
    expect(r.ProfessionPere).toBe(saisie["Profession du père"]);
    await context.close();
});

test("R-1 — mêmes champs qu'avant la refonte (pour soi et pour un tiers)", async ({ browser }) => {
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await ouvrirDemande(page);
    expect(await libellesVisibles(page)).toEqual([LIBELLE_POUR_QUI, ...CHAMPS_COMMUNS]);
    await page.getByRole("combobox").click();
    expect(await page.getByRole("option").allInnerTexts()).toEqual(OPTIONS_POUR_QUI);
    await page.getByRole("option", { name: "Moi même" }).click();
    expect(await libellesVisibles(page)).toEqual([LIBELLE_POUR_QUI, ...CHAMPS_COMMUNS]);
    await choisirPourQui(page, "Autre");
    expect(await libellesVisibles(page)).toEqual([
        LIBELLE_POUR_QUI,
        "Numéro d'acte",
        ...CHAMPS_TIERS,
        ...CHAMPS_COMMUNS.slice(1),
    ]);
    await expect(page.getByRole("button", { name: "Soumettre ma demande" })).toBeVisible();
    await shot(page, "R-1-memes-champs-360px");
    await context.close();
});

test("R-3 — le style du formulaire de demande est porté par le composant commun CustomForm.tsx", async ({ browser }) => {
    // Le composant commun expose la structure (cadre, sections, boutons) réutilisable par les autres demandes
    const source = fs.readFileSync(path.join(__dirname, "../components/CustomForm.tsx"), "utf8");
    for (const nom of ["DemandeFormLayout", "DemandeFormSection", "DemandeFormActions"]) {
        expect(source).toMatch(new RegExp(`export function ${nom}\\b`));
    }
    const context = await mobileContext(browser);
    const page = await context.newPage();
    await loginCitoyen(page);
    await ouvrirDemande(page);
    // La page de naissance utilise ces éléments communs
    await expect(page.locator("[data-slot='demande-form']")).toHaveCount(1);
    await expect(page.locator("[data-slot='demande-section']")).toHaveCount(3);
    await expect(page.locator("[data-slot='demande-actions'] button[type=submit]")).toHaveText("Soumettre ma demande");
    // Bouton principal pleine largeur sur téléphone
    const bouton = (await page.locator("[data-slot='demande-actions'] button").boundingBox())!;
    const form = (await page.locator("[data-slot='demande-form'] form").boundingBox())!;
    expect(Math.round(bouton.width)).toBe(Math.round(form.width));
    await shot(page, "R-3-structure-commune-360px");

    // Les pages de demande de mariage et de décès s'affichent toujours (non modifiées)
    for (const [url, titre] of [
        ["/nouvelle-demande-mariage?type=Mariage", "Demande d'acte de mariage"],
        ["/nouvelle-demande-deces?type=D%C3%A9c%C3%A8s", "Demande d'acte de décès"],
    ] as const) {
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        await expect(page.getByText(titre, { exact: true })).toBeVisible();
        await expect(page.getByText("Application error")).toHaveCount(0);
    }
    await context.close();
});
