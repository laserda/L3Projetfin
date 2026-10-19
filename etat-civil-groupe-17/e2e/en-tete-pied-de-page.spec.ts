import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// En-tête et pied de page du site public (US-3.b) : liens et destinations inchangés,
// lisibilité et cibles tactiles sur téléphone 360 px, menu mobile (au-dessus du contenu,
// entrées d'au moins 44 px, fermeture après navigation), menu refermé non bloquant,
// et aucune couleur codée en dur dans navbar.tsx et Footer.tsx.
// Données fictives uniquement (un citoyen fictif est inscrit pour les pages connectées).
//   SHOTS_DIR      dossier où enregistrer les captures (optionnel)
//   TEXT_DUMP_DIR  dossier où enregistrer les liens relevés sur chaque page (optionnel,
//                  pour comparer les liens avant / après la refonte)

const SHOTS_DIR = process.env.SHOTS_DIR;
const TEXT_DUMP_DIR = process.env.TEXT_DUMP_DIR;
const stamp = Date.now();
const MOBILE = { width: 360, height: 740 };
const DESKTOP = { width: 1280, height: 800 };
const CIBLE_TACTILE_MIN = 44;

const citoyen = {
    nom: "Kouame",
    prenom: "Fictif",
    dateNaissance: "1991-04-02",
    lieu: "Bouaké",
    telephone: "+2250506070809",
    adresse: "Rue fictive 7, Plateau",
    email: `citoyen.entete.${stamp}@exemple.test`,
    password: "MotDePasse1",
};

// Pages publiques (visiteur non connecté) et pages publiques d'un citoyen connecté
const PAGES_VISITEUR = ["/", "/login", "/register", "/nos-service"];
const PAGES_CONNECTE = [
    "/",
    "/nos-service",
    "/suivi-demande",
    "/citoyen-dashboard",
    "/nouvelle-demande-naissance?type=Naissance",
];

type Lien = { texte: string; href: string | null };

// Liens relevés AVANT la refonte (branche main) : ils ne doivent pas changer.
const LOGO = { texte: "ÉtatCivilCI", href: "/" };
const ACCUEIL = { texte: "Accueil", href: "/" };
const NOUVELLE_DEMANDE = { texte: "Nouvelle Demande", href: "../#nos-service" };
const SUIVI = { texte: "Suivre mes demandes", href: "/suivi-demande" };
const CONNEXION = { texte: "Connexion", href: "/login" };
const ENTETE_VISITEUR: Lien[] = [LOGO, ACCUEIL, NOUVELLE_DEMANDE, CONNEXION];
const ENTETE_CONNECTE: Lien[] = [LOGO, ACCUEIL, NOUVELLE_DEMANDE, SUIVI];
const MENU_VISITEUR: Lien[] = [ACCUEIL, NOUVELLE_DEMANDE];
const MENU_CONNECTE: Lien[] = [ACCUEIL, NOUVELLE_DEMANDE, SUIVI];
const PIED_DE_PAGE: Lien[] = [];

const entete = (page: Page) => page.locator("body > nav");
const piedDePage = (page: Page) => page.locator("body > footer");
const declencheurMenu = (page: Page) => entete(page).locator('button[aria-haspopup="dialog"]');
const menu = (page: Page) => page.locator('[data-slot="sheet-content"]');

async function shot(page: Page, name: string, fullPage = false) {
    if (!SHOTS_DIR) return;
    await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage });
}

async function shotOf(page: Page, selector: string, name: string) {
    if (!SHOTS_DIR) return;
    await page.locator(selector).first().screenshot({ path: path.join(SHOTS_DIR, `${name}.png`) });
}

function dump(name: string, data: unknown) {
    if (!TEXT_DUMP_DIR) return;
    fs.mkdirSync(TEXT_DUMP_DIR, { recursive: true });
    fs.writeFileSync(path.join(TEXT_DUMP_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

// Liens visibles d'une zone (texte complet, y compris le texte masqué sur petit écran, + href)
async function liensVisibles(page: Page, selector: string): Promise<Lien[]> {
    return page.locator(selector).first().evaluate((root) =>
        Array.from(root.querySelectorAll<HTMLAnchorElement>("a"))
            .filter((a) => {
                const r = a.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== "hidden";
            })
            .map((a) => ({
                texte: (a.textContent || "").replace(/\s+/g, "").length
                    ? (a.textContent || "").replace(/\s+/g, " ").trim().replace(/^(État) ?(Civil) ?(CI)$/, "$1$2$3")
                    : "",
                href: a.getAttribute("href"),
            }))
    );
}

async function ouvrirMenu(page: Page) {
    await declencheurMenu(page).tap();
    await expect(menu(page)).toBeVisible();
    // fin de l'animation d'ouverture
    await page.waitForTimeout(700);
}

async function inscrireCitoyen(browser: Browser) {
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
    const state = await context.storageState();
    await context.close();
    return state;
}

let sessionCitoyen: Awaited<ReturnType<BrowserContext["storageState"]>>;

const profils = [
    { nom: "visiteur", pages: PAGES_VISITEUR, entete: ENTETE_VISITEUR, menu: MENU_VISITEUR, connecte: false },
    { nom: "connecte", pages: PAGES_CONNECTE, entete: ENTETE_CONNECTE, menu: MENU_CONNECTE, connecte: true },
];

async function nouveauContexte(browser: Browser, mobile: boolean, connecte: boolean) {
    return browser.newContext({
        viewport: mobile ? MOBILE : DESKTOP,
        hasTouch: mobile,
        isMobile: mobile,
        storageState: connecte ? sessionCitoyen : undefined,
    });
}

const nomFichier = (p: string) => (p === "/" ? "accueil" : p.replace(/^\//, "").replace(/[/?=]/g, "-"));

test.beforeAll(async ({ browser }) => {
    sessionCitoyen = await inscrireCitoyen(browser);
});

for (const profil of profils) {
    test(`CA-3.2 / R2 — liens de l'en-tête et du pied de page inchangés sur ordinateur (${profil.nom})`, async ({ browser }) => {
        const context = await nouveauContexte(browser, false, profil.connecte);
        const page = await context.newPage();
        for (const p of profil.pages) {
            await page.goto(p);
            await expect(entete(page)).toBeVisible();
            const liensEntete = await liensVisibles(page, "body > nav");
            const liensPied = await liensVisibles(page, "body > footer");
            dump(`liens-desktop-${profil.nom}-${nomFichier(p)}`, { entete: liensEntete, piedDePage: liensPied });
            expect.soft(liensEntete, `en-tête ${p}`).toEqual(profil.entete);
            expect.soft(liensPied, `pied de page ${p}`).toEqual(PIED_DE_PAGE);
        }
        await context.close();
    });

    test(`CA-3.2 / R2 — liens de l'en-tête, du menu mobile et du pied de page inchangés à 360 px (${profil.nom})`, async ({ browser }) => {
        const context = await nouveauContexte(browser, true, profil.connecte);
        const page = await context.newPage();
        for (const p of profil.pages) {
            await page.goto(p);
            const liensEntete = await liensVisibles(page, "body > nav");
            const liensPied = await liensVisibles(page, "body > footer");
            await ouvrirMenu(page);
            const liensMenu = await liensVisibles(page, '[data-slot="sheet-content"]');
            dump(`liens-360-${profil.nom}-${nomFichier(p)}`, { entete: liensEntete, menu: liensMenu, piedDePage: liensPied });
            // sur téléphone : logo + bouton de connexion dans la barre, entrées dans le menu
            expect.soft(liensEntete, `barre d'en-tête ${p}`).toEqual(profil.connecte ? [LOGO] : [LOGO, CONNEXION]);
            expect.soft(liensMenu, `menu ${p}`).toEqual(profil.menu);
            expect.soft(liensPied, `pied de page ${p}`).toEqual(PIED_DE_PAGE);
        }
        await context.close();
    });

    test(`CA-3.2 — en-tête et pied de page lisibles et utilisables au doigt à 360 px (${profil.nom})`, async ({ browser }) => {
        const context = await nouveauContexte(browser, true, profil.connecte);
        const page = await context.newPage();
        for (const p of profil.pages) {
            await page.goto(p);
            const mesures = await page.evaluate(() => {
                const zones = Array.from(document.querySelectorAll<HTMLElement>("body > nav, body > footer"));
                const petitsTextes: string[] = [];
                const petitesCibles: string[] = [];
                const horsEcran: string[] = [];
                for (const zone of zones) {
                    const zr = zone.getBoundingClientRect();
                    if (zr.left < 0 || zr.right > window.innerWidth) horsEcran.push(zone.tagName);
                    const walker = document.createTreeWalker(zone, NodeFilter.SHOW_TEXT);
                    while (walker.nextNode()) {
                        const node = walker.currentNode as Text;
                        const el = node.parentElement;
                        if (!el || !node.textContent?.trim() || el.closest(".sr-only")) continue;
                        const s = getComputedStyle(el);
                        const r = el.getBoundingClientRect();
                        if (s.display === "none" || s.visibility === "hidden" || r.width === 0) continue;
                        if (parseFloat(s.fontSize) < 12) petitsTextes.push(`${node.textContent.trim()} (${s.fontSize})`);
                        if (r.left < 0 || r.right > window.innerWidth) horsEcran.push(node.textContent.trim());
                    }
                    for (const el of Array.from(zone.querySelectorAll<HTMLElement>("a, button"))) {
                        const r = el.getBoundingClientRect();
                        if (r.width === 0 || r.height === 0) continue;
                        if (r.height < 44 || r.width < 44) {
                            petitesCibles.push(`${el.tagName} « ${(el.textContent || el.getAttribute("aria-label") || "").trim()} » ${Math.round(r.width)}x${Math.round(r.height)}`);
                        }
                    }
                }
                return {
                    debordement: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                    petitsTextes,
                    petitesCibles,
                    horsEcran,
                };
            });
            expect.soft(mesures.debordement, `défilement horizontal ${p}`).toBeLessThanOrEqual(0);
            expect.soft(mesures.petitsTextes, `textes < 12 px ${p}`).toEqual([]);
            expect.soft(mesures.petitesCibles, `cibles tactiles < ${CIBLE_TACTILE_MIN} px ${p}`).toEqual([]);
            expect.soft(mesures.horsEcran, `éléments hors écran ${p}`).toEqual([]);

            // Menu ouvert : entrées et bouton de fermeture utilisables au doigt, textes lisibles
            await ouvrirMenu(page);
            const menuMesures = await menu(page).evaluate((panneau) => {
                const petitesCibles: string[] = [];
                const petitsTextes: string[] = [];
                for (const el of Array.from(panneau.querySelectorAll<HTMLElement>("a, button"))) {
                    const r = el.getBoundingClientRect();
                    if (r.height < 44 || r.width < 44) petitesCibles.push(`${el.tagName} « ${(el.textContent || "").trim()} » ${Math.round(r.width)}x${Math.round(r.height)}`);
                }
                for (const el of Array.from(panneau.querySelectorAll<HTMLElement>("*"))) {
                    if (el.closest(".sr-only") || !Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
                    const s = getComputedStyle(el);
                    if (parseFloat(s.fontSize) < 12) petitsTextes.push(`${el.textContent?.trim()} (${s.fontSize})`);
                }
                return { petitesCibles, petitsTextes };
            });
            expect.soft(menuMesures.petitesCibles, `menu : cibles tactiles < ${CIBLE_TACTILE_MIN} px ${p}`).toEqual([]);
            expect.soft(menuMesures.petitsTextes, `menu : textes < 12 px ${p}`).toEqual([]);
        }
        await context.close();
    });

    test(`CA-3.b.1 — menu mobile au-dessus du contenu, entrées d'au moins 44 px, fermé après navigation (${profil.nom})`, async ({ browser }) => {
        const context = await nouveauContexte(browser, true, profil.connecte);
        const page = await context.newPage();
        const depart = "/nos-service";
        for (const entree of profil.menu) {
            await page.goto(depart);
            await ouvrirMenu(page);
            if (entree === profil.menu[0]) await shot(page, `CA-3.b.1-menu-ouvert-360-${profil.nom}`);

            // Le menu est au-dessus du contenu : au centre de chaque entrée, c'est bien l'entrée
            // qui est touchée ; ailleurs sur l'écran, c'est le voile du menu (pas la page).
            const superposition = await page.evaluate(() => {
                const panneau = document.querySelector('[data-slot="sheet-content"]')!;
                const entrees = Array.from(panneau.querySelectorAll<HTMLAnchorElement>("a")).map((a) => {
                    const r = a.getBoundingClientRect();
                    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                    return { texte: a.textContent?.trim(), hauteur: r.height, auDessus: !!hit && a.contains(hit) };
                });
                const pr = panneau.getBoundingClientRect();
                const pointsContenu: string[] = [];
                for (let y = 20; y < window.innerHeight; y += 60) {
                    for (let x = 10; x < pr.left; x += 30) {
                        const hit = document.elementFromPoint(x, y);
                        if (!hit || !hit.closest('[data-slot="sheet-overlay"], [data-slot="sheet-content"]')) {
                            pointsContenu.push(`${x},${y}:${hit?.tagName}`);
                        }
                    }
                }
                return { entrees, pointsContenu };
            });
            expect(superposition.entrees.length).toBe(profil.menu.length);
            for (const e of superposition.entrees) {
                expect.soft(e.auDessus, `entrée « ${e.texte} » au-dessus du contenu`).toBe(true);
                expect.soft(e.hauteur, `hauteur de « ${e.texte} »`).toBeGreaterThanOrEqual(CIBLE_TACTILE_MIN);
            }
            expect.soft(superposition.pointsContenu, "points de la page non couverts par le menu ouvert").toEqual([]);

            // Toucher l'entrée : navigation vers la même destination, puis le menu se ferme
            const attendu = await page.evaluate((href) => {
                const u = new URL(href, location.href);
                return u.pathname + u.hash;
            }, entree.href!);
            await menu(page).getByRole("link", { name: entree.texte, exact: true }).tap();
            await expect
                .poll(() => page.evaluate(() => location.pathname + location.hash))
                .toBe(attendu);
            await expect(menu(page), `menu fermé après « ${entree.texte} »`).toHaveCount(0);
            await expect(page.locator('[data-slot="sheet-overlay"]')).toHaveCount(0);
        }
        await context.close();
    });

    test(`CA-3.b.2 — menu refermé : la page reçoit bien les touches partout (${profil.nom})`, async ({ browser }) => {
        const context = await nouveauContexte(browser, true, profil.connecte);
        const page = await context.newPage();
        const facons: [string, (page: Page) => Promise<void>][] = [
            ["bouton de fermeture", (pg) => menu(pg).getByRole("button", { name: "Close" }).tap()],
            ["touche Échap", (pg) => pg.keyboard.press("Escape")],
            ["toucher le voile", (pg) => pg.touchscreen.tap(20, 400)],
            ["navigation", (pg) => menu(pg).getByRole("link", { name: "Accueil", exact: true }).tap()],
        ];
        for (const [facon, fermer] of facons) {
            await page.goto("/nos-service");
            await ouvrirMenu(page);
            await fermer(page);
            await expect(menu(page), `menu fermé (${facon})`).toHaveCount(0);
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            if (facon === "bouton de fermeture") await shot(page, `CA-3.b.2-menu-ferme-360-${profil.nom}`);

            // Aucun voile résiduel, aucun pointer-events: none sur la page
            const etat = await page.evaluate(() => ({
                voiles: document.querySelectorAll('[data-slot="sheet-overlay"], [data-slot="sheet-content"]').length,
                pointerEventsBody: getComputedStyle(document.body).pointerEvents,
                pointerEventsHtml: getComputedStyle(document.documentElement).pointerEvents,
            }));
            expect.soft(etat, `état après fermeture (${facon})`).toEqual({
                voiles: 0,
                pointerEventsBody: "auto",
                pointerEventsHtml: "auto",
            });

            // Grille de touches réelles sur toute la page sous l'en-tête : chaque touche
            // doit atteindre un élément de la page (jamais le menu, son voile ou <html>).
            await page.evaluate(() => {
                const w = window as unknown as { __touches: string[] };
                w.__touches = [];
                document.addEventListener(
                    "click",
                    (e) => {
                        const t = e.target as Element;
                        const bloque = t === document.documentElement || !!t.closest('[data-slot="sheet-overlay"], [data-slot="sheet-content"]');
                        w.__touches.push(bloque ? `BLOQUE:${t.tagName}` : "ok");
                        e.preventDefault();
                        e.stopPropagation();
                    },
                    { capture: true }
                );
            });
            const hauteurEntete = await entete(page).evaluate((n) => n.getBoundingClientRect().bottom);
            let nbTouches = 0;
            for (let y = Math.ceil(hauteurEntete) + 10; y < MOBILE.height; y += 70) {
                for (let x = 15; x < MOBILE.width; x += 55) {
                    await page.touchscreen.tap(x, y);
                    nbTouches++;
                }
            }
            const touches = await page.evaluate(() => (window as unknown as { __touches: string[] }).__touches);
            expect.soft(touches.length, `touches reçues par la page (${facon})`).toBe(nbTouches);
            expect.soft(touches.filter((t) => t !== "ok"), `touches bloquées (${facon})`).toEqual([]);
        }
        await context.close();
    });
}

test("CA-3.2 — nouveau design de l'en-tête et du pied de page (ordinateur et 360 px)", async ({ browser }) => {
    for (const mobile of [false, true]) {
        const context = await nouveauContexte(browser, mobile, false);
        const page = await context.newPage();
        await page.goto("/");
        const suffixe = mobile ? "360" : "desktop";
        await shotOf(page, "body > nav", `CA-3.2-en-tete-${suffixe}`);
        await piedDePage(page).scrollIntoViewIfNeeded();
        await shotOf(page, "body > footer", `CA-3.2-pied-de-page-${suffixe}`);
        await shot(page, `CA-3.2-accueil-${suffixe}`, true);
        // Nouveau design : bandeau aux couleurs du drapeau en haut de l'en-tête et du pied de page
        await expect.soft(entete(page).locator('[data-slot="bandeau-drapeau"]')).toBeVisible();
        await expect.soft(piedDePage(page).locator('[data-slot="bandeau-drapeau"]')).toBeVisible();
        // Sur ordinateur, les entrées sont dans la barre ; sur téléphone, dans le menu
        await expect.soft(declencheurMenu(page)).toBeVisible({ visible: mobile });
        await expect.soft(entete(page).getByRole("link", { name: "Accueil", exact: true })).toBeVisible({ visible: !mobile });
        await context.close();
    }
});

test("R4 — aucune couleur codée en dur dans navbar.tsx et Footer.tsx", async () => {
    const dossier = path.resolve(__dirname, "../components");
    const interdits: [string, RegExp][] = [
        ["code hexadécimal", /#[0-9a-fA-F]{3,8}\b/],
        ["fonction de couleur", /\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/],
        [
            "classe de palette Tailwind brute",
            /\b(bg|text|border|ring|ring-offset|outline|divide|fill|stroke|from|via|to|shadow|decoration|placeholder|accent|caret)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\b/,
        ],
        ["valeur arbitraire de couleur", /-\[(#|rgb|hsl|color)/],
        ["couleur en style ou attribut", /\b(color|fill|stroke|background(Color)?)\s*[:=]\s*["'{]/],
    ];
    for (const fichier of ["navbar.tsx", "Footer.tsx"]) {
        const lignes = fs.readFileSync(path.join(dossier, fichier), "utf8").split("\n");
        const trouves: string[] = [];
        lignes.forEach((ligne, i) => {
            if (/^\s*(\/\/|\{?\/\*)/.test(ligne)) return; // commentaires
            for (const [nom, re] of interdits) if (re.test(ligne)) trouves.push(`${fichier}:${i + 1} ${nom} : ${ligne.trim()}`);
        });
        expect.soft(trouves, fichier).toEqual([]);
    }
});
