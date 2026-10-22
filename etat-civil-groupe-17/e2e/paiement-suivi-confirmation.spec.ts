import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";

// US-3.g — Pages de paiement, de suivi et de confirmation refondues, sur téléphone de 360 px.
// Paiement réussi -> confirmation avec le numéro de suivi ; paiement annulé ou échoué -> message
// clair, la demande reste en attente de paiement et le paiement peut être relancé ; suivi d'un
// numéro valide -> état de la demande ; numéro inconnu -> message, aucune information affichée.
// Données fictives uniquement. La fenêtre de paiement Paystack est simulée dans le navigateur
// de test (aucun appel réel à Paystack) : elle renvoie « succès », « annulation » ou « échec »,
// ce qui déclenche les mêmes traitements que l'application après un vrai paiement.
//   SHOTS_DIR         dossier où enregistrer une capture par exigence (optionnel)
//   E2E_DATABASE_URL  base de test, pour vérifier qu'une demande non payée n'est pas validée
//                     (optionnel ; le module « pg » du projet doit être disponible pour les tests)

const SHOTS_DIR = process.env.SHOTS_DIR;
const DATABASE_URL = process.env.E2E_DATABASE_URL;
const MOBILE = { width: 360, height: 740 };
const stamp = Date.now();
const admin = { nom: "AdminPaiement", prenom: "Fictif", email: `admin.paiement.${stamp}@exemple.test`, password: "MotDePasse1" };
const citoyen = {
    nom: "Paiementfictif",
    prenom: "Awa",
    dateNaissance: "1992-04-12",
    lieu: "Bouaké",
    telephone: "0700000003",
    adresse: "Cocody, Abidjan",
    email: `citoyen.paiement.${stamp}@exemple.test`,
    password: "MotDePasse1",
};
// Tarif utilisé si aucun tarif n'existe encore pour l'acte de naissance
const MONTANT_PAR_DEFAUT = "15000";
let montant = 0;

type Issue = "success" | "cancel" | "failed";

async function shot(page: Page, name: string) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });
}

// « 15 000 FCFA » : chiffres groupés par trois, séparés par une espace (insécable ou non)
function montantAttendu(n: number) {
    const groupes = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return new RegExp(`(^|[^\\d])${groupes.replace(/ /g, "[\\s\\u00a0\\u202f]")}[\\s\\u00a0\\u202f]FCFA`);
}

async function pasDeDefilementHorizontal(page: Page) {
    const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(debordement, "défilement horizontal (px)").toBeLessThanOrEqual(0);
}

// L'élément est entièrement dans la largeur de l'écran (360 px), sans défilement ni zoom
async function dansLEcran(loc: ReturnType<Page["locator"]>) {
    await expect(loc).toBeVisible();
    const box = await loc.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(MOBILE.width + 1);
}

// Aucun texte ni élément des cadres de la page ne sort de l'écran (le tableau défilant mis à part)
async function riendeCoupe(page: Page) {
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

async function contexteMobile(browser: Browser) {
    return browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true, locale: "fr-FR" });
}

// Simule la fenêtre de paiement Paystack ; l'issue (succès, annulation, échec) est choisie par le test.
async function simulerPaystack(context: BrowserContext, issue: { valeur: Issue }, requetes: string[]) {
    const cors = {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
    };
    await context.exposeFunction("__paystackRecu", (donnees: string) => { requetes.push(donnees); });
    await context.route(/https:\/\/api\.paystack\.co\/.*/, async (route) => {
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
        requetes.push(`${route.request().url()} ${route.request().postData() ?? ""}`);
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
    await context.route(/https:\/\/checkout\.paystack\.com\/.*/, (route) => {
        requetes.push(route.request().url());
        const message =
            issue.valeur === "success"
                ? `{ event: "success", data: { reference: "ref-fictive", status: "success" } }`
                : issue.valeur === "cancel"
                    ? `{ event: "cancel", data: {} }`
                    : `{ event: "close", data: { status: "failed" } }`;
        return route.fulfill({
            status: 200,
            contentType: "text/html",
            body: `<!doctype html><html><body><script>
                // Paramètres de la transaction envoyés par la page à la fenêtre de paiement (montant, devise…)
                window.addEventListener("message", function (e) {
                    try { window.__paystackRecu(JSON.stringify(e.data)); } catch (err) {}
                });
                parent.postMessage({ event: "loaded:checkout" }, "*");
                setTimeout(function () { parent.postMessage(${message}, "*"); }, 800);
            </script></body></html>`,
        });
    });
    await context.route(/https:\/\/(standard\.paystack\.co|paystack\.com)\/.*/, (route) => route.fulfill({ status: 200, body: "" }));
}

async function connexion(page: Page) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(citoyen.email);
    await page.getByLabel("Mot de passe").fill(citoyen.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/$/);
}

async function creerDemande(page: Page) {
    await page.goto("/nouvelle-demande-naissance?type=Naissance");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Moi même" }).click();
    const champs: [string, string][] = [
        ["Numéro d'acte", "ACTE-FICTIF-3G"],
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

async function statutEnBase(id: string) {
    const { Client } = (await import("pg")).default ?? (await import("pg"));
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
        const res = await client.query('SELECT "Statut", "ID_Paiement" FROM "Demande" WHERE "ID_Demande" = $1', [id]);
        return res.rows[0] as { Statut: string; ID_Paiement: string | null } | undefined;
    } finally {
        await client.end();
    }
}

// Demande toujours là, en attente de paiement, avec le bouton « Payer » dans le suivi
async function demandeConservee(page: Page, id: string) {
    if (DATABASE_URL) {
        const ligne = await statutEnBase(id);
        expect(ligne, "demande toujours enregistrée").toBeTruthy();
        expect(ligne!.Statut).toBe("SoumiseEnAttenteDePaiment");
        expect(ligne!.ID_Paiement).toBeNull();
    }
    await page.goto("/suivi-demande");
    const ligne = page.locator("tbody tr", { hasText: id.substring(0, 8).toUpperCase() });
    await expect(ligne).toHaveCount(1);
    await expect(ligne).toContainText("En attente de paiement");
    await expect(ligne.getByRole("button", { name: "Payer" })).toBeVisible();
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
    // Un administrateur fictif s'assure qu'un tarif existe pour l'acte de naissance, et le relève.
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
        await dialog.getByLabel("Frais de timbre").fill(MONTANT_PAR_DEFAUT);
        await dialog.getByLabel("Frais d'expedition").fill("5000");
        await dialog.getByRole("button", { name: "Enregistrer" }).click();
        await expect(ligne).toHaveCount(1);
    }
    await page.close();

    // Un citoyen fictif inscrit ; le montant affiché est relevé sur sa page de demande (inchangée)
    const context = await browser.newContext();
    const p = await context.newPage();
    await p.goto("/register");
    for (const [label, valeur] of [
        ["Nom", citoyen.nom], ["Prénom", citoyen.prenom], ["Date de naissance", citoyen.dateNaissance],
        ["Lieu de naissance", citoyen.lieu], ["Téléphone", citoyen.telephone], ["Adresse", citoyen.adresse],
        ["Email", citoyen.email], ["Mot de passe", citoyen.password],
    ]) await p.getByLabel(label, { exact: true }).fill(valeur);
    await p.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(p).toHaveURL(/\/$/);
    await p.goto("/nouvelle-demande-naissance?type=Naissance");
    const texte = p.getByText(/Les frais de timbre s'élèvent à [1-9]\d* FCFA/);
    await expect(texte).toBeVisible();
    montant = Number((await texte.innerText()).match(/à (\d+) FCFA/)![1]);
    expect(montant).toBeGreaterThan(0);
    await context.close();
});

test("CA-3.7 / R1 — page de paiement sur 360 px : nouveau design, montant au format « 15 000 FCFA »", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexion(page);
    await creerDemande(page);
    await expect(page.locator("[data-slot='card-title']", { hasText: /^Paiement$/ })).toBeVisible();
    await expect(page.getByText("Faite le paiement de votre demande Acte de naissance")).toBeVisible();
    await expect(page.getByText("Frais de timbre", { exact: true })).toBeVisible();
    await expect(page.getByText("Vous devez régler ces frais pour que votre demande soit traitée.")).toBeVisible();
    const texte = await page.locator("main, body").first().innerText();
    expect(texte).toMatch(montantAttendu(montant));
    if (montant >= 1000) expect(texte).not.toContain(`${montant} FCFA`);
    expect(texte).not.toMatch(/\d[.,]\d+\s*FCFA/);
    // Nouveau design : cadre aux couleurs de la charte (bordure haute orange de la marque)
    const cadre = page.locator("[data-slot='card']").filter({ hasText: "Frais de timbre" });
    const bordure = await cadre.evaluate((el) => getComputedStyle(el).borderTopColor.replace(/\s/g, ""));
    expect(bordure).toBe("rgb(255,121,0)");
    const bouton = page.getByRole("button", { name: "Payer" });
    await dansLEcran(bouton);
    expect((await bouton.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await pasDeDefilementHorizontal(page);
    await riendeCoupe(page);
    await shot(page, "CA-3.7-R1-paiement-360");
    await context.close();
});

test("CA-3.7 / R1 / R2 — paiement réussi : confirmation avec le numéro de suivi visible, montant transmis inchangé", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const issue = { valeur: "success" as Issue };
    const requetes: string[] = [];
    await simulerPaystack(context, issue, requetes);
    const page = await context.newPage();
    const erreurs: string[] = [];
    page.on("pageerror", (e) => erreurs.push(e.message));
    await connexion(page);
    const id = await creerDemande(page);
    await page.getByRole("button", { name: "Payer" }).click();
    await expect(page).toHaveURL(new RegExp(`/confirmation/${id}$`), { timeout: 30_000 });

    // R1 : la fenêtre de paiement reçoit le même montant (en centimes) et la même devise qu'avant
    const envoi = requetes.join("\n");
    expect(envoi).toContain(String(montant * 100));
    expect(envoi).toContain("XOF");

    await expect(page.getByText("Demande enregistrée avec succès !")).toBeVisible();
    // R2 : numéro de suivi complet, entièrement visible sur 360 px
    const numero = page.locator("[data-slot='numero-suivi']");
    await expect(numero).toContainText("Référence :");
    await expect(numero).toContainText(id);
    await dansLEcran(numero);
    await dansLEcran(page.getByText(id, { exact: true }));
    // R3 : mêmes informations qu'avant la refonte
    for (const libelle of [
        "Récapitulatif de votre demande", "Type de document :", "Nom du demandeur :", "Prénom du demandeur :",
        "Date de l'évènement :", "Email du demandeur :", "Date de soumission :", "Statut actuel :",
        "Que se passe-t-il maintenant ?",
    ]) await expect(page.getByText(libelle, { exact: false }).first()).toBeVisible();
    await expect(page.getByText("En attente de traitement")).toBeVisible();
    for (const bouton of [page.getByRole("button", { name: "Suivre ma demande" }), page.getByRole("button", { name: "Retour" })]) {
        await dansLEcran(bouton);
        expect((await bouton.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await pasDeDefilementHorizontal(page);
    await riendeCoupe(page);
    await shot(page, "CA-3.7-R2-confirmation-paiement-reussi-360");

    // Le numéro de suivi reste visible ensuite (retour sur la confirmation depuis le suivi)
    await page.goto("/suivi-demande");
    await page.locator("tbody tr", { hasText: id.substring(0, 8).toUpperCase() }).getByRole("button", { name: "Détails" }).click();
    await expect(page).toHaveURL(new RegExp(`/confirmation/${id}$`));
    await expect(page.locator("[data-slot='numero-suivi']")).toContainText(id);
    expect(erreurs).toEqual([]);
    await context.close();
});

for (const [cas, valeur, nom] of [
    ["annulé", "cancel", "CA-3.g.1-paiement-annule"],
    ["échoué", "failed", "CA-3.7-paiement-echoue"],
] as const) {
    test(`CA-3.7 / CA-3.g.1 — paiement ${cas} : message clair sur le site, demande conservée et non validée, paiement relançable`, async ({ browser }) => {
        const context = await contexteMobile(browser);
        const issue = { valeur: valeur as Issue };
        const requetes: string[] = [];
        await simulerPaystack(context, issue, requetes);
        const page = await context.newPage();
        await connexion(page);
        const id = await creerDemande(page);
        const origine = new URL(page.url()).origin;

        await page.getByRole("button", { name: "Payer" }).click();
        const message = page.getByRole("alert").filter({ hasText: "Paiement non effectué" });
        await expect(message).toBeVisible({ timeout: 30_000 });
        await expect(message).toContainText("Le paiement a été annulé ou n'a pas abouti.");
        await expect(message).toContainText("votre demande est conservée, en attente de paiement");
        await expect(message).toContainText("Vous pouvez relancer le paiement.");
        await dansLEcran(message);
        // Reste sur le site, sur la page de paiement de la même demande
        expect(new URL(page.url()).origin).toBe(origine);
        await expect(page).toHaveURL(new RegExp(`/paiement/${id}$`));
        const bouton = page.getByRole("button", { name: "Payer" });
        await expect(bouton).toBeEnabled();
        await pasDeDefilementHorizontal(page);
        await riendeCoupe(page);
        await shot(page, `${nom}-message-360`);

        // Ni validée ni perdue
        await demandeConservee(page, id);
        await shot(page, `${nom}-suivi-demande-conservee-360`);

        // Relance du paiement depuis le suivi : la fenêtre de paiement s'ouvre de nouveau
        await page.locator("tbody tr", { hasText: id.substring(0, 8).toUpperCase() }).getByRole("button", { name: "Payer" }).click();
        await expect(page).toHaveURL(new RegExp(`/paiement/${id}$`));
        const avant = requetes.length;
        issue.valeur = "success";
        await page.getByRole("button", { name: "Payer" }).click();
        await expect.poll(() => requetes.length).toBeGreaterThan(avant);
        await expect(page).toHaveURL(new RegExp(`/confirmation/${id}$`), { timeout: 30_000 });
        await expect(page.locator("[data-slot='numero-suivi']")).toContainText(id);
        await shot(page, `${nom}-relance-reussie-360`);
        await context.close();
    });
}

test("CA-3.7 — suivi d'un numéro valide sur 360 px : état de la demande affiché comme avant", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexion(page);
    const id = await creerDemande(page);
    await page.goto("/suivi-demande");
    await expect(page.getByRole("heading", { name: "Liste de mes demandes" })).toBeVisible();
    // R3 : mêmes colonnes qu'avant la refonte
    await expect(page.locator("thead th")).toHaveText(["Référence", "Statut", "Type", "Nom & prénom", "Email", "Date", "Action"]);
    const reference = id.substring(0, 8).toUpperCase();
    await page.getByLabel("Recherche").fill(reference);
    const lignes = page.locator("tbody tr");
    await expect(lignes).toHaveCount(1);
    const ligne = lignes.first();
    await expect(ligne).toContainText(reference);
    await expect(ligne).toContainText("Acte de naissance");
    await expect(ligne).toContainText(`${citoyen.nom} ${citoyen.prenom}`);
    // Même libellé d'état qu'avant la refonte (getStatusDemande), visible sans faire défiler le tableau
    const etat = ligne.getByText("En attente de paiement");
    await dansLEcran(etat);
    await dansLEcran(ligne.getByText(reference));
    // La recherche par numéro complet donne le même résultat
    await page.getByLabel("Recherche").fill(id);
    await expect(lignes).toHaveCount(1);
    await expect(lignes.first()).toContainText("En attente de paiement");
    for (const champ of [page.getByLabel("Recherche"), page.locator("#status-filter"), page.locator("#type-filter")]) {
        await dansLEcran(champ);
        expect((await champ.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await pasDeDefilementHorizontal(page);
    await riendeCoupe(page);
    await shot(page, "CA-3.7-suivi-numero-valide-360");
    await context.close();
});

test("CA-3.g.2 — numéro de suivi inconnu : message clair, reste sur la page, aucune information", async ({ browser }) => {
    const context = await contexteMobile(browser);
    const page = await context.newPage();
    await connexion(page);
    await page.goto("/suivi-demande");
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.getByLabel("Recherche").fill("ZZ999999-INCONNU");
    const message = page.getByRole("status").filter({ hasText: "Aucune demande trouvée" });
    await expect(message).toBeVisible();
    await expect(message).toContainText("Aucune demande ne correspond à vos critères");
    await dansLEcran(message);
    await expect(page).toHaveURL(/\/suivi-demande$/);
    await expect(page.locator("table")).toHaveCount(0);
    // Le cadre des résultats ne montre que le message : aucune référence, aucun état, aucune donnée
    const contenu = await page.locator("[data-slot='card']").filter({ has: message }).innerText();
    expect(contenu).not.toContain(citoyen.email);
    expect(contenu).not.toContain(citoyen.nom);
    expect(contenu).not.toContain("Acte de naissance");
    expect(contenu).not.toMatch(/En attente de paiement|En attente de traitement/);
    await pasDeDefilementHorizontal(page);
    await riendeCoupe(page);
    await shot(page, "CA-3.g.2-numero-inconnu-360");
    await context.close();
});
