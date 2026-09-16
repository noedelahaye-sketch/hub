// LE CATALOGUE DES OFFRES PARTENAIRES — ce à quoi le club s'engage quand une
// entreprise prend telle offre (16 septembre 2026).
//
// POURQUOI CE FICHIER ET PAS UNE TABLE : le catalogue change une fois par an,
// avec le dossier partenaires, et RIEN NE S'Y COCHE. Ce qui se coche, ce sont
// les engagements d'UN partenaire, et ceux-là sont en base.
//
// ET SURTOUT : CE DÉPÔT EST PUBLIC. Le catalogue est déjà public — c'est le
// dossier qu'on envoie aux entreprises. Les partenaires, leurs montants, leurs
// CERFA et leurs notes ne le sont pas : ils vivent en base, derrière RLS. La
// ligne passe exactement là.
//
// SOURCE : « Dossier Partenaires du FCH », saison 2026-2027, pages 11 à 16 —
// les cinq packs, le panneau seul, le sponsoring maillot et le mécénat.

// ── CE QUE LE CLUB DOIT FAIRE ─────────────────────────────────────────────────

// Chaque engagement est une CHOSE À FAIRE de notre côté, pas un avantage rédigé
// du point de vue de l'entreprise : « poser le panneau » et non « bénéficier
// d'un panneau ». C'est ce qui en fait une liste de suivi et pas une plaquette.
//
// `quand` dit le moment de la saison où ça se joue : c'est ce qui permet de
// ranger le travail au lieu de le lister à plat.
export const ENGAGEMENTS_FCH = {
  'vignette-album': {
    libelle: 'Faire la vignette partenaire de l’album',
    quand: 'album',
    aide: 'Logo, carte de visite ou visuel, à glisser dans les pochettes.',
  },
  'encart-album': {
    libelle: 'Faire l’encart dans l’album',
    quand: 'album',
    aide: 'Le format dépend de l’offre : un quart, une demie ou une page entière.',
  },
  'panneau-entree': {
    libelle: 'Ajouter le logo au panneau collectif de l’entrée',
    quand: 'rentree',
    aide: 'Le panneau des partenaires, à l’entrée du stade.',
  },
  'panneau-stade': {
    libelle: 'Faire poser le panneau autour du stade',
    quand: 'rentree',
    aide: '200 × 75 cm, visible aux matchs, entraînements et tournois.',
  },
  maillot: {
    libelle: 'Faire floquer le maillot et organiser la remise',
    quand: 'saison',
    aide: 'Logo exclusif au centre du devant, plus la photo officielle de remise.',
  },
  'ballon-senior': {
    libelle: 'Offrir le ballon du match senior',
    quand: 'saison',
    aide: 'Un match senior de la saison, avec la remise sur le terrain.',
  },
  'terrain-tournoi-rose': {
    libelle: 'Nommer un terrain du Tournoi Rose au nom de l’entreprise',
    quand: 'tournoi-rose',
  },
  'naming-tournoi-rose': {
    libelle: 'Donner le naming principal du Tournoi Rose',
    quand: 'tournoi-rose',
    aide: 'Le nom sur l’affiche, dans les communications, et la remise des récompenses.',
  },
  'publication-reseaux': {
    libelle: 'Publier le post dédié sur les réseaux',
    quand: 'rentree',
    aide: 'Publication dédiée, entreprise identifiée.',
  },
  'reseau-partenaires': {
    libelle: 'Intégrer l’entreprise au réseau partenaires',
    quand: 'rentree',
  },
  'soiree-partenaires': {
    libelle: 'Inviter à la soirée partenaires',
    quand: 'soiree',
  },
};

// Les moments de la saison, dans l'ordre où ils arrivent. C'est par là que la
// page range le travail : ce qui se prépare à la rentrée, ce qui part avec
// l'album, ce qui attend le Tournoi Rose.
export const MOMENTS_FCH = [
  ['rentree', 'À la rentrée'],
  ['album', 'Avec l’album du club'],
  ['saison', 'Dans la saison'],
  ['tournoi-rose', 'Au Tournoi Rose'],
  ['soiree', 'À la soirée partenaires'],
];

// ── LES OFFRES ────────────────────────────────────────────────────────────────

// `engagements` : la clé, et son détail quand l'offre en précise un (le format
// de l'encart, la taille du maillot). Le détail est ce qui distingue deux
// partenaires qui ont coché la même ligne.
export const OFFRES_FCH = [
  {
    id: 'coup-denvoi',
    nom: 'Coup d’Envoi',
    nature: 'pack',
    montant: 250,
    apresImpot: 100,
    engagements: [
      ['panneau-entree'],
      ['publication-reseaux'],
      ['reseau-partenaires'],
      ['soiree-partenaires'],
    ],
  },
  {
    id: 'esprit-collectif',
    nom: 'Esprit Collectif',
    nature: 'pack',
    montant: 800,
    apresImpot: 320,
    engagements: [
      ['panneau-stade'],
      ['vignette-album'],
      ['encart-album', 'Un quart de page'],
      ['publication-reseaux'],
      ['reseau-partenaires'],
      ['soiree-partenaires'],
    ],
  },
  {
    id: 'transmission',
    nom: 'Transmission',
    nature: 'pack',
    montant: 1750,
    apresImpot: 700,
    engagements: [
      ['maillot', 'Foot à 5'],
      ['encart-album', 'Une demi-page'],
      ['panneau-stade'],
      ['vignette-album'],
      ['publication-reseaux'],
      ['reseau-partenaires'],
      ['soiree-partenaires'],
    ],
  },
  {
    id: 'ambition',
    nom: 'Ambition',
    nature: 'pack',
    montant: 2500,
    apresImpot: 1000,
    engagements: [
      ['maillot', 'Foot à 8 ou à 11'],
      ['encart-album', 'Page entière'],
      ['ballon-senior'],
      ['terrain-tournoi-rose'],
      ['panneau-stade'],
      ['vignette-album'],
      ['publication-reseaux'],
      ['reseau-partenaires'],
      ['soiree-partenaires'],
    ],
  },
  {
    id: 'tournoi-rose',
    nom: 'Tournoi Rose',
    nature: 'pack',
    montant: 3500,
    apresImpot: 1400,
    engagements: [
      ['naming-tournoi-rose'],
      ['maillot', 'Foot à 8 ou à 11'],
      ['encart-album', 'Page entière'],
      ['ballon-senior'],
      ['panneau-stade'],
      ['vignette-album'],
      ['publication-reseaux'],
      ['reseau-partenaires'],
      ['soiree-partenaires'],
    ],
  },
  {
    id: 'panneau',
    nom: 'Panneau autour du stade',
    nature: 'panneau',
    montant: 1200,
    detail: 'Engagement sur trois saisons : 600 €, puis 400 €, puis 200 €.',
    engagements: [
      ['panneau-stade', '200 × 75 cm, trois saisons'],
      ['publication-reseaux'],
      ['reseau-partenaires'],
      ['soiree-partenaires'],
    ],
  },
  {
    id: 'maillot-5',
    nom: 'Sponsoring maillot · foot à 5',
    nature: 'maillot',
    montant: 800,
    apresImpot: 320,
    engagements: [['maillot', 'Foot à 5'], ['reseau-partenaires'], ['soiree-partenaires']],
  },
  {
    id: 'maillot-8',
    nom: 'Sponsoring maillot · foot à 8',
    nature: 'maillot',
    montant: 1200,
    apresImpot: 480,
    engagements: [['maillot', 'Foot à 8'], ['reseau-partenaires'], ['soiree-partenaires']],
  },
  {
    id: 'maillot-11',
    nom: 'Sponsoring maillot · foot à 11',
    nature: 'maillot',
    montant: 1500,
    apresImpot: 600,
    engagements: [['maillot', 'Foot à 11'], ['reseau-partenaires'], ['soiree-partenaires']],
  },
  {
    id: 'mecenat',
    nom: 'Mécénat',
    nature: 'mecenat',
    montant: null,
    detail: 'Un don, financier ou non, sans contrepartie publicitaire directe. '
      + 'Réduction d’impôt de 60 % sous conditions.',
    // RIEN N'EST DÛ, et c'est la définition même du mécénat : un don sans
    // contrepartie. Les engagements d'un mécène sont donc TOUJOURS des ajouts,
    // négociés au cas par cas — une vignette d'album offerte, par exemple.
    engagements: [],
  },
];

export const offreDe = (id) => OFFRES_FCH.find((o) => o.id === id) ?? null;

// LES ENGAGEMENTS QUE L'OFFRE FAIT NAÎTRE, prêts à écrire en base. `origine`
// vaut `offre` : c'est ce qui les distingue de ce que Noé ajoute ensuite à la
// main, et il faut pouvoir les distinguer — un engagement du pack se retrouve
// dans le dossier, un engagement négocié n'existe que dans les notes.
export function engagementsDeLOffre(id) {
  const offre = offreDe(id);
  if (!offre) return [];
  return offre.engagements.map(([cle, detail = null]) => ({
    cle,
    libelle: ENGAGEMENTS_FCH[cle].libelle,
    detail,
    origine: 'offre',
  }));
}

// ── LES ÉTATS D'UN PARTENARIAT ────────────────────────────────────────────────

// Les mots du tableau de Noé, dans l'ordre où une relation avance. On ne garde
// que la fin de la chaîne : « à relancer », « en discussion » et « refus »
// restent dans le tableau, qui est l'outil de PROSPECTION. Le hub reprend la
// suite — ce qui est signé, et ce qu'on doit faire pour l'honorer.
export const ETATS_PARTENAIRE = [
  ['virement_attendu', 'Virement en attente', '#d59f55'],
  ['partenaire', 'Partenaire du club', '#5aa66f'],
];
