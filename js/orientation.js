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

import { versDateISO, depuisDateISO } from './format.js';

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
// LE MOMENT COMPTE AUTANT QUE LE CALCUL. Dire « ça ne tient pas » un dimanche
// soir, c'est l'annoncer quand il ne reste que de mauvaises options. Le dire
// pendant qu'on déclare un mois, c'est le dire trois semaines avant, à froid.
//
// Le hub POSE LA QUESTION, il ne tranche pas : c'est le choix de Noé (27 août
// 2026), et il vaut pour tout le système. Les deux issues proposées sont des
// portes, pas des recommandations.
export function tensionDeLaPeriode(periode) {
  const visees = chargeViseeDeLaPeriode(periode);
  const ecart = visees.total - CAPACITE_ALTERNANCE;

  if (ecart <= 0) {
    return {
      ...visees,
      capacite: CAPACITE_ALTERNANCE,
      ecart,
      tendue: false,
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
