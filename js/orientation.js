// L'orientation : ce que le hub attend d'une semaine, et ce qu'il en dit.
//
// Ce module ne touche NI au réseau, NI à la session, NI au DOM. Il ne fait que
// calculer à partir de données déjà chargées — c'est la règle du hub pour tout
// ce qui doit rester vérifiable seul (voir CLAUDE.md, « Méthode de travail »),
// et elle compte double ici : un diagnostic qu'on ne peut pas éprouver hors
// écran est un diagnostic qu'on croit sur parole.
//
// Tout est en MINUTES, comme `taches.duree`, `projets.charge_minutes` et les
// événements. Les heures n'apparaissent qu'à la saisie et à l'affichage.

import { versDateISO, depuisDateISO, ajouterJours } from './format.js';

// --- Ce que Noé a dit ---------------------------------------------------------
//
// Les quotas de base, en minutes par semaine. Ce sont SES chiffres, donnés le
// 27 août 2026 : « pour le FCH la capacité par semaine visée doit être 20 h pas
// plus » ; « la formation, dans l'idée ce serait 15 h par semaine, pour remplir
// les 35 h de mon alternance, mais ça peut varier ».
//
// Yuno n'a pas de quota, et c'est voulu : « pas de durée, ça doit être surtout
// du bonus ». Le perso non plus — il a un PLANCHER, ce qui est le contraire
// d'un quota : un quota se remplit, un plancher ne se creuse pas.
export const QUOTAS = {
  fch: 20 * 60,
  formation: 15 * 60,
  photo: null,
  perso: null,
};

// Les 35 h du contrat. C'est la seule enveloppe fermée du système : le club et
// la formation s'y partagent un jeu à somme nulle, tandis que Yuno et le perso
// vivent en dehors, le soir et le week-end.
export const CAPACITE_ALTERNANCE = 35 * 60;

// Trois valeurs, pas davantage. Un curseur à dix crans donnerait l'illusion
// d'un réglage fin sur des chiffres qui sont des intentions, pas des mesures.
export const REGIMES = {
  ralenti: { libelle: 'Au ralenti', coefficient: 0.6 },
  normal: { libelle: 'Normal', coefficient: 1 },
  intense: { libelle: 'Intense', coefficient: 1.3 },
};

// Le plancher perso, par famille et par semaine. Il ne figure dans AUCUN régime
// de période : c'est toute sa raison d'être. Quand la semaine déborde, on rogne
// le club ou on décale un livrable — jamais ça. Sans cette asymétrie, le perso
// resterait ce que Noé délaisse, ce qu'il dit lui-même en faire.
//
// Quatre familles et non un compteur unique : un seul chiffre se laisserait
// remplir par la plus facile — le sport, celui qu'il tient déjà — et il
// pourrait passer un mois sans voir personne avec un compteur au vert.
// L'intendance (courses, machine, rangement) ne compte nulle part : elle se
// fait, elle ne repose de rien.
export const PLANCHER_PERSO = {
  corps: 3,
  calme: 1,
  lien: 1,
};

// --- Ce qu'une période vise ---------------------------------------------------

const ESPACES_A_QUOTA = ['fch', 'formation'];

export function coefficientDuRegime(regime) {
  return REGIMES[regime]?.coefficient ?? REGIMES.normal.coefficient;
}

// La charge visée par espace, en minutes par semaine, sous les régimes d'une
// période. Sans période, ce sont les quotas de base — le régime « normal » est
// donc toujours la réponse par défaut, jamais une absence de réponse.
export function chargeViseeDeLaPeriode(periode = null) {
  const regimes = periode?.regimes ?? {};
  const visees = {};

  for (const espace of ESPACES_A_QUOTA) {
    visees[espace] = Math.round(QUOTAS[espace] * coefficientDuRegime(regimes[espace]));
  }

  visees.total = ESPACES_A_QUOTA.reduce((somme, espace) => somme + visees[espace], 0);
  return visees;
}

// --- L'arbitrage, au moment où on écrit la période ----------------------------
//
// LE MOMENT COMPTAIT AUTANT QUE LE CALCUL — et pourtant AUCUN ÉCRAN N'AFFICHE
// PLUS CETTE QUESTION depuis le 28 août 2026 (décision de Noé) : « ça ne me
// sert à rien, c'est LE BUT d'une période d'intensité, j'en fais plus que
// d'habitude ». Un dépassement voulu n'est pas un déséquilibre à signaler.
//
// Ce qui suit reste donc VRAI et vérifiable — `ecart`, `tendue`, `issues` se
// calculent toujours, et `tranche` avec — mais plus rien ne les montre. C'est
// la mesure qu'on garde, c'est le reproche qu'on a retiré. Avant de rebrancher
// quoi que ce soit ici, relire docs/orientation-spec.md § 2.5 : la question a
// déjà été posée, essayée avec une troisième porte, puis retirée.
// LA CLÉ D'UNE QUESTION : ce qui la reconnaît d'une fois sur l'autre. Sans
// elle, le hub ne saurait pas qu'il repose la même — et une question qu'on
// repose après y avoir répondu n'est plus une question.
export function cleDArbitrage(periode) {
  return periode ? `periode:${periode.id}` : 'periode:aucune';
}

// L'arbitrage déjà rendu sur cette question, s'il couvre le jour. Une réponse a
// une PORTÉE, pas une durée de vie : passé l'intervalle où la question se
// posait, elle n'empêche plus rien — une décision prise pour septembre
// n'engage pas décembre.
export function arbitrageRendu(arbitrages = [], cle, jour = new Date()) {
  const aujourdhui = versDateISO(jour);
  return (
    arbitrages.find(
      (a) => a.cle === cle && a.portee_debut <= aujourdhui && aujourdhui <= a.portee_fin,
    ) ?? null
  );
}

export function tensionDeLaPeriode(periode, arbitrages = [], jour = new Date()) {
  const visees = chargeViseeDeLaPeriode(periode);
  const ecart = visees.total - CAPACITE_ALTERNANCE;
  const tranche = arbitrageRendu(arbitrages, cleDArbitrage(periode), jour);

  // TRANCHÉ : la question ne se repose pas. Le déséquilibre, lui, reste vrai et
  // reste lisible — ce n'est pas parce qu'on a choisi que les heures rentrent.
  if (tranche) {
    return {
      ...visees,
      capacite: CAPACITE_ALTERNANCE,
      ecart,
      tendue: false,
      tranche,
      question: null,
      issues: [],
    };
  }

  if (ecart <= 0) {
    return {
      ...visees,
      capacite: CAPACITE_ALTERNANCE,
      ecart,
      tendue: false,
      tranche: null,
      question: null,
      issues: [],
    };
  }

  const regimes = periode?.regimes ?? {};
  const nom = (espace) => (espace === 'fch' ? 'le club' : 'la formation');

  // On propose de redescendre celui qui est monté. Si les deux le sont, on
  // propose les deux et Noé choisit — c'est exactement le cas où poser la
  // question a le plus de valeur.
  const montes = ESPACES_A_QUOTA.filter((espace) => regimes[espace] === 'intense');
  const candidats = montes.length ? montes : ESPACES_A_QUOTA;

  return {
    ...visees,
    capacite: CAPACITE_ALTERNANCE,
    ecart,
    tendue: true,
    tranche: null,
    question:
      candidats.length > 1
        ? `Le club et la formation demandent ensemble plus que tes 35 h. Lequel des deux porte cette période ?`
        : `${candidats[0] === 'fch' ? 'Le club' : 'La formation'} demande plus que ce qui reste. Qu'est-ce qui cède ?`,
    issues: candidats.map((espace) => ({
      espace,
      regime: regimes[espace] === 'intense' ? 'normal' : 'ralenti',
      phrase: `Remettre ${nom(espace)} ${
        regimes[espace] === 'intense' ? 'au normal' : 'au ralenti'
      }`,
    })),
  };
}

// --- Quelle période s'applique ------------------------------------------------
//
// Les périodes peuvent se chevaucher — on ne l'interdit pas, ce serait une
// contrainte de plus à comprendre. La plus RÉCEMMENT déclarée gagne : c'est la
// dernière décision prise, et c'est celle qu'on a en tête.
export function periodeDuJour(periodes = [], jour = new Date()) {
  const cle = versDateISO(jour);
  const couvrantes = periodes.filter((periode) => periode.debut <= cle && cle <= periode.fin);
  if (!couvrantes.length) return null;

  return couvrantes.reduce((derniere, periode) =>
    String(periode.created_at) > String(derniere.created_at) ? periode : derniere,
  );
}

// Le nombre de semaines qu'une période couvre, arrondi au plus proche et jamais
// nul : une période d'un seul jour vaut une semaine de charge, sans quoi une
// division tomberait à zéro plus loin.
export function semainesDeLaPeriode(periode) {
  const jours = (depuisDateISO(periode.fin) - depuisDateISO(periode.debut)) / 86400000 + 1;
  return Math.max(1, Math.round(jours / 7));
}

// --- La semaine ---------------------------------------------------------------
//
// Du lundi au dimanche. Le lundi parce que c'est le jour de la routine des
// clubs et le premier jour d'alternance ; le dimanche soir parce que c'est là
// que Noé regarde la suivante.

export function semaineDe(jour = new Date()) {
  const debut = new Date(jour);
  debut.setHours(0, 0, 0, 0);
  // getDay() : 0 = dimanche. On recule jusqu'au lundi.
  debut.setDate(debut.getDate() - ((debut.getDay() + 6) % 7));
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 6);
  return { debut: versDateISO(debut), fin: versDateISO(fin) };
}

const dans = (jourISO, { debut, fin }) => Boolean(jourISO) && jourISO >= debut && jourISO <= fin;
const jourDeLEvenement = (evenement) => versDateISO(new Date(evenement.date_debut));

// --- Ce que la semaine coûte --------------------------------------------------
//
// Le terrain fabrique l'atelier, et c'est le mécanisme le plus utile du système
// (§ 3.3 de la spec) : une séance au bord du terrain se paie DEUX FOIS — une
// fois sur place, une fois à la maison, quelques jours plus tard, quand la
// semaine est déjà pleine. Le traitement se compte PAR SÉANCE et non au prorata
// des heures : le tri dépend du volume de photos, pas du temps passé debout.
export const TRAITEMENT_PAR_SEANCE = 90;

// Une réunion est du terrain qui ne produit aucune photo : elle occupe des
// heures et n'engendre pas de tri.
const estUneSeance = (evenement) => evenement.espace === 'fch' && !evenement.reunion_objet;

// Un projet à charge HEBDOMADAIRE couvre déjà ses lignes : compter en plus la
// durée de chacune reviendrait à payer deux fois la même rubrique. C'est la
// seule règle anti-double-comptage de la charge, et elle mérite d'être dite.
function projetsForfaitaires(projets, espace) {
  return new Set(
    projets.filter((projet) => projet.espace === espace && projet.charge_hebdo).map((p) => p.id),
  );
}

export function chargeDeLaSemaine(
  { evenements = [], taches = [], publications = [], projets = [] } = {},
  semaine,
  espace,
) {
  const forfaits = projetsForfaitaires(projets, espace);
  const dansLaSemaine = (ligne, jourISO) => ligne.espace === espace && dans(jourISO, semaine);

  const evts = evenements.filter((e) => dansLaSemaine(e, jourDeLEvenement(e)));
  const terrain = evts.reduce(
    (somme, e) => somme + (e.date_fin ? (new Date(e.date_fin) - new Date(e.date_debut)) / 60000 : 0),
    0,
  );
  const seances = evts.filter(estUneSeance).length;

  const tachesDeLaSemaine = taches.filter(
    (t) => dansLaSemaine(t, t.echeance) && !forfaits.has(t.projet_id),
  );
  const pubsDeLaSemaine = publications.filter(
    (p) => dansLaSemaine(p, p.date_prevue) && !forfaits.has(p.projet_id),
  );

  const somme = (lignes) => lignes.reduce((total, ligne) => total + (ligne.duree ?? 0), 0);
  const forfait = projets
    .filter((projet) => projet.espace === espace && projet.charge_hebdo)
    .reduce((total, projet) => total + projet.charge_hebdo, 0);

  const traitement = seances * TRAITEMENT_PAR_SEANCE;
  const declare = somme(tachesDeLaSemaine) + somme(pubsDeLaSemaine);

  return {
    // `evenements` et non `terrain` : au club c'est du terrain, chez Yuno une
    // sortie, au perso un rendez-vous avec soi. Seul le club en tire un
    // traitement — le chiffre de 1 h 30 par séance est le sien, pas une loi.
    evenements: Math.round(terrain),
    seances,
    traitement,
    forfait,
    declare,
    total: Math.round(terrain) + traitement + forfait + declare,
    // Ce que le hub NE SAIT PAS compter. Sans ce chiffre, un total rassurant
    // pourrait n'être que le reflet de ce qui n'a pas été renseigné.
    nonChiffre:
      tachesDeLaSemaine.filter((t) => !t.duree).length +
      pubsDeLaSemaine.filter((p) => !p.duree).length,
  };
}

// --- La courbe d'atterrissage de la formation ---------------------------------
//
// Ce que ce calcul dit, et lui seul : « trop ambitieux ». Chaque livrable a un
// coût et une date ; le reste à faire divisé par les semaines restantes donne
// ce qu'il faudrait tenir. Deux chiffres, parce qu'ils ne disent pas la même
// chose — le lissé rassure, le prochain presse, et c'est l'écart entre les deux
// qui révèle une échéance mal répartie.
export function courbeFormation(projets = [], taches = [], jour = new Date()) {
  const aujourdhui = versDateISO(jour);
  const livrables = projets
    .filter(
      (projet) =>
        projet.espace === 'formation' &&
        projet.echeance &&
        projet.echeance >= aujourdhui &&
        projet.statut !== 'termine' &&
        projet.charge_minutes,
    )
    .sort((a, b) => a.echeance.localeCompare(b.echeance));

  if (!livrables.length) return { livrables: [], resteTotal: 0, lisse: 0, prochain: null };

  const semainesJusqua = (echeance) =>
    Math.max(0.5, (depuisDateISO(echeance) - depuisDateISO(aujourdhui)) / (7 * 86400000));

  const fait = (projet) =>
    taches
      .filter((t) => t.projet_id === projet.id && t.statut === 'fait')
      .reduce((somme, t) => somme + (t.duree ?? 0), 0);

  const detail = livrables.map((projet) => {
    const reste = Math.max(0, projet.charge_minutes - fait(projet));
    return {
      id: projet.id,
      nom: projet.nom,
      echeance: projet.echeance,
      reste,
      semaines: semainesJusqua(projet.echeance),
      besoin: Math.round(reste / semainesJusqua(projet.echeance)),
    };
  });

  const resteTotal = detail.reduce((somme, l) => somme + l.reste, 0);
  const derniere = detail[detail.length - 1];

  return {
    livrables: detail,
    resteTotal,
    // Le rythme régulier qui suffirait, si rien n'était en grappes.
    lisse: Math.round(resteTotal / derniere.semaines),
    // Ce que réclame le livrable le plus proche, à lui seul.
    prochain: detail[0],
  };
}

// --- Le plancher perso --------------------------------------------------------
//
// On compte par FAMILLE, jamais en un seul nombre : un compteur unique se
// laisserait remplir par la plus facile — le sport — et Noé pourrait passer un
// mois sans voir personne avec un compteur au vert. L'intendance ne compte
// nulle part : elle se fait, elle ne repose de rien.
export function plancherDeLaSemaine({ evenements = [], taches = [] } = {}, semaine) {
  const moments = [
    ...evenements.filter((e) => e.espace === 'perso' && dans(jourDeLEvenement(e), semaine)),
    ...taches.filter((t) => t.espace === 'perso' && dans(t.echeance, semaine)),
  ];

  const comptes = { corps: 0, calme: 0, lien: 0 };
  let nonClasses = 0;

  for (const moment of moments) {
    if (moment.famille === 'intendance') continue;
    if (comptes[moment.famille] === undefined) nonClasses += 1;
    else comptes[moment.famille] += 1;
  }

  const manques = Object.entries(PLANCHER_PERSO)
    .filter(([famille, attendu]) => comptes[famille] < attendu)
    .map(([famille, attendu]) => ({ famille, attendu, pose: comptes[famille] }));

  return { comptes, manques, nonClasses, moments: moments.length };
}

// --- Les inférences : voir ce que Noé ne voit pas ------------------------------
//
// Le diagnostic ne se fonde pas seulement sur ce qui est POSÉ au calendrier —
// sinon il ne ferait que relire ce que Noé a déjà en tête. Il se fonde aussi sur
// ce qui MANQUE (§ 8 de la spec).
//
// Deux garde-fous, parce qu'une inférence fausse coûte cher en confiance :
// chacune dit d'où elle sort, pour qu'on puisse la contredire d'un coup d'œil ;
// et il n'en sort que TROIS au plus — au-delà, elles deviennent du bruit.
export const MAX_INFERENCES = 3;

const JOURS_SILENCE_PROJET = 21;
const JOURS_JALON_PROCHE = 21;

export function inferences(
  { evenements = [], taches = [], publications = [], objectifs = [], projets = [], series = [] } = {},
  jour = new Date(),
) {
  const aujourdhui = versDateISO(jour);
  const dansNJours = (n) => versDateISO(new Date(depuisDateISO(aujourdhui).getTime() + n * 86400000));
  const trouvees = [];

  // 1. LE TERRAIN SANS SON TRAITEMENT. Ce qui est posé engendre du travail que
  //    personne n'a écrit — c'est la conséquence directe du § 3.3.
  const seancesAVenir = evenements.filter(
    (e) => estUneSeance(e) && jourDeLEvenement(e) >= aujourdhui && jourDeLEvenement(e) <= dansNJours(14),
  );
  const triPose = taches.filter(
    (t) =>
      t.espace === 'fch' &&
      t.statut !== 'fait' &&
      /tri|trier|photos|retouche/i.test(t.titre) &&
      t.echeance >= aujourdhui,
  ).length;

  if (seancesAVenir.length >= 2 && triPose < seancesAVenir.length) {
    trouvees.push({
      cle: 'terrain-sans-tri',
      constat: `${seancesAVenir.length} sorties terrain d'ici deux semaines, et ${
        triPose ? `seulement ${triPose} tri posé` : 'aucun tri posé'
      }.`,
      consequence: `Compte environ ${Math.round(
        (seancesAVenir.length * TRAITEMENT_PAR_SEANCE) / 60,
      )} h de traitement derrière.`,
      dou: 'les événements du club à venir, et les tâches de tri qui existent',
    });
  }

  // 2. LE PREMIER MAILLON QUI DORT. Dans une chaîne ordonnée, un jalon non
  //    atteint bloque tous les suivants : le hub repère le PREMIER de chaque
  //    chaîne, parce que c'est le seul qui débloque les autres.
  for (const objectif of objectifs) {
    const chaine = (objectif.jalons ?? []).filter((jalon) => !jalon.atteint);
    if (!chaine.length) continue;
    const premier = chaine[0];

    // Un projet qui vise L'OBJECTIF porte aussi ses jalons : trois projets
    // servaient « 1 000 abonnés » et le hub annonçait quand même son premier
    // jalon endormi. Une inférence fausse coûte plus cher qu'une inférence
    // manquante — c'est la confiance qu'on paie.
    const porte =
      projets.some((projet) =>
        (projet.cibles ?? []).some(
          (cible) => cible.jalon_id === premier.id || cible.objectif_id === objectif.id,
        ),
      ) ||
      taches.some(
        (t) =>
          (t.jalon_id === premier.id || t.objectif_id === objectif.id) && t.statut !== 'fait',
      );

    if (!porte) {
      trouvees.push({
        cle: `maillon-${premier.id}`,
        constat: `« ${premier.titre} » n'a ni projet ni tâche, et c'est le premier maillon de « ${objectif.titre} ».`,
        consequence: 'Les jalons suivants en dépendent : rien ne bouge tant qu\'il dort.',
        dou: 'le premier jalon non atteint de cet objectif',
      });
    }
  }

  // 3. UN JALON PROCHE SANS RIEN QUI Y MÈNE.
  for (const objectif of objectifs) {
    for (const jalon of objectif.jalons ?? []) {
      if (jalon.atteint || !jalon.echeance) continue;
      if (jalon.echeance < aujourdhui || jalon.echeance > dansNJours(JOURS_JALON_PROCHE)) continue;
      const porte = taches.some((t) => t.jalon_id === jalon.id && t.statut !== 'fait');
      if (!porte) {
        trouvees.push({
          cle: `jalon-${jalon.id}`,
          constat: `« ${jalon.titre} » tombe le ${jalon.echeance} et aucune tâche n'y mène.`,
          consequence: null,
          dou: 'un jalon daté à moins de trois semaines',
        });
      }
    }
  }

  // 4. UN PROJET SILENCIEUX. Rien de daté ni fait depuis trois semaines, rien
  //    devant. Ce n'est pas un reproche : c'est le meilleur détecteur d'un
  //    chantier qui coule sans qu'on s'en rende compte.
  for (const projet of projets) {
    if (projet.statut !== 'actif' || projet.charge_hebdo) continue;
    const lignes = [
      ...taches.filter((t) => t.projet_id === projet.id).map((t) => t.date_fait ?? t.echeance),
      ...publications.filter((p) => p.projet_id === projet.id).map((p) => p.date_prevue),
      ...evenements.filter((e) => e.projet_id === projet.id).map(jourDeLEvenement),
    ].filter(Boolean);

    const recente = lignes.some((date) => String(date).slice(0, 10) >= dansNJours(-JOURS_SILENCE_PROJET));
    if (!recente) {
      trouvees.push({
        cle: `silence-${projet.id}`,
        constat: `« ${projet.nom} » n'a rien vu passer depuis trois semaines.`,
        consequence: projet.echeance ? `Son échéance est le ${projet.echeance}.` : null,
        dou: 'aucune tâche, publication ni événement rattaché sur la période',
      });
    }
  }

  // 5. UN RYTHME QUI DÉCROCHE. Le hub ne mesure pas si Noé a tenu son rythme,
  //    il mesure si SON RYTHME LE TIENT : trois occurrences passées non faites,
  //    ce n'est pas une faute, c'est un calibrage à revoir.
  for (const serie of series) {
    if (serie.arretee) continue;
    const occurrences = [...taches, ...publications].filter((l) => l.serie_id === serie.id);
    const passees = occurrences.filter((l) => (l.echeance ?? l.date_prevue) < aujourdhui);
    const ratees = passees.filter((l) => l.statut !== 'fait' && l.statut !== 'publie');
    if (passees.length >= 3 && ratees.length >= 3) {
      trouvees.push({
        cle: `rythme-${serie.id}`,
        constat: `« ${serie.modele?.titre ?? 'Une série'} » est passée ${ratees.length} fois sans être faite.`,
        consequence: 'Le rythme est peut-être trop serré — le passer en quinzaine ?',
        dou: 'les occurrences passées de cette série',
      });
    }
  }

  return trouvees.slice(0, MAX_INFERENCES);
}

// --- Le diagnostic, en une fois -----------------------------------------------
//
// La fonction que le rendez-vous du dimanche affichera. Elle ne décide rien et
// n'écrit rien : elle assemble ce que les autres calculent, et se vérifie
// entièrement hors écran, avec des données factices.
export function diagnosticDeLaSemaine(donnees = {}, jour = new Date()) {
  const semaine = semaineDe(jour);
  const periode = periodeDuJour(donnees.periodes ?? [], jour);
  const visees = chargeViseeDeLaPeriode(periode);

  const charge = {};
  for (const espace of ['fch', 'formation', 'photo', 'perso']) {
    charge[espace] = chargeDeLaSemaine(donnees, semaine, espace);
    charge[espace].vise = visees[espace] ?? null;
    charge[espace].ecart =
      visees[espace] === undefined ? null : charge[espace].total - visees[espace];
  }

  return {
    semaine,
    periode,
    tension: tensionDeLaPeriode(periode, donnees.arbitrages ?? [], jour),
    charge,
    formation: courbeFormation(donnees.projets ?? [], donnees.taches ?? [], jour),
    perso: plancherDeLaSemaine(donnees, semaine),
    inferences: inferences(donnees, jour),
  };
}

// --- Le vivier et les trois propositions du matin -----------------------------
//
// Le piège que Noé a nommé lui-même : « que l'IA me fasse tout mon programme de
// tâches et que je sois un simple exécutant, j'en perdrais le plaisir ». La
// parade n'est pas de proposer moins, c'est de proposer À UN AUTRE ÉTAGE — le
// hub décide des proportions, Noé décide du contenu. Ces trois propositions
// sont donc des CANDIDATES, jamais un programme : on en prend une, aucune, ou
// on va piocher ailleurs.
//
// Elles ne redisent pas « Aujourd'hui », qui montre déjà ce qui est daté pour
// le jour. Elles vont chercher ce qui n'a PAS de date — ce qui, faute d'être
// jamais planifié, n'est jamais fait : l'album du club, le partenariat, l'offre
// de Yuno. C'est là que dorment les caps.

export const MAX_PROPOSITIONS = 3;

// Au-delà d'un mois sans rien, la négligence ne grandit plus : un projet oublié
// depuis six mois n'est pas six fois plus urgent qu'un projet oublié depuis un.
const NEGLIGENCE_MAX = 30;

// Ce qui pèse dans le score. Les poids sont des intentions, pas des mesures :
// l'urgence d'un cap passe devant le reste, la négligence rattrape ce que
// personne ne réclame, la dette d'équilibre penche vers l'espace qui a été
// délaissé cette semaine.
const POIDS = { urgence: 3, negligence: 2, dette: 1.5, priorite: 1 };

function joursEntre(aISO, bISO) {
  return (depuisDateISO(bISO) - depuisDateISO(aISO)) / 86400000;
}

// Le dernier signe de vie d'un projet : la dernière chose faite ou posée qui
// s'y rattache. C'est le meilleur détecteur d'un chantier qui coule — mieux
// qu'une échéance, qui ne dit rien tant qu'elle est loin.
function dernierGeste(projet, { taches = [], publications = [], evenements = [] }) {
  const dates = [
    ...taches.filter((t) => t.projet_id === projet.id).map((t) => t.date_fait ?? t.echeance),
    ...publications.filter((p) => p.projet_id === projet.id).map((p) => p.date_prevue),
    ...evenements.filter((e) => e.projet_id === projet.id).map((e) => e.date_debut),
  ]
    .filter(Boolean)
    .map((date) => String(date).slice(0, 10))
    .sort();

  return dates.length ? dates[dates.length - 1] : null;
}

// Le vivier : ce qui attend sans date. Deux formes, parce qu'il y a deux façons
// de ne pas avancer — une tâche écrite que personne ne date, et un projet dont
// la première tâche n'a jamais été écrite.
export function vivier(donnees = {}, jour = new Date()) {
  const { taches = [], projets = [] } = donnees;
  const aujourdhui = versDateISO(jour);
  const semaine = semaineDe(jour);

  // La dette d'équilibre : un espace loin de sa charge visée penche la balance.
  const dettes = {};
  for (const espace of ['fch', 'formation', 'photo', 'perso']) {
    const charge = chargeDeLaSemaine(donnees, semaine, espace);
    const vise = chargeViseeDeLaPeriode(periodeDuJour(donnees.periodes ?? [], jour))[espace];
    dettes[espace] = vise ? Math.max(0, Math.min(1, (vise - charge.total) / vise)) : 0;
  }

  const candidates = [];

  for (const tache of taches) {
    if (tache.statut === 'fait' || tache.echeance || tache.serie_id) continue;
    if (tache.refusee_le === aujourdhui) continue;
    const projet = projets.find((p) => p.id === tache.projet_id) ?? null;
    candidates.push({
      forme: 'tache',
      id: tache.id,
      titre: tache.titre,
      espace: tache.espace,
      projet,
      priorite: tache.priorite ?? 4,
      echeance: projet?.echeance ?? null,
      dernier: projet ? dernierGeste(projet, donnees) : null,
    });
  }

  for (const projet of projets) {
    if (projet.statut !== 'actif' || projet.charge_hebdo) continue;
    if (projet.refusee_le === aujourdhui) continue;
    const ouverte = taches.some((t) => t.projet_id === projet.id && t.statut !== 'fait');
    if (ouverte) continue;
    candidates.push({
      forme: 'projet',
      id: projet.id,
      titre: projet.nom,
      espace: projet.espace,
      projet,
      priorite: 4,
      echeance: projet.echeance ?? null,
      dernier: dernierGeste(projet, donnees),
    });
  }

  return candidates
    .map((candidate) => {
      // Une échéance à moins de deux semaines vaut 1, à trois mois presque 0.
      const jours = candidate.echeance ? joursEntre(aujourdhui, candidate.echeance) : null;
      const urgence = jours === null ? 0.2 : Math.max(0, Math.min(1, (90 - jours) / 76));
      const silence = candidate.dernier ? joursEntre(candidate.dernier, aujourdhui) : NEGLIGENCE_MAX;
      const negligence = Math.max(0, Math.min(1, silence / NEGLIGENCE_MAX));
      const dette = dettes[candidate.espace] ?? 0;
      const priorite = (4 - candidate.priorite) / 3;

      const parts = {
        urgence: urgence * POIDS.urgence,
        negligence: negligence * POIDS.negligence,
        dette: dette * POIDS.dette,
        priorite: priorite * POIDS.priorite,
      };
      const dominante = Object.entries(parts).sort((a, b) => b[1] - a[1])[0][0];

      return {
        ...candidate,
        score: Object.values(parts).reduce((somme, valeur) => somme + valeur, 0),
        dominante,
        jours,
        silence: Math.round(silence),
        pourquoi: pourquoiDeLaCandidate(candidate, dominante, jours, silence),
        jamais: !candidate.dernier,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// LA LIGNE DE POURQUOI. Une proposition sans raison est un ordre déguisé : on
// l'exécute ou on l'ignore, mais on ne la juge pas. Avec sa raison, on peut la
// contredire — et c'est ce qui laisse la décision à Noé.
function pourquoiDeLaCandidate(candidate, dominante, jours, silence) {
  // Le projet ne se nomme QUE s'il est autre chose que la candidate elle-même :
  // « Dossier du bloc 4 — Dossier du bloc 4 tombe dans 19 jours » se lit deux
  // fois pour ne rien dire de plus.
  const cap = candidate.forme === 'projet' ? null : candidate.projet?.nom;

  if (dominante === 'urgence' && jours !== null) {
    const quoi = cap ? `« ${cap} »` : 'Son échéance';
    return jours <= 0 ? `${quoi} est passée.` : `${quoi} tombe dans ${Math.round(jours)} jours.`;
  }
  if (dominante === 'negligence') {
    // Jamais rien posé n'est pas la même chose que plus rien depuis un mois :
    // l'un est un chantier qui n'a pas commencé, l'autre un chantier qui coule.
    if (!candidate.dernier) {
      return candidate.forme === 'projet'
        ? `Rien n'a encore été posé dessus.`
        : `Elle attend depuis qu'elle a été notée.`;
    }
    return cap
      ? `Rien n'a bougé sur « ${cap} » depuis ${Math.round(silence)} jours.`
      : `Rien n'a bougé dessus depuis ${Math.round(silence)} jours.`;
  }
  if (dominante === 'dette') return `Cet espace a été peu servi cette semaine.`;
  return `Tu l'as marquée urgente.`;
}

// Trois au plus, et JAMAIS deux du même espace : trois tâches du club d'affilée
// un lundi matin, c'est un programme, pas une proposition. La variété est ce
// qui distingue les deux.
export function propositionsDuMatin(donnees = {}, jour = new Date()) {
  const retenues = [];
  const espacesPris = new Set();

  for (const candidate of vivier(donnees, jour)) {
    if (retenues.length >= MAX_PROPOSITIONS) break;
    if (espacesPris.has(candidate.espace)) continue;
    espacesPris.add(candidate.espace);
    retenues.push(candidate);
  }

  return retenues;
}

// --- Ce que l'événement a laissé derrière lui --------------------------------
//
// LA RÈGLE QUI RANGE LES TROIS CAS (29 août 2026, formulée par Noé) :
//
//     Ce qu'il a DÉCLARÉ devient une tâche.
//     Ce que le hub DÉDUIT devient un message.
//
// La préparation naît d'un modèle qu'il a posé, le tri d'une case qu'il a
// cochée : ce sont des travaux attendus, donc de vraies tâches (voir
// `js/api.js`, `poserCeQuUnEvenementFaitNaitre`). Personne en revanche ne déclare
// qu'un match mérite un carnet ni qu'une réunion mérite un bilan — c'est une
// QUESTION, et une question se pose, elle ne se coche pas.
//
// Deux natures seulement, et c'est volontaire :
//   — une sortie de Yuno qui n'est pas au Carnet de terrain ;
//   — une réunion du FCH sans bilan, parce qu'un bilan de réunion produit du
//     travail concret qu'on oublie sinon.
// Un entraînement du club sans photos ne laisse rien à faire : il n'appelle
// donc rien. L'ESPACE PERSO NON PLUS, JAMAIS — un rendez-vous avec soi ne doit
// ni bilan ni tri, l'espace perso ne mesure rien.
export const SUITE_REMONTE_A = 15;

// Le plus RÉCENT d'abord, jamais le plus ancien : un bilan s'écrit à chaud —
// `js/hermitage.js` le répète depuis le 21 août. Faire remonter une réunion de
// trois semaines pendant qu'un match d'hier attend, c'est perdre le seul qui
// vaille encore quelque chose. Et au-delà de quinze jours on se tait : un bilan
// qu'on n'a pas écrit ne s'écrira pas, et le redemander devient un reproche.
export function suiteDuJour({ evenements = [] } = {}, jour = new Date()) {
  const aujourdhui = versDateISO(jour);
  const plancher = versDateISO(new Date(jour.getTime() - SUITE_REMONTE_A * 86400000));

  const candidats = evenements
    .filter((evenement) => {
      const quand = jourDeLEvenement(evenement);
      if (quand >= aujourdhui || quand < plancher) return false;
      if (evenement.vecu || evenement.sans_suite) return false;
      if (evenement.refusee_le === aujourdhui) return false;
      if (evenement.espace === 'photo') return true;
      return evenement.espace === 'fch' && Boolean(evenement.reunion_objet);
    })
    .sort((a, b) => (jourDeLEvenement(a) < jourDeLEvenement(b) ? 1 : -1));

  const evenement = candidats[0];
  if (!evenement) return null;

  return evenement.espace === 'photo'
    ? {
        evenement,
        quoi: 'carnet',
        phrase: 'Tu l\'inscris au Carnet de terrain ?',
        libelle: 'Ouvrir le carnet',
        adresse: `#yuno/carnet/${evenement.id}`,
      }
    : {
        evenement,
        quoi: 'bilan',
        phrase: 'Son bilan peut en tirer des tâches.',
        libelle: 'Écrire le bilan',
        adresse: `#hermitage/reunions/${evenement.id}`,
      };
}

// --- LA RELECTURE : ce que le hub te remontre --------------------------------
//
// Gardée des trois idées proposées le 29 août 2026, et la seule que Noé ait
// retenue : « le hub te remontre de temps en temps une victoire perso ou une
// intention d'il y a quelques mois ». Presque rien à coder, et c'est exactement
// ce qu'il demandait — « se recentrer ».
//
// ELLE NE TIRE PAS AU SORT. Un choix aléatoire changerait à chaque rendu de la
// page, et une phrase qui bouge pendant qu'on la lit ne se lit pas. Le jour
// détermine le choix : le même jour montre toujours la même chose.
const ANNIVERSAIRES = [
  { mois: 1, mot: 'il y a un mois' },
  { mois: 3, mot: 'il y a trois mois' },
  { mois: 6, mot: 'il y a six mois' },
  { mois: 12, mot: 'il y a un an' },
];

// Deux jours de battement : sans lui, il faudrait tomber pile sur la date, et
// la relecture ne se déclencherait presque jamais.
const BATTEMENT_JOURS = 2;

export function relecture({ victoires = [], intentions = [] } = {}, jour = new Date()) {
  // D'abord un anniversaire : « il y a un an, tu as… » vaut mieux que n'importe
  // quelle phrase choisie au hasard.
  for (const { mois, mot } of ANNIVERSAIRES) {
    const cible = new Date(jour);
    cible.setMonth(cible.getMonth() - mois);

    const trouvee = victoires.find((victoire) => {
      if (!victoire.date) return false;
      const ecart = Math.abs(depuisDateISO(victoire.date) - cible) / 86400000;
      return ecart <= BATTEMENT_JOURS;
    });

    if (trouvee) return { quoi: 'victoire', mot, victoire: trouvee };
  }

  // Sinon une intention, choisie PAR LE JOUR : elle tourne d'un jour à l'autre
  // sans jamais bouger dans la même journée.
  if (!intentions.length) return null;
  const rang = Math.floor(depuisDateISO(versDateISO(jour)) / 86400000) % intentions.length;
  return { quoi: 'intention', intention: intentions[rang] };
}

// --- LA LECTURE : un rythme, jamais un quota --------------------------------
//
// Demande de Noé (29 août 2026). Ce que le hub montre d'un livre est choisi
// avec le même soin que pour les habitudes : PAS d'objectif annuel, PAS de
// nombre de livres à atteindre. « 24 livres cette année » transforme la lecture
// en course et pousse à choisir des livres courts.
//
// Ce qu'il montre à la place : où l'on en est dans le livre, et à quel rythme
// on avance. Le rythme est une observation, pas une cible — il n'y a rien à
// tenir, et un livre lu lentement reste un livre lu.
export function avanceeDuLivre(livre, seances = []) {
  const siennes = seances.filter((seance) => seance.livre_id === livre.id);
  const lues = siennes.reduce((somme, seance) => somme + seance.pages, 0);

  // Un livre déclaré lu est fini, même si le compte des pages ne tombe pas
  // juste : c'est la décision qui dit la vérité, pas l'arithmétique. Même règle
  // que l'état posé d'un projet.
  if (livre.statut === 'lu') return { lues, part: 1, jours: null, rythme: null };

  const jours = new Set(siennes.map((seance) => seance.jour)).size;
  return {
    lues,
    part: livre.pages ? Math.min(1, lues / livre.pages) : null,
    jours,
    // Par JOUR DE LECTURE et non par jour de calendrier : sauter trois jours ne
    // doit pas faire chuter un rythme, sinon c'est un reproche déguisé.
    rythme: jours ? Math.round(lues / jours) : null,
  };
}

// Le livre qu'on est en train de lire : celui dont la dernière séance est la
// plus récente. À défaut de séance, le plus récemment commencé — un livre qu'on
// vient d'ouvrir est en cours même s'il n'a pas encore de page.
export function livreEnCours(livres = [], seances = []) {
  const candidats = livres.filter((livre) => livre.statut === 'en_cours');
  if (!candidats.length) return null;

  const derniereDe = (livre) =>
    seances
      .filter((seance) => seance.livre_id === livre.id)
      .map((seance) => seance.jour)
      .sort()
      .at(-1) ?? livre.commence_le ?? '';

  return [...candidats].sort((a, b) => String(derniereDe(b)).localeCompare(String(derniereDe(a))))[0];
}

// --- LES HABITUDES : trois mesures dont aucune ne peut s'effondrer -----------
//
// LA RÈGLE (29 août 2026, décision de Noé) : « propose-moi des stats qui me
// donnent envie de les faire comme si j'étais dans un jeu, mais en restant sain
// pour que ça ne s'écroule pas à la première fois que j'en saute une. »
//
// Ce qui écroule une habitude, ce n'est pas l'enjeu — c'est le TOUT OU RIEN.
// Une série classique remet à zéro pour une soirée et efface trois semaines.
// Les trois mesures ci-dessous gardent l'enjeu et retirent la falaise.

// L'élan perd DEUX POINTS PAR JOUR, quoi qu'il arrive. C'est cette pente douce
// qui rend l'oubli rattrapable : une semaine entièrement vide coûte 14 points,
// pas la totalité.
export const ELAN_PAR_JOUR = -2;

// Tenir sa cadence rapporte +14 par semaine, quelle que soit cette cadence :
// le gain d'une pratique vaut donc 28 / cadence. Sans cette division, une
// habitude quotidienne monterait deux fois plus vite qu'une hebdomadaire alors
// que les deux demandent le même effort — tenir ce qu'on a dit.
export const ELAN_PAR_SEMAINE_TENUE = 14;

// Assez long pour que l'état converge : à deux points par jour, il faut
// cinquante jours pour aller de 100 à 0. Au-delà, l'histoire ne change plus le
// résultat, et la recalculer coûterait sans rien apporter.
const ELAN_FENETRE_JOURS = 60;

export const PALIERS_HABITUDE = [10, 25, 50, 100, 200, 365];

// Le lundi de la semaine d'un jour donné. Les semaines du hub commencent le
// lundi partout ailleurs (voir `semaineDe`) : deux découpages différents
// donneraient deux comptes pour un même fait.
function lundiDe(jour) {
  const date = new Date(jour);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

// L'ÉLAN, de 0 à 100. Un accumulateur, pas une proportion : une proportion
// retombe aussi vite qu'elle monte, et c'est exactement ce qu'on ne veut pas.
//
// Il se simule jour après jour sur la fenêtre, ce qui est le seul moyen d'être
// exact avec un plafond ET un plancher — une formule fermée les ignorerait, et
// une habitude tenue depuis six mois afficherait 400.
export function elanDeLHabitude(habitude, faits = [], jour = new Date()) {
  // Sans cadence, il n'y a rien à tenir : « quand ça vient » se compte, ne se
  // mesure pas. Lui donner un élan reviendrait à lui poser une cible qu'on a
  // justement refusé de poser.
  if (!habitude.cadence) return null;

  const gain = (ELAN_PAR_SEMAINE_TENUE + 7 * -ELAN_PAR_JOUR) / habitude.cadence;
  const siens = new Set(
    faits.filter((fait) => fait.habitude_id === habitude.id).map((fait) => fait.jour),
  );

  const naissance = habitude.created_at ? versDateISO(new Date(habitude.created_at)) : null;
  const aujourdhui = versDateISO(jour);
  let curseur = versDateISO(ajouterJours(jour, -(ELAN_FENETRE_JOURS - 1)));
  if (naissance && naissance > curseur) curseur = naissance;

  let elan = 0;
  while (curseur <= aujourdhui) {
    elan += ELAN_PAR_JOUR;
    if (siens.has(curseur)) elan += gain;
    elan = Math.max(0, Math.min(100, elan));
    curseur = versDateISO(ajouterJours(depuisDateISO(curseur), 1));
  }
  return Math.round(elan);
}

// LA SÉRIE SE COMPTE EN SEMAINES TENUES, ET ELLE RECULE D'UN CRAN (décision de
// Noé). Deux réglages, deux raisons :
//
//   — en SEMAINES : une semaine est tenue si la cadence est atteinte. Sauter un
//     mardi ne veut alors plus rien dire, ce qui est le point de départ de la
//     demande — « il y aura forcément des jours où je ne pourrai pas ».
//   — RECULE d'un cran au lieu de tomber : sept semaines deviennent six, pas
//     rien. On sent qu'on perd quelque chose, on peut le regagner la semaine
//     suivante. C'est l'enjeu sans la falaise.
//
// La semaine EN COURS ne compte pas encore : elle n'est pas finie, et la juger
// avant l'heure ferait afficher un recul tous les lundis matin.
export function serieDeLHabitude(habitude, faits = [], jour = new Date()) {
  if (!habitude.cadence) return null;

  const siens = faits
    .filter((fait) => fait.habitude_id === habitude.id)
    .map((fait) => versDateISO(lundiDe(depuisDateISO(fait.jour))));

  const parSemaine = new Map();
  for (const lundi of siens) parSemaine.set(lundi, (parSemaine.get(lundi) ?? 0) + 1);

  const debut = habitude.created_at ? lundiDe(new Date(habitude.created_at)) : lundiDe(jour);
  const semaineEnCours = versDateISO(lundiDe(jour));

  let serie = 0;
  let record = 0;
  let curseur = versDateISO(debut);
  while (curseur < semaineEnCours) {
    serie = (parSemaine.get(curseur) ?? 0) >= habitude.cadence ? serie + 1 : Math.max(0, serie - 1);
    record = Math.max(record, serie);
    curseur = versDateISO(ajouterJours(depuisDateISO(curseur), 7));
  }

  return {
    semaines: serie,
    record,
    // Où en est la semaine qu'on vit : ce qui reste à faire pour la tenir.
    cetteSemaine: parSemaine.get(semaineEnCours) ?? 0,
  };
}

// LE CUMUL ET SES PALIERS NE REDESCENDENT JAMAIS, et c'est le ressort de jeu le
// plus sain qui existe : un objectif proche, atteignable, qu'on ne peut pas se
// faire reprendre. Chaque palier franchi écrit une victoire.
export function cumulDeLHabitude(habitude, faits = []) {
  const total = faits.filter((fait) => fait.habitude_id === habitude.id).length;
  const prochain = PALIERS_HABITUDE.find((palier) => palier > total) ?? null;
  return { total, prochain, reste: prochain ? prochain - total : 0 };
}

// Les mots de l'élan. Aucun n'est un reproche : une habitude en sommeil n'est
// pas un échec, c'est une habitude qui attend.
export function motDeLElan(elan) {
  if (elan === null) return '';
  if (elan >= 80) return 'solide';
  if (elan >= 50) return 'ça tient';
  if (elan >= 25) return 'ça vacille';
  return 'en sommeil';
}

// Tout ce qu'un écran a besoin de savoir d'une habitude, en un appel.
export function etatDesHabitudes({ habitudes = [], faits = [] } = {}, jour = new Date()) {
  const aujourdhui = versDateISO(jour);
  return habitudes
    .filter((habitude) => !habitude.archivee)
    .map((habitude) => ({
      habitude,
      elan: elanDeLHabitude(habitude, faits, jour),
      serie: serieDeLHabitude(habitude, faits, jour),
      cumul: cumulDeLHabitude(habitude, faits),
      faitAujourdhui: faits.some(
        (fait) => fait.habitude_id === habitude.id && fait.jour === aujourdhui,
      ),
    }))
    .sort((a, b) => (a.habitude.ordre ?? 99) - (b.habitude.ordre ?? 99));
}

// --- L'AVANCÉE D'UN PROJET : une cascade, jamais les tâches -------------------
//
// LA RÈGLE (29 août 2026, décision de Noé). Sa phrase : « l'avancée des projets
// ne doit pas être complètement liée aux tâches, ce n'est pas ça qui dit que
// c'est fini ou non car des tâches s'ajoutent petit à petit. »
//
// Ce que ses données disaient ce jour-là, et qui a réglé la question :
//
//   « Deuxième dossier »   3 tâches sur 3 → barre PLEINE, sur un projet actif
//                          qui annonce 25 h de travail. Il commençait à peine.
//   « Album du club »      1 sur 14 → 7 %, et il avait RECULÉ à chaque tâche
//                          écrite. Le dénominateur punissait le geste même que
//                          le hub veut encourager : noter ce qu'on a à faire.
//
// Le défaut est structurel : un dénominateur qui grandit à l'usage ne mesure
// rien. D'où trois mesures dans un ordre, et le projet est mesuré par la
// première qu'il a DÉCLARÉE :
//
//   1. `etapes`   ses étapes franchies — des marches, comme les jalons d'un cap
//   2. `charge`   les minutes faites sur la charge annoncée
//   3. `aucune`   il n'a rien déclaré : le trait pointillé, et rien de plus
//
// Les deux premières ont le même mérite, et c'est tout l'objet de la cascade :
// leur dénominateur s'écrit UNE FOIS, à la création du projet. Ajouter dix
// tâches ne le bouge plus.
//
// Ce qui reste des tâches : elles RENSEIGNENT la charge (par leurs durées) et
// elles disent le mouvement — elles ne définissent plus rien.
export function avanceeDuProjet(projet, taches = []) {
  const siennes = taches.filter((tache) => tache.projet_id === projet.id);
  const total = siennes.length;
  const faites = siennes.filter((tache) => tache.statut === 'fait').length;
  const socle = { total, faites, etapes: projet.etapes ?? [] };

  // L'ÉTAT POSÉ PASSE DEVANT TOUT. Un projet déclaré terminé a sa barre pleine
  // même s'il reste des étapes ou des heures : c'est la décision de Noé qui dit
  // la vérité, pas le décompte. L'inverse donnerait tort à sa décision.
  if (projet.statut === 'termine') return { ...socle, mesure: 'declaree', part: 1 };

  // UN PROJET À L'ANNÉE NE SE MESURE PAS, même s'il porte des étapes : il n'a
  // pas de ligne d'arrivée, et une jauge qui se remplit lui en promettrait une.
  // C'est un rythme, il tourne — il n'avance pas.
  if (projet.statut === 'annuel') return { ...socle, mesure: 'aucune', part: 0 };

  const etapes = projet.etapes ?? [];
  if (etapes.length) {
    const franchies = etapes.filter((etape) => etape.atteint).length;
    return {
      ...socle,
      mesure: 'etapes',
      part: franchies / etapes.length,
      franchies,
      marches: etapes.length,
    };
  }

  // La charge : le dénominateur est annoncé, le numérateur vient des durées
  // réellement notées. Il peut DÉPASSER, et c'est une information, pas une
  // faute — `part` est plafonnée pour l'affichage, `minutes` dit le vrai.
  if (projet.charge_minutes > 0) {
    const minutes = siennes
      .filter((tache) => tache.statut === 'fait')
      .reduce((somme, tache) => somme + (tache.duree ?? 0), 0);

    // LE SILENCE DES DURÉES N'EST PAS UN ZÉRO. « Deuxième dossier » a ses trois
    // tâches faites et pas une durée notée : afficher « 0 h sur 25 h » dirait
    // que rien n'a été fait, ce qui est faux — on n'en sait rien. C'est la même
    // précaution que la première ligne de `#temps`, et elle vaut ici pour la
    // même raison : un total bas se lit comme une semaine légère alors qu'il ne
    // dit que le silence.
    const sansDuree = faites > 0 && minutes === 0;

    return {
      ...socle,
      mesure: 'charge',
      part: sansDuree ? 0 : Math.min(1, minutes / projet.charge_minutes),
      minutes,
      annonce: projet.charge_minutes,
      sansDuree,
    };
  }

  return { ...socle, mesure: 'aucune', part: 0 };
}

// --- LE MOUVEMENT : est-ce que ça vit ? --------------------------------------
//
// Ce que la cascade ne dit pas, et que Noé a demandé à côté d'elle : un projet
// peut être à 2 étapes sur 5 depuis trois semaines. L'avancée répond à « où
// j'en suis », le mouvement à « est-ce que ça bouge » — deux questions, deux
// réponses, et la seconde ne coûte aucune saisie.
//
// LA DERNIÈRE TRACE est la plus récente entre la dernière tâche terminée et la
// NAISSANCE du projet. Sans la naissance, un projet créé la veille serait
// « jamais touché » et passerait devant tout le monde. C'est mesuré, pas
// supposé : au 29 août, les quatre projets vivants de Noé avaient tous été
// créés le 27 et n'avaient aucune action — trier sur la seule dernière action
// n'aurait rien classé du tout.
export function mouvementDuProjet(projet, taches = [], jour = new Date()) {
  const aujourdhui = versDateISO(jour);
  const siennes = taches.filter((tache) => tache.projet_id === projet.id);

  const jours = siennes
    .filter((tache) => tache.statut === 'fait' && tache.date_fait)
    .map((tache) => versDateISO(new Date(tache.date_fait)));

  const naissance = projet.created_at ? versDateISO(new Date(projet.created_at)) : aujourdhui;
  const derniere = jours.sort().at(-1);
  const trace = derniere && derniere > naissance ? derniere : naissance;

  const ilYaSeptJours = versDateISO(new Date(depuisDateISO(aujourdhui) - 7 * 86400000));

  return {
    dormance: Math.max(
      0,
      Math.round((depuisDateISO(aujourdhui) - depuisDateISO(trace)) / 86400000),
    ),
    cetteSemaine: jours.filter((date) => date > ilYaSeptJours).length,
    // Un projet qui n'a JAMAIS rien vu fini ne dort pas, il n'a pas commencé.
    // Les deux méritent d'être dits, et pas avec les mêmes mots.
    commence: Boolean(derniere),
  };
}

// --- Les projets en cours, et lequel se montre en premier ---------------------
//
// LA DORMANCE, ET NON LA DERNIÈRE ACTION (29 août 2026). Noé hésitait entre
// « celui pour lequel ça fait le plus longtemps que je n'ai rien fait » et
// « le plus récent ». La mesure a tranché contre les deux : au 29 août, ses
// quatre projets vivants avaient TOUS été créés le 27 et n'avaient donc aucune
// action. Trier là-dessus aurait mis devant ceux qui n'ont rien fait *parce
// qu'ils viennent de naître*, et n'aurait rien classé du tout.
//
// D'où la DERNIÈRE TRACE : la plus récente entre la dernière tâche terminée et
// la naissance du projet. Un projet neuf n'est jamais dormant, et la règle
// devient un vrai classement dès qu'il y a de l'histoire. À égalité, celui qui
// a le plus de travail devant lui passe devant — sans quoi rien ne départagerait
// quatre projets du même jour.
//
// ET ÇA VARIE TOUT SEUL, ce que Noé demandait : agir sur celui de devant le
// renvoie au fond. Une rotation par jour aurait tourné sans rien dire.
//
// TOUS LES PROJETS ACTIFS, ET EUX SEULS (29 août 2026, correction de Noé :
// « mets tous les projets en cours, pas seulement 4 — par contre pas les
// projets à l'année »).
//
// Deux règles sont tombées avec cette phrase, et les deux méritent leur raison :
//
//   — « à l'année » SORT, alors que le hub le range dans « en cours » depuis le
//     28 août. Ce n'est pas une contradiction : un rythme n'avance pas, il
//     tourne. Le rail classe par DORMANCE — « depuis quand rien n'a bougé » —
//     et cette question n'a pas de sens pour une chose qui revient toute seule
//     chaque semaine. « Anniversaires du mois » y serait éternellement en tête
//     sans que ce soit vrai.
//
//   — le filtre « au moins une tâche ouverte » TOMBE. Il écartait les projets
//     vides, et c'est exactement ceux qu'il faut voir : un projet sans une
//     seule tâche est un projet qui n'a pas commencé, et il n'y a que ce rail
//     pour le dire. Il s'affiche avec sa jauge à zéro et « Rien de daté ».
const VIVANTS = ['actif'];

export function projetsEnCours({ projets = [], taches = [] } = {}, jour = new Date()) {
  return projets
    .filter((projet) => VIVANTS.includes(projet.statut))
    .map((projet) => {
      const siennes = taches.filter((tache) => tache.projet_id === projet.id);
      const restantes = siennes.filter((tache) => tache.statut !== 'fait');

      // La jauge du rail suit LA MÊME CASCADE que la galerie de `#objectifs` —
      // étapes, puis charge, puis rien. Deux écrans qui mesureraient le même
      // projet de deux façons différentes finiraient par se contredire.
      const avancee = avanceeDuProjet(projet, taches);
      const mouvement = mouvementDuProjet(projet, taches, jour);

      // La prochaine échéance : ce que la tuile met en pied. Sans date, elle se
      // tait plutôt que d'inventer un « bientôt ».
      const prochaine = restantes
        .filter((tache) => tache.echeance)
        .sort((a, b) => (a.echeance < b.echeance ? -1 : 1))[0] ?? null;

      return {
        projet,
        reste: restantes.length,
        faites: siennes.length - restantes.length,
        total: siennes.length,
        avancee,
        ...mouvement,
        prochaine,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.dormance - a.dormance || b.reste - a.reste);
}
