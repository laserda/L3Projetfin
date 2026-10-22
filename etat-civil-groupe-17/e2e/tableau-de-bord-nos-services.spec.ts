import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// US-3.h — Tableau de bord du citoyen (/suivi-demande) et page « Nos services », sur téléphone de 360 px.
// Aucune demande -> message clair et bouton pour en créer une ; demandes affichées avec leur état,
// actions d'avant la refonte (filtres, Actualiser, Payer, Détails) toujours fonctionnelles ; détail
// d'une demande avec les mêmes informations ; « Nos services » présente les 3 types d'acte.
// Données fictives uniquement. La fenêtre de paiement Paystack est simulée dans le navigateur de
// test (aucun appel réel à Paystack) : elle renvoie « succès », comme après un vrai paiement.
//   SHOTS_DIR      dossier où enregistrer une capture par exigence (optionnel)
//   TEXT_DUMP_DIR  dossier où enregistrer le texte visible des pages (optionnel, comparaison avant / après)

const SHOTS_DIR = process.env.SHOTS_DIR;
const TEXT_DUMP_DIR = process.env.TEXT_DUMP_DIR;
const MOBILE = { width: 360, height: 740 };
const ORANGE_CHARTE = "rgb(255,121,0)";
const stamp = Date.now();
const admin = { nom: "AdminTableau", prenom: "Fictif", email: `admin.tableau.${stamp}@exemple.test`, password: "MotDePasse1" };
const nouveauCitoyen = (prefixe: string, nom: string) => ({
    nom,
    prenom: "Fictif",
    dateNaissance: "1991-02-03",
    lieu: "Yamoussoukro",
    telephone: "0700000008",
    adresse: "Plateau, Abidjan",
    email: `${prefixe}.${stamp}@exemple.test`,
    password: "MotDePasse1",
});
// Citoyen sans aucune demande, et citoyen avec une demande payée et une demande à payer
const citoyenSansDemande = nouveauCitoyen("citoyen.sans.demande", "Sansdemande");
const citoyenAvecDemandes = nouveauCitoyen("citoyen.avec.demandes", "Avecdemandes");
type Citoyen = typeof citoyenSansDemande;

const TYPES_D_ACTE = [
    { titre: "Demande d'acte de naissance", href: "/nouvelle-demande-naissance?type=Naissance" },
    { titre: "Demande d'acte de mariage", href: "/nouvelle-demande-mariage?type=Mariage" },
    { titre: "Demande d'acte de décès", href: "/nouvelle-demande-deces?type=Décès" },
];

let demandePayee = "";
let demandeAPayer = "";

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

// Texte visible, identifiants et dates fictifs remplacés pour comparer avant / après la refonte
async function dumpText(page: Page, name: string) {
    if (!TEXT_DUMP_DIR) return;
    fs.mkdirSync(TEXT_DUMP_DIR, { recursive: true });
    const texte = (await page.locator("main").first().innerText())
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<ID>")
        .replace(/\d{13}/g, "<STAMP>");
    fs.writeFileSync(path.join(TEXT_DUMP_DIR, `${name}.txt`), texte);
}

async function pasDeDefilementHorizontal(page: Page) {
    const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(debordement, "défilement horizontal (px)").toBeLessThanOrEqual(0);
}

// L'élément est entièrement dans la largeur de l'écran (360 px)
async function dansLEcran(loc: ReturnType<Page["locator"]>) {
    await expect(loc).toBeVisible();
    const box = await loc.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(MOBILE.width + 1);
}

// Aucun élément des cadres de la page ne sort de l'écran (le tableau défilant mis à part)
async function rienDeCoupe(page: Page) {
    const horsEcran = await page.evaluate((largeur) => {
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-slot='card'] *"))) {
            if (el.closest("[data-slot='table-container']")) continue;
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.left < -1 || r.right > largeur + 1)) out.push(`${el.tagName} « ${(el.textContent || "").trim().slice(0, 40)} »`);
        }
        return out;
    }, MOBILE.width);
    expect(horsEcran, "éléments qui sortent de l'écran").toEqual([]);
}

async function cibleTactile(loc: ReturnType<Page["locator"]>) {
    await dansLEcran(loc);
    expect((await loc.boundingBox())!.height, "hauteur de la cible tactile (px)").toBeGreaterThanOrEqual(44);
}

async function contexteMobile(browser: Browser) {
    return browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true, locale: "fr-FR" });
}

// Simule la fenêtre de paiement Paystack (paiement réussi)
async function simulerPaystack(context: BrowserContext) {
    const cors = {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
    };
    await context.route(/https:\/\/api\.paystack\.co\/.*/, async (route) => {
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
        return route.fulfill({
            status: 200,
            headers: { ...cors, "content-type": "application/json" },
            body: JSON.stringify({
                status: true,
                message: "ok",
                data: { id: 1, access_code: "acces-fictif", transaction_status: "pending", channels: ["mobile_money"], log: null },
            }),
        });
    });
    await context.route(/https:\/\/checkout\.paystack\.com\/.*/, (route) =>
        route.fulfill({
            status: 200,
            contentType: "text/html",
            body: `<!doctype html><html><body><script>
                parent.postMessage({ event: "loaded:checkout" }, "*");
                setTimeout(function () { parent.postMessage({ event: "success", data: { reference: "ref-fictive", status: "success" } }, "*"); }, 800);
            </script></body></html>`,
        })
    );
    await context.route(/https:\/\/(standard\.paystack\.co|paystack\.com)\/.*/, (route) => route.fulfill({ status: 200, body: "" }));
}

async function inscription(browser: Browser, c: Citoyen) {
    const context = await browser.newContext();
    const p = await context.newPage();
    await p.goto("/register");
    for (const [label, valeur] of [
        ["Nom", c.nom], ["Prénom", c.prenom], ["Date de naissance", c.dateNaissance],
        ["Lieu de naissance", c.lieu], ["Téléphone", c.telephone], ["Adresse", c.adresse],
        ["Email", c.email], ["Mot de passe", c.password],
    ]) await p.getByLabel(label, { exact: true }).fill(valeur);
    await p.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(p).toHaveURL(/\/$/);
    await context.close();
}

async function connexion(page: Page, c: Citoyen) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(c.email);
    await page.getByLabel("Mot de passe").fill(c.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
}

async function creerDemande(page: Page) {
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Moi même" }).click();
    const champs: [string, string][] = [
        ["Numéro d'acte", "ACTE-FICTIF-3H"],
        ["Nom de la mère", "Koffi"],
        ["Prénom de la mère", "Aya"],
        ["Date de naissance de la mère", "1965-03-10"],
        ["Profession de la mère", "Commerçante"],
        ["Nom du père", "Kouadio"],
        ["Prénom du père", "Konan"],
        ["Date de naissance du père", "1960-07-21"],
        ["Profession du père", "Enseignant"],
    ];
    for (const [label, valeur] of champs) await page.getByLabel(label, { exact: true }).fill(valeur);
    await page.getByRole("button", { name: "Soumettre ma demande" }).click();
    await expect(page).toHaveURL(/\/paiement\/[^/]+$/);
    await expect(page.getByRole("button", { name: "Payer" })).toBeEnabled();
    return page.url().split("/paiement/")[1];
}

const ligneDe = (page: Page, id: string) => page.locator("tbody tr", { hasText: id.substring(0, 8).toUpperCase() });

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
    // Un administrateur fictif s'assure qu'un tarif existe pour l'acte de naissance (nécessaire au paiement)
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
    await page.goto("/admin");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await page.goto("/admin/dashboard/tarif");
    await page.waitForLoadState("networkidle");
    const ligne = page.locator("tbody tr", { hasText: "Naissance" });
    if ((await ligne.count()) === 0) {
        await page.getByText("Ajouter un tarif").click();
        const dialog = page.getByRole("dialog");
        await dialog.getByRole("combobox").click();
        await page.getByRole("option", { name: "Acte de naissance" }).click();
        await dialog.getByLabel("Frais de timbre").fill("1500");
        await dialog.getByLabel("Frais d'expedition").fill("500");
        await dialog.getByRole("button", { name: "Enregistrer" }).click();
        await expect(ligne).toHaveCount(1);
    }
    await page.close();

    await inscription(browser, citoyenSansDemande);
    await inscription(browser, citoyenAvecDemandes);

    // Le second citoyen a une demande payée et une demande en attente de paiement
    const context = await browser.newContext();
    await simulerPaystack(context);
    const p = await context.newPage();
    await connexion(p, citoyenAvecDemandes);
    demandePayee = await creerDemande(p);
    await p.getByRole("button", { name: "Payer" }).click();
    await expect(p).toHaveURL(new RegExp(`/confirmation/${demandePayee}$`), { timeout: 30_000 });
    demandeAPayer = await creerDemande(p);
    await context.close();
});

test("CA-3.h.1 / R-3 — aucune demande : message clair et bouton pour en créer une (360 px)", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexion(page, citoyenSansDemande);
    await page.goto("/suivi-demande");
    await expect(page.getByRole("heading", { name: "Liste de mes demandes" })).toBeVisible();
    const message = page.getByRole("status").filter({ hasText: "Vous n'avez pas encore de demande" });
    await expect(message).toBeVisible();
    await dansLEcran(message);
    // Pas de tableau vide sans message
    await expect(page.locator("table")).toHaveCount(0);
    const bouton = message.getByRole("link", { name: "Créer une demande" });
    await cibleTactile(bouton);
    await pasDeDefilementHorizontal(page);
    await rienDeCoupe(page);
    await shot(page, "CA-3.h.1-tableau-de-bord-aucune-demande-360");
    // Le bouton mène au choix du type d'acte, puis au formulaire de demande
    await bouton.click();
    await expect(page).toHaveURL(/\/nos-service$/);
    await expect(page.getByRole("heading", { name: "Nos services" })).toBeVisible();
    await page.getByRole("link", { name: "Faire une demande" }).first().click();
    await expect(page).toHaveURL(/\/nouvelle-demande-naissance\?type=Naissance$/);
    await expect(page.getByRole("button", { name: "Soumettre ma demande" })).toBeVisible();
    await context.close();
});

test("CA-3.8 / R-1 — tableau de bord sur 360 px : demandes avec leur état, actions d'avant la refonte fonctionnelles", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    const erreurs: string[] = [];
    page.on("pageerror", (e) => erreurs.push(e.message));
    await connexion(page, citoyenAvecDemandes);
    await page.goto("/suivi-demande");
    await expect(page.getByRole("heading", { name: "Liste de mes demandes" })).toBeVisible();
    await expect(page.getByText("Vous n'avez pas encore de demande")).toHaveCount(0);
    // Mêmes colonnes qu'avant la refonte
    await expect(page.locator("thead th")).toHaveText(["Référence", "Statut", "Type", "Nom & prénom", "Email", "Date", "Action"]);
    await expect(page.locator("tbody tr")).toHaveCount(2);
    // Chaque demande avec son état (libellés d'avant la refonte), visible sans faire défiler le tableau
    for (const [id, etat] of [[demandePayee, "En attente de traitement"], [demandeAPayer, "En attente de paiement"]] as const) {
        const ligne = ligneDe(page, id);
        await expect(ligne).toHaveCount(1);
        await dansLEcran(ligne.getByText(id.substring(0, 8).toUpperCase()));
        await dansLEcran(ligne.getByText(etat));
        await expect(ligne).toContainText("Acte de naissance");
        await expect(ligne).toContainText(`${citoyenAvecDemandes.nom} ${citoyenAvecDemandes.prenom}`);
    }
    await pasDeDefilementHorizontal(page);
    await rienDeCoupe(page);
    await dumpText(page, "tableau-de-bord-avec-demandes");
    await shot(page, "CA-3.8-tableau-de-bord-demandes-et-etats-360");

    // Filtres d'avant la refonte : statut, puis « Actualiser » remet la liste complète
    for (const champ of [page.getByLabel("Recherche"), page.locator("#status-filter"), page.locator("#type-filter")]) await cibleTactile(champ);
    await page.locator("#status-filter").click();
    await page.getByRole("option", { name: "En attente de paiement" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(ligneDe(page, demandeAPayer)).toHaveCount(1);
    await shot(page, "CA-3.8-tableau-de-bord-filtre-statut-360");
    await cibleTactile(page.getByRole("button", { name: "Actualiser" }));
    await page.getByRole("button", { name: "Actualiser" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(2);
    // Recherche sans résultat : message des filtres (inchangé), distinct de l'état « aucune demande »
    await page.getByLabel("Recherche").fill("ZZ999999-INCONNU");
    await expect(page.getByRole("status").filter({ hasText: "Aucune demande trouvée" })).toBeVisible();
    await expect(page.getByText("Vous n'avez pas encore de demande")).toHaveCount(0);
    await page.getByRole("button", { name: "Réinitialiser les filtres" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(2);

    // Action « Payer » (demande en attente de paiement) -> page de paiement de cette demande
    const payer = ligneDe(page, demandeAPayer).getByRole("button", { name: "Payer" });
    await expect(payer).toBeVisible();
    expect((await payer.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await payer.click();
    await expect(page).toHaveURL(new RegExp(`/paiement/${demandeAPayer}$`));
    await expect(page.getByRole("button", { name: "Payer" })).toBeEnabled();

    // Action « Détails » (demande payée) -> détail de cette demande
    await page.goto("/suivi-demande");
    await expect(ligneDe(page, demandePayee).getByRole("button", { name: "Payer" })).toHaveCount(0);
    const details = ligneDe(page, demandePayee).getByRole("button", { name: "Détails" });
    expect((await details.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await details.click();
    await expect(page).toHaveURL(new RegExp(`/confirmation/${demandePayee}$`));
    expect(erreurs).toEqual([]);
    await context.close();
});

test("CA-3.h.2 — détail d'une demande ouvert depuis le tableau de bord : mêmes informations qu'avant la refonte (360 px)", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexion(page, citoyenAvecDemandes);
    await page.goto("/suivi-demande");
    await ligneDe(page, demandePayee).getByRole("button", { name: "Détails" }).click();
    await expect(page).toHaveURL(new RegExp(`/confirmation/${demandePayee}$`));
    await expect(page.getByText("Demande enregistrée avec succès !")).toBeVisible();
    const numero = page.locator("[data-slot='numero-suivi']");
    await expect(numero).toContainText("Référence :");
    await expect(numero).toContainText(demandePayee);
    await dansLEcran(numero);
    const attendu: [string, string][] = [
        ["Type de document :", "Acte de naissance"],
        ["Nom du demandeur :", citoyenAvecDemandes.nom],
        ["Prénom du demandeur :", citoyenAvecDemandes.prenom],
        ["Date de l'évènement :", ""],
        ["Email du demandeur :", citoyenAvecDemandes.email],
        ["Date de soumission :", ""],
        ["Statut actuel :", "En attente de traitement"],
    ];
    for (const [libelle, valeur] of attendu) {
        // Le paragraphe commence par le libellé (« Nom du demandeur » ne doit pas trouver « Prénom du demandeur »)
        const ligne = page.locator("p", { hasText: new RegExp(`^\\s*${libelle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
        await expect(ligne).toHaveCount(1);
        if (valeur) await expect(ligne).toContainText(valeur);
    }
    await expect(page.getByText("Récapitulatif de votre demande")).toBeVisible();
    await expect(page.getByText("Que se passe-t-il maintenant ?")).toBeVisible();
    for (const bouton of [page.getByRole("button", { name: "Suivre ma demande" }), page.getByRole("button", { name: "Retour" })]) await cibleTactile(bouton);
    await pasDeDefilementHorizontal(page);
    await rienDeCoupe(page);
    await dumpText(page, "detail-demande");
    await shot(page, "CA-3.h.2-detail-demande-360");
    // « Retour » ramène au tableau de bord
    await page.getByRole("button", { name: "Retour" }).click();
    await expect(page).toHaveURL(/\/suivi-demande$/);
    await expect(page.locator("tbody tr")).toHaveCount(2);
    await context.close();
});

test("CA-3.8 / R-2 — « Nos services » sur 360 px : nouveau design, les 3 types d'acte toujours présentés", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexion(page, citoyenSansDemande);
    await page.goto("/nos-service");
    await expect(page.getByRole("heading", { name: "Nos services" })).toBeVisible();
    const cartes = page.locator("#nos-service [data-slot='card']");
    await expect(cartes).toHaveCount(3);
    for (const [i, type] of TYPES_D_ACTE.entries()) {
        const carte = cartes.nth(i);
        await expect(carte.getByRole("heading", { name: type.titre })).toBeVisible();
        // Nouveau design : cadre de la charte (bordure haute orange de la marque)
        const bordure = await carte.evaluate((el) => getComputedStyle(el).borderTopColor.replace(/\s/g, ""));
        expect(bordure).toBe(ORANGE_CHARTE);
        await dansLEcran(carte);
        const lien = carte.getByRole("link", { name: "Faire une demande" });
        await cibleTactile(lien);
        expect(decodeURIComponent((await lien.getAttribute("href")) ?? "")).toBe(decodeURIComponent(type.href));
    }
    // Lien présenté comme un bouton : pas de bouton dans un lien
    expect(await page.locator("#nos-service a button, #nos-service button a").count()).toBe(0);
    await pasDeDefilementHorizontal(page);
    await rienDeCoupe(page);
    await dumpText(page, "nos-services");
    await shot(page, "CA-3.8-nos-services-360");
    // Chaque type d'acte mène toujours à son formulaire de demande
    for (const type of TYPES_D_ACTE) {
        await page.goto("/nos-service");
        await page.locator("#nos-service [data-slot='card']", { hasText: type.titre }).getByRole("link", { name: "Faire une demande" }).click();
        await expect(page).toHaveURL(new RegExp(`${type.href.split("?")[0]}\\?type=`));
        await expect(page.getByRole("button", { name: "Soumettre ma demande" })).toBeVisible();
    }
    await context.close();
});

test("CA-3.8 — « Nos services » et tableau de bord sur ordinateur (capture de contrôle)", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "fr-FR" });
    const page = await context.newPage();
    await connexion(page, citoyenAvecDemandes);
    await page.goto("/nos-service");
    await expect(page.locator("#nos-service [data-slot='card']")).toHaveCount(3);
    await shot(page, "CA-3.8-nos-services-desktop");
    await page.goto("/suivi-demande");
    await expect(page.locator("tbody tr")).toHaveCount(2);
    await shot(page, "CA-3.8-tableau-de-bord-desktop");
    await context.close();
});
