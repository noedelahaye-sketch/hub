// Le calendrier éditorial — la matière et son rendu, partagés par les espaces.
//
// Construit d'abord pour Yuno, puis extrait ici quand le FC Hermitage a eu le
// même besoin : c'est le même outil, la même table (`publications`, colonne
// `espace`), les mêmes gestes. Seuls changent les réseaux proposés et les
// rubriques de départ, passés en paramètres.
//
// Le principe qui tient tout : **une idée est une publication sans date**.
// Noter une idée prend cinq secondes ; la programmer, c'est lui donner une date.

import { construireFormulaire, ICONE_DATE, SIGNES } from './gabarits.js';
import { depuisDateISO, echeanceLisible, echapper } from './format.js';
import {
  CRAYON_DETAIL,
  CORBEILLE,
  ICONE_FORMAT_IDEE,
  RESEAUX,
  FORMATS,
  CYCLES_PUBLICATION,
  NOMS_STATUTS_BASE,
  cyclePublication,
  nomDuStatut,
  pastilleStatutPublication,
} from './calendrier-commun.js';

// L'ordre du cycle. Chaque statut connaît son suivant ; « publié » n'en a pas.
// Le cycle est un paramètre, parce qu'il n'est pas le même partout : Yuno pose
// une étape « à développer » entre l'idée et le brouillon (une idée qui mérite
// du travail avant d'être écrite), et le FC Hermitage n'a que trois états
// depuis le 25 août 2026 — à préparer, à programmer, publié.
//
// Les cycles eux-mêmes vivent dans `calendrier-commun.js`, avec les réseaux et
// les formats : la tuile du calendrier en a besoin, et c'est ce fichier-ci qui
// importe l'autre. Ils sont réexportés ici pour qui parle d'éditorial.
export const STATUTS = CYCLES_PUBLICATION.formation;
export const STATUTS_YUNO = CYCLES_PUBLICATION.photo;
export const STATUTS_FCH = CYCLES_PUBLICATION.fch;

export const NOMS_STATUTS = NOMS_STATUTS_BASE;
export { nomDuStatut };

// Le rappel de ce qui fait tenir un carrousel. Sans IA : c'est un aide-mémoire
// qui ferme un débat mental, pas un outil qui écrit à la place de Noé.
const CHECKLIST_CARROUSEL = [
  'Un hook de 5 à 8 mots sur la slide 1.',
  'Les slides 1 ET 2 fortes — la 2 retient autant que la 1.',
  'Tension, puis développement, puis appel à l’action.',
  'Légende courte.',
];

function checklistCarrousel() {
  return `
    <details class="checklist-carrousel">
      <summary>Checklist carrousel</summary>
      <ul class="liste-checklist">
        ${CHECKLIST_CARROUSEL.map((point) => `<li>${point}</li>`).join('')}
      </ul>
    </details>`;
}

export function etiquettes(pub) {
  return `
    <span class="etiquette etiquette-reseau">${echapper(RESEAUX[pub.reseau] ?? pub.reseau)}</span>
    <span class="etiquette">${echapper(FORMATS[pub.format] ?? pub.format)}</span>`;
}

// LA PASTILLE DE DATE, partagée par la fiche et par la tuile de la banque
// (16 septembre 2026). Vide, elle dit « Programmer » ; posée, elle dit le jour —
// c'est le même bouton qui annonce et qui rend compte.
//
// LE CHAMP EST TRANSPARENT PAR-DESSUS : c'est lui qu'on touche, donc le
// sélecteur natif s'ouvre partout sans `showPicker()`, que Safari n'a eu que
// tard. `pointer-events: none` sur la pastille laisse passer le clic.
export function pastilleDate(pub) {
  const jour = pub.date_prevue
    ? depuisDateISO(pub.date_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'Programmer';
  return `<span class="choix-champ pastille-date pub-date" data-libelle="Programmer">
    <span class="choix-declencheur${pub.date_prevue ? '' : ' choix-vide'}"
      title="${echapper(pub.date_prevue ? `Programmée le ${jour}` : `Programmer « ${pub.titre} »`)}"
      >${ICONE_DATE}<span>${echapper(jour)}</span></span>
    <input type="date" data-programmer="${echapper(pub.id)}"
      value="${echapper(pub.date_prevue ?? '')}"
      aria-label="Programmer « ${echapper(pub.titre)} »">
  </span>`;
}

// L'en-tête d'une publication : ce qu'elle est, où elle se range, et quand.
// Partagé par l'aperçu et la fiche complète — les deux montrent la même chose
// en tête, seule la suite diffère.
function entetePublication(pub, piliers) {
  const datee = Boolean(pub.date_prevue);

  return `
    <span class="tuile-entete">
      ${etiquettes(pub)}
      ${
        piliers && pub.pilier
          ? `<span class="etiquette etiquette-pilier" data-pilier="${echapper(
              String(pub.pilier),
            )}" title="${echapper(`${pub.pilier}. ${piliers[pub.pilier]?.nom ?? ''}`)}"><span
              >${echapper(`${pub.pilier}. ${piliers[pub.pilier]?.nom ?? ''}`)}</span></span>`
          : ''
      }
      ${pub.rubrique ? `<span class="pub-rubrique">${echapper(pub.rubrique)}</span>` : ''}
      ${
        datee
          ? `<span class="discret quand">${echapper(
              echeanceLisible(depuisDateISO(pub.date_prevue)),
            )}</span>`
          : ''
      }
    </span>`;
}

// L'aperçu : ce qu'elle est, ce qu'elle dit, où elle en est. Rien d'autre. La
// preuve, le « pourquoi chez moi », les notes, la checklist et les gestes
// vivent dans la fenêtre — une banque se parcourt du regard, et quarante-trois
// tuiles qui déballent tout ne se parcourent pas.
// La tuile entière est le bouton : role et tabindex la rendent ouvrable au
// clavier, comme les cases du calendrier.
// UNE IDÉE EST UN FORMAT, ET C'EST L'EXCEPTION QU'ON MARQUE (16 septembre 2026,
// règle de Noé). Écrire « reproductible » sur dix-huit idées ne distinguerait
// rien — c'est la leçon d'« en sommeil », qui s'affichait sur les neuf habitudes
// à la fois. Seule celle qui ne se refait pas porte un mot.
//
// `formats` EST UNE OPTION, et ce n'est pas de la prudence gratuite : le geste
// qui fabrique une parution vit chez Yuno. Marquer les idées du FCH d'un signe
// dont son site ne sait rien faire serait une promesse qu'il ne tient pas.
function marqueDuFormat(pub, { formats, trace, fenetre = false }) {
  if (!formats) return '';
  // `trace` est une FONCTION : l'appelant seul sait compter les parutions d'un
  // format, parce que lui seul a la liste entière sous la main. Une chaîne
  // aurait obligé chaque boucle à la calculer avant d'appeler le gabarit.
  const dit = typeof trace === 'function' ? trace(pub) : trace;
  // DANS LA FENÊTRE, LA PASTILLE LE DIT DÉJÀ, et elle le règle : garder
  // l'étiquette à trois centimètres d'elle écrirait deux fois la même chose,
  // dont une qu'on ne peut pas toucher.
  return `${
    !pub.reproductible && !pub.date_prevue && !fenetre
      ? `<span class="etiquette etiquette-unique"
           title="Ce contenu ne se refait pas : il quitte la banque une fois paru"
           >contenu unique</span>`
      : ''
  }${dit ? `<span class="discret pub-trace">${echapper(dit)}</span>` : ''}`;
}

// LA PASTILLE DU FORMAT EST UN INTERRUPTEUR (16 septembre 2026, demande de Noé :
// « reproductible ou non, je dois simplement devoir appuyer sur le bouton pour
// activer, pas sélectionner reproductible ou contenu unique »).
//
// CE QUE ÇA RENVERSE : la convention du 29 août dit qu'« une pastille booléenne
// se fait avec un champ de choix à deux options », parce qu'*une pastille
// affiche la VALEUR de sa source, et qu'une case à cocher vaut « oui » qu'elle
// soit cochée ou non — le libellé disait donc « oui » en permanence*. **Ce
// défaut-là se règle autrement** : le libellé ne bouge pas, c'est l'ÉTAT DE LA
// PASTILLE qui dit tout. Un mot pour nommer, une apparence pour dire. La
// convention reste juste là où les deux valeurs ont chacune un nom qu'on doit
// lire — l'état d'une publication, par exemple.
//
// PAS DE TEINTE D'ÉTAPE : reproductible n'est pas un cran d'un cycle. Allumée,
// la pastille prend l'encre pleine ; éteinte, celle du service.
// L'ICÔNE SEULE, SANS LE MOT (16 septembre 2026, demande de Noé : « pour le
// reproductible ou non, mets que l'icône, pas de texte »). C'est la MÊME icône
// que dans la tuile de capture — un réglage qui se pose à deux endroits ne peut
// pas s'y dessiner de deux façons. Le mot part dans le `title` et dans le nom
// accessible, comme pour le crayon et la corbeille de la même rangée.
function pastilleDuFormat(pub) {
  return `<button type="button" class="etiquette pub-format-pastille${
    pub.reproductible ? ' active' : ''}" data-basculer-format="${echapper(pub.id)}"
    aria-pressed="${pub.reproductible ? 'true' : 'false'}"
    aria-label="Reproductible"
    title="${pub.reproductible
      ? 'Reproductible — ce format se refait, il reste dans la banque après chaque parution'
      : 'Contenu unique — il quitte la banque une fois paru'}"
    >${ICONE_FORMAT_IDEE}</button>`;
}

// LA TUILE D'UNE IDÉE SE LIT DU HAUT VERS LE BAS (16 septembre 2026, demande de
// Noé : *« je préférerais que les pastilles des piliers, du réseau et du type de
// publication soient en dessous du titre, et que la pastille d'état soit
// au-dessus, avec un bouton pour programmer — et lorsque c'est programmé ça
// affiche la date »*).
//
// ET ÇA RANGE LA TUILE PAR CE QU'ON EN FAIT : en haut ce qui se RÈGLE — où en
// est cette idée, et quand elle sort ; au milieu ce qu'elle EST, son titre ; en
// bas ce qui la CLASSE, et qu'on ne touche pas. *Avant, les trois mentions de
// classement ouvraient la tuile et repoussaient le titre : on lisait
// « INSTAGRAM CARROUSEL 3. DANS L'ŒIL… » avant de savoir de quelle idée il
// s'agissait.*
export function construireApercuPublication(pub, options = {}) {
  const { piliers = null, formats = false, trace = null, pastille = false } = options;

  return `
    <li class="tuile-apercu" role="button" tabindex="0"
      ${pub.pilier ? `data-pilier="${echapper(String(pub.pilier))}"` : ''}
      data-ouvrir-pub="${echapper(pub.id)}"
      aria-label="Ouvrir « ${echapper(pub.titre)} »">
      ${
        // Sans la pastille — le FCH ne l'a pas demandée —, l'ancien en-tête
        // revient : c'est le même gabarit pour deux sites, et l'un ne dicte pas
        // la forme de l'autre.
        pastille ? '' : entetePublication(pub, piliers)
      }
      <span class="pub-titre">${echapper(pub.titre)}</span>
      ${
        // LE CLASSEMENT COLLE AU TITRE (correction de Noé, 16 septembre 2026) :
        // il dit ce que cette idée EST — sur quel réseau, sous quelle forme,
        // dans quel axe —, et ça se lit dans la foulée du nom. Poussé au bas de
        // la tuile, il devenait un pied de page dont on ne savait plus qu'il
        // qualifiait le titre.
        //
        // DEUX RANGS, ET PAS UN : le réseau et le format côte à côte — ce sont
        // les deux moitiés d'une même décision, « où je poste » et « sous quelle
        // forme » —, puis le pilier SEUL en dessous, où il a toute la largeur.
        // C'est ce qui lui permet de se lire en entier là où, partagé avec deux
        // voisines, il s'arrêtait à « 3. DANS L'ŒIL… ».
        pastille
          ? `<span class="pub-classement">
               <span class="pub-service">${echapper(
                 [RESEAUX[pub.reseau] ?? pub.reseau, FORMATS[pub.format] ?? pub.format,
                   pub.rubrique].filter(Boolean).join(' · '),
               )}</span>
               ${
                 piliers && pub.pilier
                   ? `<span class="pub-pilier" data-pilier="${echapper(String(pub.pilier))}">
                        <span class="pilier-rang chiffre" aria-hidden="true">${echapper(
                          String(pub.pilier),
                        )}</span>
                        <span class="pub-pilier-nom">${echapper(
                          piliers[pub.pilier]?.nom ?? '',
                        )}</span>
                      </span>`
                   : ''
               }
             </span>`
          : `<span class="pub-statut">statut :
               <strong>${nomDuStatut(pub.espace, pub.statut)}</strong></span>`
      }
      ${marqueDuFormat(pub, { formats, trace })}
      ${
        // LES DEUX RÉGLAGES FERMENT LA TUILE (correction de Noé, 16 septembre
        // 2026 : « repasse l'état et programmer en bas de tuile, en dessous des
        // détails en tout cas »).
        //
        // ET ÇA REMET LE TITRE EN PREMIER : en tête, les deux pastilles étaient
        // la première chose lue de chaque tuile, alors qu'elles disent la même
        // chose sur dix-huit d'entre elles. **Ce qu'on lit d'abord doit être ce
        // qui distingue.** Collées au bas de la hauteur commune, elles alignent
        // en plus leurs vingt paires sur une seule ligne.
        pastille
          ? `<span class="pub-reglages">
               ${pastilleStatutPublication(pub)}
               ${pastilleDate(pub)}
             </span>`
          : ''
      }
    </li>`;
}

// Le contenu complet, sans son enveloppe : la tuile de « À venir » l'enferme
// dans un <li>, la fenêtre d'une idée le pose tel quel.
// `options` porte ce qui change d'un espace à l'autre : le cycle des statuts,
// et l'aide à la création (les piliers et la checklist sont à Yuno).
export function corpsPublication(pub, options = {}) {
  const {
    cycle = cyclePublication(pub.espace),
    checklist = false,
    piliers = null,
    fenetre = false,
    pastille = false,
    formats = false,
    trace = null,
  } = options;
  const suivant = cycle[cycle.indexOf(pub.statut) + 1];
  const datee = Boolean(pub.date_prevue);

  return `
      ${entetePublication(pub, piliers)}
      <span class="pub-titre">${echapper(pub.titre)}</span>
      ${marqueDuFormat(pub, { formats, trace, fenetre })}
      ${
        // La preuve dit pourquoi le format marche déjà ; le « pourquoi moi »,
        // pourquoi il est à sa place chez Noé. Les deux ferment le débat qui
        // revenait à chaque publication.
        pub.preuve
          ? `<span class="discret pub-preuve"><strong>Preuve</strong> ${echapper(pub.preuve)}</span>`
          : ''
      }
      ${
        pub.pourquoi_moi
          ? `<span class="discret pub-preuve"><strong>Pourquoi chez moi</strong> ${echapper(
              pub.pourquoi_moi,
            )}</span>`
          : ''
      }
      ${pub.notes ? `<span class="discret pub-notes">${echapper(pub.notes)}</span>` : ''}
      ${
        // `post` reste reconnu à côté de `carrousel` : les deux formats ont
        // fusionné le 15 août 2026, et d'anciennes lignes peuvent encore
        // porter l'un ou l'autre.
        checklist && ['carrousel', 'post'].includes(pub.format) ? checklistCarrousel() : ''
      }
      <span class="pub-actions">
        ${
          // L'ÉTAT EST UN MENU DÉROULANT (demande de Noé, 29 août 2026), et
          // c'est LA MÊME pastille que celle du calendrier — dessinée une seule
          // fois dans `calendrier-commun.js`. Elle remplace un trio qui pesait
          // trois lignes : « statut : à préparer », un bouton « Passer en à
          // programmer » et « Repasser en idée ». Elle sait en plus ce que le
          // bouton ne savait pas : sauter un cran, et revenir en arrière.
          //
          // `pastille: false` par défaut — Yuno garde son bouton, personne ne
          // l'a demandé là-bas.
          pastille
            ? pastilleStatutPublication(pub)
            : `<span class="pub-statut">statut :
                 <strong>${nomDuStatut(pub.espace, pub.statut)}</strong></span>
               ${
                 suivant
                   ? `<button type="button" class="bouton-secondaire bouton-mini"
                        data-avancer="${echapper(pub.id)}">Passer en ${nomDuStatut(
                          pub.espace,
                          suivant,
                        )}</button>`
                   : ''
               }`
        }
        ${
          !suivant && pub.lien_publie
            ? `<a class="discret" href="${echapper(pub.lien_publie)}" target="_blank" rel="noopener">voir ↗</a>`
            : ''
        }
        ${
          datee
            ? pub.statut !== 'publie' && !pastille
              // Avec la pastille, le retour en arrière vit DANS le menu : garder
              // « Repasser en idée » à côté ferait deux gestes pour la même
              // chose, dont l'un efface la date sans le dire.
              ? `<button type="button" class="lien-discret bouton-mini"
                   data-deprogrammer="${echapper(pub.id)}"
                   title="Retirer la date : la publication redevient une idée">Repasser en idée</button>`
              : ''
            // LA DATE EST UNE PASTILLE, ELLE AUSSI (règle du hub du 30 août
            // 2026, appliquée ici le 16 septembre) : le champ natif restait
            // nu — « jj/mm/aaaa » encadré au milieu d'une rangée de gestes,
            // c'est-à-dire un espace où l'on ÉCRIT posé parmi des choses qu'on
            // RÈGLE. Le dessin est celui des formulaires, au trait près : une
            // icône de calendrier, le mot du champ tant qu'il est vide, et le
            // champ TRANSPARENT PAR-DESSUS — c'est lui qu'on touche, donc le
            // sélecteur natif s'ouvre partout sans `showPicker()`.
            : pastilleDate(pub)
        }
        ${
          // LE FORMAT SE DÉCLARE DANS SA FICHE, et nulle part ailleurs : c'est
          // un réglage qu'on pose une fois en écrivant l'idée, pas un geste du
          // quotidien. Il ne s'offre pas sur une ligne DATÉE — une parution
          // n'est pas un format, et le lui demander n'aurait aucun sens.
          // UNE PASTILLE, PAS UN LIEN : c'est un RÉGLAGE, et la grammaire du
          // hub est claire — « tout ce qui se règle devient une pastille ».
          // Elle affiche la VALEUR et non le geste : un lien qui dit « Une
          // seule fois » quand l'idée est reproductible annonce ce qui va se
          // passer, ce qui est le rôle d'un bouton, pas d'un réglage.
          //
          // DEUX OPTIONS DANS UN MENU, et non une bascule au clic : c'est la
          // convention du 29 août 2026 — « une pastille booléenne se fait avec
          // un champ de choix à deux options ». On voit les deux valeurs avant
          // de choisir.
          formats && !datee ? pastilleDuFormat(pub) : ''
        }
        ${
          // Dans une fenêtre, la croix de suppression tomberait sous celle qui
          // ferme, au même bord : deux « × » l'un au-dessus de l'autre, dont
          // l'un est irréversible. Ici le geste s'écrit.
          // DEUX ICÔNES POUR FERMER LA RANGÉE (16 septembre 2026, demande de
          // Noé : « supprimer doit être une icône, et il doit y avoir une icône
          // pour pouvoir modifier »). Ce sont le crayon et la corbeille du
          // détail d'un élément du calendrier, repris tels quels : deux dessins
          // de crayon dans le même site finiraient par ne plus se ressembler.
          //
          // POURQUOI DES ICÔNES ICI, alors que le mot s'écrivait : « Supprimer
          // l'idée » était le seul texte long de la rangée et le déséquilibrait
          // — *mesuré à 16,9 px de corps contre 12,2 pour tout le reste, le
          // geste le plus irréversible en était le plus gros.* Le mot n'est pas
          // perdu : il reste dans `title` et dans le nom accessible, comme pour
          // les icônes du détail.
          fenetre
            ? `<span class="pub-gestes">
                 <button type="button" class="bouton-icone" data-modifier-pub="${echapper(pub.id)}"
                   title="Modifier" aria-label="Modifier « ${echapper(pub.titre)} »"
                   >${CRAYON_DETAIL}</button>
                 <button type="button" class="bouton-icone" data-supprimer-pub="${echapper(pub.id)}"
                   title="Supprimer l'idée"
                   aria-label="Supprimer « ${echapper(pub.titre)} »">${CORBEILLE}</button>
               </span>`
            : `<button type="button" class="lien-discret bouton-mini bouton-retirer"
                 data-supprimer-pub="${echapper(pub.id)}"
                 title="Supprimer"
                 aria-label="Supprimer « ${echapper(pub.titre)} »">×</button>`
        }
      </span>`;
}

// La tuile complète, telle qu'elle sert encore à « À venir » et au site du FCH.
// `ouvrable` : la tuile s'ouvre au clic (le site FCH édite ses publications en
// fenêtre volante, 24 août 2026) — sauf sur ses propres contrôles, c'est le
// gestionnaire de l'espace qui fait le tri.
export function construirePublication(pub, options = {}) {
  const porte = options.ouvrable ? ` data-ouvrir-pub="${echapper(pub.id)}"` : '';
  return `<li${porte}>${corpsPublication(pub, options)}</li>`;
}

// UNE SEULE PARUTION PAR SÉRIE DANS « À VENIR » (29 août 2026, demande de Noé :
// « les publications régulières ne doivent pas toutes être visibles dans à
// venir, comme pour les tâches récurrentes »).
//
// C'est la règle de l'espace Tâches, mot pour mot (`separerLesSeries`,
// js/taches.js, 27 août) : sans elle, les 28 parutions des deux séries
// hebdomadaires du club noyaient les quelques publications qu'il y avait
// vraiment à préparer. Rien n'est caché — tout se déplie.
//
// « Prochaine » veut dire la plus proche, pas la première à venir : une
// parution dont le jour est passé reste devant. Le hub ne compte pas les
// retards, mais il ne les efface pas non plus.
//
// Exportée pour être vérifiable seule, avec des publications factices.
export function separerLesSeriesPub(publications) {
  const seules = [];
  const parSerie = new Map();

  for (const pub of publications) {
    if (!pub.serie_id) {
      seules.push(pub);
      continue;
    }
    const deja = parSerie.get(pub.serie_id);
    if (deja) deja.push(pub);
    else parSerie.set(pub.serie_id, [pub]);
  }

  const prochaines = [];
  const series = [];

  for (const occurrences of parSerie.values()) {
    const triees = [...occurrences].sort((a, b) =>
      String(a.date_prevue ?? '').localeCompare(String(b.date_prevue ?? '')),
    );
    prochaines.push(triees[0]);
    if (triees.length > 1) series.push(triees.slice(1));
  }

  return { aVenir: [...seules, ...prochaines], series };
}

function blocDUneSeriePub(occurrences, options) {
  const [premiere] = occurrences;
  return `
    <details class="backlog serie-repliee">
      <summary>
        <span class="serie-titre">${echapper(premiere.titre)}</span>
        <span class="serie-rythme">qui revient</span>
        <span class="chiffre">${occurrences.length}</span>
      </summary>
      <ul>${occurrences.map((pub) => construirePublication(pub, options)).join('')}</ul>
    </details>`;
}

export function construireAVenir(publications, options = {}) {
  // `series: false` par défaut — Yuno n'a rien demandé, et sa banque d'idées
  // se lit autrement. Le FCH l'active.
  const { series: replier = false } = options;

  const datees = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));

  if (!datees.length) {
    return `<p class="vide">Rien de programmé. Une idée de la banque n'attend qu'une date.</p>`;
  }

  if (!replier) {
    return `<ul>${datees.map((pub) => construirePublication(pub, options)).join('')}</ul>`;
  }

  const { aVenir, series } = separerLesSeriesPub(datees);
  const triees = aVenir.sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));
  const repliees = series.reduce((total, lot) => total + lot.length, 0);

  return `
    <ul>${triees.map((pub) => construirePublication(pub, options)).join('')}</ul>
    ${
      series.length
        ? `<p class="discret sous-titre">La prochaine fois de chaque série est restée
             au-dessus. Voici ce qui suit — <span class="chiffre">${repliees}</span> parutions.</p>
           ${series
             .sort((a, b) => a[0].date_prevue.localeCompare(b[0].date_prevue))
             .map((lot) => blocDUneSeriePub(lot, options))
             .join('')}`
        : ''
    }`;
}

// --- TRIER ET FILTRER LA BANQUE (16 septembre 2026, demande de Noé : « rajoute
// un mode de tri et de filtre comme on a fait ailleurs, par rapport aux
// différents paramètres ») ---------------------------------------------------
//
// C'EST LA BARRE DE LA BIBLIOTHÈQUE, au trait près — deux icônes, une rangée de
// critères qui se déplie, une pastille par critère et son panneau à cocher.
// **Écrire un troisième dessin pour un geste qui en a déjà un, c'est fabriquer
// la divergence qu'on passe ensuite à rattraper.**
//
// LES CLASSES RESTENT `.livres-*`, et c'est assumé : ce sont celles de la BARRE,
// pas celles d'un livre. C'est le même argument que `.livre-*` gardé pour
// l'étagère des films — les renommer serait une refonte pour un nom qu'on ne lit
// jamais.
//
// CE QUE ÇA REMPLACE : deux menus natifs, « Pilier » et « Statut », à choix
// UNIQUE. « Les réels ET les stories » est une question qu'on se pose, et un
// choix unique ne savait pas y répondre ; le réseau, le format et la nature de
// l'idée n'étaient filtrables nulle part.

// ON N'OFFRE QUE CE QUI EXISTE, avec son compte : un filtre « TikTok » sur une
// banque qui n'en a aucun est une porte sur une pièce vide.
export function criteresDesIdees(idees, { piliers = null } = {}) {
  const compte = (lis) => idees.filter(lis).length;
  const espace = idees[0]?.espace ?? 'photo';
  const cycle = cyclePublication(espace).filter((statut) => statut !== 'publie');

  return [
    {
      cle: 'statut',
      nom: 'État',
      options: cycle
        .map((v) => [v, nomDuStatut(espace, v), compte((i) => i.statut === v)])
        .filter(([, , n]) => n),
    },
    ...(piliers
      ? [{
        cle: 'pilier',
        nom: 'Pilier',
        options: [
          ...Object.entries(piliers).map(([rang, nom]) => [
            rang, nom, compte((i) => String(i.pilier ?? '') === rang),
          ]),
          ['', 'Sans pilier', compte((i) => !i.pilier)],
        ].filter(([, , n]) => n),
      }]
      : []),
    {
      cle: 'reseau',
      nom: 'Réseau',
      options: Object.entries(RESEAUX)
        .map(([v, mot]) => [v, mot, compte((i) => i.reseau === v)])
        .filter(([, , n]) => n),
    },
    {
      cle: 'format',
      nom: 'Format',
      options: Object.entries(FORMATS)
        .map(([v, mot]) => [v, mot, compte((i) => i.format === v)])
        .filter(([, , n]) => n),
    },
    {
      cle: 'reproductible',
      nom: 'Nature',
      options: [
        ['oui', 'Reproductible', compte((i) => i.reproductible !== false)],
        ['non', 'Contenu unique', compte((i) => i.reproductible === false)],
      ].filter(([, , n]) => n),
    },
  ];
}

// « PAR DÉFAUT » N'EST PAS UNE ABSENCE DE TRI : c'est l'ordre de la banque — la
// dernière notée en tête, parce qu'une idée fraîche est celle qu'on vient
// d'avoir et qu'on veut retrouver.
export function trisDesIdees() {
  return {
    defaut: { nom: 'Par défaut', cle: null },
    titre: { nom: 'Titre', cle: (i) => i.titre.toLowerCase() },
    pilier: { nom: 'Pilier', cle: (i) => i.pilier ?? 9 },
    statut: { nom: 'État', cle: (i) => cyclePublication(i.espace).indexOf(i.statut) },
    format: { nom: 'Format', cle: (i) => FORMATS[i.format] ?? i.format },
  };
}

export function ideesFiltrees(idees, filtres = {}, tri = { cle: 'defaut', sens: 1 }) {
  const mot = (filtres.mot ?? '').trim().toLowerCase();
  const retenues = idees.filter((i) => {
    for (const [cle, valeurs] of Object.entries(filtres)) {
      if (cle === 'mot' || !valeurs?.length) continue;
      const valeur = cle === 'reproductible'
        ? (i.reproductible === false ? 'non' : 'oui')
        : String(i[cle] ?? '');
      if (!valeurs.includes(valeur)) return false;
    }
    // La recherche court sur le titre ET sur les notes : on cherche « presets »
    // aussi souvent qu'un titre exact.
    if (!mot) return true;
    return `${i.titre} ${i.notes ?? ''} ${i.preuve ?? ''}`.toLowerCase().includes(mot);
  });

  const TRIS = trisDesIdees();
  const choisi = TRIS[tri.cle] ?? TRIS.defaut;
  // « PAR DÉFAUT » EST UN ORDRE, pas une absence de tri : la dernière notée en
  // tête, parce qu'une idée fraîche est celle qu'on vient d'avoir et qu'on veut
  // retrouver. C'est l'ordre que `construireBanque` posait lui-même ; il est
  // remonté ici pour qu'un tri choisi puisse le remplacer.
  if (!choisi.cle) {
    return retenues.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }
  return retenues.slice().sort((a, b) => {
    const x = choisi.cle(a);
    const y = choisi.cle(b);
    const ordre = typeof x === 'string' ? x.localeCompare(y, 'fr') : Number(x) - Number(y);
    return ordre * (tri.sens ?? 1);
  });
}

export function construireBarreIdees({
  idees, filtres = {}, tri = { cle: 'defaut', sens: 1 },
  ouverts = false, chip = null, piliers = null,
}) {
  const CRITERES = criteresDesIdees(idees, { piliers });
  const TRIS = trisDesIdees();

  // CE QU'UN CRITÈRE DIT QUAND IL EST REPLIÉ : son nom seul tant qu'il ne filtre
  // rien, sinon ce qu'il retient — un seul en toutes lettres, les suivants
  // comptés. Trois valeurs écrites feraient une phrase, et une pastille n'est
  // pas une phrase.
  const resume = (c) => {
    const choisis = filtres[c.cle] ?? [];
    if (!choisis.length) return c.nom;
    const premier = c.options.find(([v]) => v === choisis[0]);
    return `${c.nom} : ${premier ? premier[1] : choisis[0]}${
      choisis.length > 1 ? ` +${choisis.length - 1}` : ''}`;
  };

  const actifs = CRITERES.filter((c) => (filtres[c.cle] ?? []).length).length;

  const critere = (c) => {
    const choisis = filtres[c.cle] ?? [];
    const ouvert = chip === c.cle;
    if (c.options.length < 2) return '';
    return `<span class="livres-critere">
      <button type="button" class="livres-critere-bouton${choisis.length ? ' actif' : ''}"
        data-critere-idee="${c.cle}" aria-expanded="${ouvert}" aria-haspopup="listbox"
        >${echapper(resume(c))}${SIGNES.chevron}</button>
      ${ouvert
        ? `<div class="choix-panneau livres-panneau">
            <ul class="choix-capture">
              ${c.options.map(([valeur, mot, n]) => `
                <li><button type="button" data-filtre-idee="${echapper(c.cle)}"
                  data-valeur="${echapper(valeur)}"
                  class="${choisis.includes(valeur) ? 'actif' : ''}"
                  aria-pressed="${choisis.includes(valeur)}"
                  ><span class="livres-coche" aria-hidden="true">${
                    choisis.includes(valeur) ? SIGNES.coche : ''
                  }</span><span>${echapper(mot)}</span>
                  <span class="discret">${n}</span></button></li>`).join('')}
            </ul>
          </div>`
        : ''}
    </span>`;
  };

  const triChoisi = TRIS[tri.cle] ?? TRIS.defaut;
  const chipTri = `<span class="livres-critere">
    <button type="button" class="livres-critere-bouton${tri.cle === 'defaut' ? '' : ' actif'}"
      data-critere-idee="tri" aria-expanded="${chip === 'tri'}" aria-haspopup="listbox"
      >${tri.cle === 'defaut' ? '' : SIGNES[tri.sens > 0 ? 'monte' : 'descend']}${
        echapper(triChoisi.nom)}${SIGNES.chevron}</button>
    ${chip === 'tri'
      ? `<div class="choix-panneau livres-panneau">
          <ul class="choix-capture">
            ${Object.entries(TRIS).map(([cle, { nom }]) => `
              <li><button type="button" data-trier-idee="${cle}"
                class="${cle === tri.cle ? 'actif' : ''}" aria-pressed="${cle === tri.cle}"
                ><span class="livres-coche" aria-hidden="true">${
                  cle === tri.cle ? SIGNES.coche : ''
                }</span><span>${echapper(nom)}</span>${
                  cle === tri.cle && cle !== 'defaut'
                    ? `<span class="discret">${SIGNES[tri.sens > 0 ? 'monte' : 'descend']}</span>`
                    : ''
                }</button></li>`).join('')}
          </ul>
        </div>`
      : ''}
  </span>`;

  return `
    <div class="livres-barre">
      <input type="search" class="livres-recherche" data-recherche-idee
        value="${echapper(filtres.mot ?? '')}" aria-label="Chercher une idée"
        placeholder="Chercher une idée" autocomplete="off">

      <button type="button" class="livres-reglages-bouton${
        actifs || ouverts ? ' actif' : ''}" data-ouvrir-filtres-idees
        aria-expanded="${Boolean(ouverts)}" title="Filtrer"
        aria-label="Filtrer${actifs ? ` — ${actifs} critère${actifs > 1 ? 's' : ''} posé${
          actifs > 1 ? 's' : ''}` : ''}">${SIGNES.filtre}${
          actifs ? `<span class="livres-reglages-compte">${actifs}</span>` : ''}</button>

      <button type="button" class="livres-reglages-bouton${
        tri.cle === 'defaut' && !ouverts ? '' : ' actif'}" data-ouvrir-tri-idees
        aria-expanded="${chip === 'tri'}" title="Trier"
        aria-label="Trier${tri.cle === 'defaut' ? '' : ` — par ${triChoisi.nom.toLowerCase()}`
        }">${SIGNES.tri}</button>
    </div>

    ${ouverts
      ? `<div class="livres-criteres">
          ${chipTri}
          <span class="livres-separateur" aria-hidden="true"></span>
          ${CRITERES.map(critere).join('')}
          ${actifs
            ? `<button type="button" class="lien-discret livres-tout-voir"
                data-vider-filtres-idees>Tout revoir</button>`
            : ''}
        </div>`
      : ''}`;
}

export function construireBanque(publications, options = {}) {
  // `ordreDonne` : l'appelant a déjà trié (Yuno le fait depuis que la banque a
  // un tri choisi). **Sans cette porte, le tri par titre ne se voyait pas du
  // tout** — la liste était reclassée par date juste après, et le geste
  // paraissait sans effet.
  const idees = publications
    // Une publiée sans date n'est plus une idée : elle vit dans « Publiées »,
    // et la banque ne doit pas la garder en double.
    .filter((pub) => !pub.date_prevue && pub.statut !== 'publie');
  if (!options.ordreDonne) idees.sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (!idees.length) {
    return `<p class="vide">Ta banque d'idées démarre ici. Note tout, trie ensuite.</p>`;
  }
  return `<ul>${idees.map((pub) => construireApercuPublication(pub, options)).join('')}</ul>`;
}

export function construirePubliees(publications, options = {}) {
  const publiees = publications
    .filter((pub) => pub.statut === 'publie')
    .sort((a, b) => (b.date_prevue ?? '').localeCompare(a.date_prevue ?? ''));

  if (!publiees.length) return '';
  return `
    <details class="backlog">
      <summary>Publiées <span class="chiffre">${publiees.length}</span></summary>
      <ul>${publiees.map((pub) => construireApercuPublication(pub, options)).join('')}</ul>
    </details>`;
}

// L'aperçu d'accueil : de quoi savoir où en est la création sans ouvrir
// l'outil — trois programmées, trois idées fraîches.
// `idees: false` retire la moitié « banque » de l'aperçu : il ne reste que ce
// qui est programmé. L'accueil de Yuno s'en sert — la banque y a sa page, elle
// n'a pas à déborder sur l'accueil. Les trois autres espaces gardent les deux.
export function construireApercuCreation(publications, { idees: avecIdees = true } = {}) {
  const prochaines = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))
    .slice(0, 3);
  const idees = avecIdees
    ? publications
        .filter((pub) => !pub.date_prevue)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 3)
    : [];

  const lignes = [...prochaines, ...idees];
  if (!lignes.length) {
    return avecIdees
      ? `<p class="vide">Tes prochaines publications et idées s'afficheront ici.</p>`
      : `<p class="vide">Tes prochaines publications s'afficheront ici.</p>`;
  }

  return `<ul>${lignes
    .map(
      (pub) => `
      <li>
        <span class="tuile-entete">
          ${etiquettes(pub)}
          <span class="discret quand">${
            pub.date_prevue
              ? echapper(echeanceLisible(depuisDateISO(pub.date_prevue)))
              : 'idée'
          }</span>
        </span>
        <span class="pub-titre">${echapper(pub.titre)}</span>
      </li>`,
    )
    .join('')}</ul>`;
}

// Les rubriques proposées : celles de l'espace, plus celles déjà écrites. La
// saisie reste libre — la liste n'est qu'un appui.
export function rubriquesProposees(publications, rubriquesDepart) {
  return [
    ...new Set([
      ...rubriquesDepart,
      ...publications.map((pub) => pub.rubrique).filter(Boolean),
    ]),
  ];
}

// `champsEnPlus` laisse un espace ajouter ce qui lui est propre — chez Yuno le
// pilier, la preuve et le « pourquoi chez moi ». Le titre suffit toujours :
// noter une idée doit rester une affaire de cinq secondes.
// `avecPli: false` sort le formulaire de son dépliant : c'est ce qu'il faut
// dans une fenêtre volante, où le titre est déjà dit par la fenêtre.
export function formulaireIdee({
  id = 'pub',
  publications,
  rubriquesDepart,
  reseaux = RESEAUX,
  champsEnPlus = [],
  avecPli = true,
}) {
  return construireFormulaire({
    id,
    libelle: 'Noter une idée',
    action: 'noter-idee',
    avecPli,
    champs: [
      { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true },
      { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: reseaux },
      { nom: 'format', libelle: 'Format', type: 'choix', options: FORMATS },
      ...champsEnPlus,
      {
        nom: 'rubrique',
        libelle: 'Rubrique (libre)',
        type: 'text',
        suggestions: rubriquesProposees(publications, rubriquesDepart),
      },
      {
        nom: 'date_prevue',
        libelle: 'Date prévue (facultative — sans date, ça reste une idée)',
        type: 'date',
      },
      {
        nom: 'heure',
        libelle: 'À quelle heure (vide = dans la journée)',
        type: 'time',
      },
      {
        nom: 'notes',
        libelle: 'Notes — légende, plan, références (facultatif)',
        type: 'textarea',
      },
    ],
  });
}
