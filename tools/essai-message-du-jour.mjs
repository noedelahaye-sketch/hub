// ÉPROUVE LES DEUX BANDEAUX DE L'ACCUEIL HORS ÉCRAN (19 septembre 2026).
//
// POURQUOI IL EXISTE : l'accueil n'affiche qu'UN message à la fois, et il ne
// s'affiche que dans une fenêtre de deux jours avant l'événement ou quinze
// jours après. Sa règle a donc une vingtaine de branches qu'on ne peut pas voir
// à l'écran d'un jour particulier, puisqu'une seule y parle. Et l'une d'elles a
// silencieusement manqué pendant trois semaines : le message de l'après
// survivait au compte-rendu qu'il avait lui-même fait écrire, parce que le
// bilan d'une réunion vit sur sa fiche et que `suiteDuJour` ne lisait que les
// événements.
//
// C'est le motif de `tools/essai-diagnostic.mjs` et de `essai-accueil-fch.mjs` :
// une règle qu'on ne peut pas rejouer est une règle qu'on croit sur parole.
//
//   node tools/essai-message-du-jour.mjs
import {
  messageDuJour, preparationDuJour, suiteDuJour,
  SUITE_REMONTE_A, PREPARATION_MONTE_A,
} from '../js/orientation.js';

const LE_JOUR = new Date('2026-09-19T09:00:00');
// Le fixture DOIT porter un fuseau complet : `+00` seul n'est pas une date ISO,
// `new Date` rend NaN, et le banc passe alors au vert en ne testant rien.
const inst = (ecart, h = 15) => {
  const x = new Date(LE_JOUR);
  x.setDate(x.getDate() + ecart);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

const reunion = (ecart, champs = {}) => ({
  id: 'r1', espace: 'fch', titre: 'Réunion Lina', date_debut: inst(ecart),
  reunion_objet: 'communication', vecu: false, sans_suite: false, refusee_le: null, ...champs,
});
const sortie = (ecart, champs = {}) => ({
  id: 's1', espace: 'photo', titre: 'Match U17', date_debut: inst(ecart),
  vecu: false, sans_suite: false, refusee_le: null, ...champs,
});
const entrainement = (ecart) => ({
  id: 'e1', espace: 'fch', titre: 'Entraînement U13', date_debut: inst(ecart),
  reunion_objet: null, vecu: false, sans_suite: false, refusee_le: null,
});
const seance = (ecart) => ({
  id: 'p1', espace: 'perso', titre: 'Course', date_debut: inst(ecart),
  vecu: false, sans_suite: false, refusee_le: null,
});

const ficheDe = (evenementId, nature, conclue = false) =>
  ({ evenement_id: evenementId, fiche_id: `f-${evenementId}`, nature, conclue });

// Chaque cas dit ce qu'on attend : le `quoi` du message, et son adresse quand
// elle compte — c'est elle, et elle seule, qui décide où le doigt atterrit.
const cas = [
  // ── L'AVANT : la porte de la préparation ────────────────────────────────
  ['une réunion dans 2 jours sans fiche → la liste des réunions',
    { evenements: [reunion(2)] }, 'preparation', '#hermitage/reunions'],
  ['une réunion dans 2 jours AVEC sa fiche → sa fiche',
    { evenements: [reunion(2)], fiches: [ficheDe('r1', 'reunion')] },
    'preparation', '#hermitage/reunions/f-r1'],
  ['une sortie sans feuille → la fiche de la sortie, qui porte « Préparer »',
    { evenements: [sortie(1)] }, 'preparation', '#yuno/evenement/s1'],
  ['une sortie AVEC sa feuille → sa feuille',
    { evenements: [sortie(1)], fiches: [ficheDe('s1', 'sortie')] },
    'preparation', '#yuno/preparations/f-s1'],
  ['il reste le jour J — la fiche sert PENDANT',
    { evenements: [reunion(0)] }, 'preparation', '#hermitage/reunions'],
  [`au-delà de ${PREPARATION_MONTE_A} jours, rien`,
    { evenements: [reunion(PREPARATION_MONTE_A + 1)] }, null],
  ['un entraînement sans réunion n\'a rien à préparer',
    { evenements: [entrainement(1)] }, null],
  ['le perso n\'appelle JAMAIS rien', { evenements: [seance(1)] }, null],
  ['« pas maintenant » vaut pour la journée',
    { evenements: [reunion(1, { refusee_le: '2026-09-19' })] }, null],
  ['la croix posée sur l\'après vaut aussi pour l\'avant',
    { evenements: [reunion(1, { sans_suite: true })] }, null],
  ['le PLUS PROCHE d\'abord — il reste le moins de temps',
    { evenements: [reunion(2), sortie(1)] }, 'preparation', '#yuno/evenement/s1'],

  // LA NATURE DE LA FICHE DÉCIDE DE L'ADRESSE. Une vieille feuille Yuno
  // accrochée à une réunion du club ne doit pas l'envoyer dans le mauvais site.
  ['une feuille Yuno sur une réunion du club est ignorée',
    { evenements: [reunion(1)], fiches: [ficheDe('r1', 'sortie')] },
    'preparation', '#hermitage/reunions'],

  // ── L'APRÈS : la porte du bilan ─────────────────────────────────────────
  ['une réunion d\'hier sans compte-rendu appelle son bilan',
    { evenements: [reunion(-1)] }, 'bilan', '#hermitage/reunions/r1'],
  ['une sortie d\'hier hors carnet appelle le carnet',
    { evenements: [sortie(-1)] }, 'carnet', '#yuno/carnet/s1'],
  ['LE COMPTE-RENDU ÉCRIT FAIT TAIRE LA RÉUNION',
    { evenements: [reunion(-1)], fiches: [ficheDe('r1', 'reunion', true)] }, null],
  ['une fiche OUVERTE mais pas conclue ne le fait pas taire',
    { evenements: [reunion(-1)], fiches: [ficheDe('r1', 'reunion', false)] }, 'bilan'],
  ['le carnet écrit fait taire la sortie',
    { evenements: [sortie(-1, { vecu: true })] }, null],
  ['la feuille d\'une sortie ne la fait pas taire — sa suite est le CARNET',
    { evenements: [sortie(-1)], fiches: [ficheDe('s1', 'sortie')] }, 'carnet'],
  ['la croix est définitive',
    { evenements: [reunion(-1, { sans_suite: true })] }, null],
  [`au-delà de ${SUITE_REMONTE_A} jours on se tait`,
    { evenements: [reunion(-SUITE_REMONTE_A - 1)] }, null],
  ['le plus RÉCENT d\'abord — un bilan s\'écrit à chaud',
    { evenements: [reunion(-10), sortie(-1)] }, 'carnet'],

  // ── LA CASCADE : ce qui ARRIVE passe devant ce qui est PASSÉ ────────────
  ['une préparation qui vient passe devant un bilan qui attend',
    { evenements: [reunion(1), sortie(-1)] }, 'preparation'],
  ['et le bilan reprend la main dès qu\'il n\'y a plus rien à préparer',
    { evenements: [sortie(-1)] }, 'carnet'],
  ['rien à dire : rien', { evenements: [entrainement(1), seance(-1)] }, null],
];

let faux = 0;
for (const [nom, donnees, quoi, adresse] of cas) {
  const eu = messageDuJour(donnees, LE_JOUR);
  const ok = (eu?.quoi ?? null) === quoi && (adresse === undefined || eu?.adresse === adresse);
  if (!ok) faux++;
  console.log(
    `${ok ? '✓' : '✗'} ${nom}` +
      (ok ? '' : ` → ${eu?.quoi ?? null} ${eu?.adresse ?? ''}, attendu ${quoi} ${adresse ?? ''}`),
  );
}

// LES DEUX FENÊTRES NE SE RECOUVRENT NI NE LAISSENT DE TROU : l'avant tient de
// J−2 au soir du jour J, l'après reprend à J+1. C'est ce qui garantit qu'aucun
// des deux ne parle par-dessus l'autre pour un MÊME événement.
for (let ecart = -3; ecart <= 3; ecart++) {
  const donnees = { evenements: [reunion(ecart)] };
  const avant = Boolean(preparationDuJour(donnees, LE_JOUR));
  const apres = Boolean(suiteDuJour(donnees, LE_JOUR));
  const eu = avant && apres ? 'LES DEUX' : avant ? 'avant' : apres ? 'après' : 'rien';
  // Le fixture compte en « J+ecart » ; le bandeau de l'après regarde en
  // ARRIÈRE, donc un ecart négatif est un événement passé.
  const veut = ecart > 0 ? (ecart <= PREPARATION_MONTE_A ? 'avant' : 'rien')
    : ecart === 0 ? 'avant' : 'après';
  const ok = eu === veut;
  if (!ok) faux++;
  console.log(`${ok ? '✓' : '✗'} J${ecart >= 0 ? '+' : ''}${ecart} → ${eu}` + (ok ? '' : ` (attendu ${veut})`));
}

console.log(faux ? `\n${faux} cas en échec.` : `\nLes ${cas.length + 7} cas passent.`);
process.exit(faux ? 1 : 0);
