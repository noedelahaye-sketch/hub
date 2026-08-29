// LES REPÈRES DU FC HERMITAGE — la matière de `#hermitage/club` (29 août 2026).
//
// POURQUOI CE FICHIER ET PAS UNE TABLE. Rien ici ne change plus d'une fois par
// an, rien ne se coche, rien ne se compte : une table aurait demandé une
// migration, un écran d'édition et une API pour des lignes que personne ne
// modifie. C'est le même choix que `js/logos-clubs.js` — des données du dépôt,
// versionnées avec le code, relues d'un coup d'œil dans une revue.
//
// D'OÙ ELLES VIENNENT, et c'est ce qui les rend fiables :
//   — les commissions et leurs missions : `Responsabilités FCH.pdf` (dossier
//     FCH, août 2026), le document que le club s'est donné ;
//   — les chiffres et le projet : le dossier partenaires 2026-2027, pages 3 à 6 ;
//   — les créneaux : « Programmation des entraînements » 2026-2027.
//
// CE QUI N'EST PAS ICI, VOLONTAIREMENT : les événements de la saison. Ils sont
// en base (`evenements`) et se voient au calendrier. Les redire ici ferait deux
// sources pour une même date, et c'est toujours la copie qui vieillit.
//
// L'ÉCRAN QUI LES MONTRE NE FAIT QUE LIRE. C'est un aide-mémoire : il sert
// l'objectif « laisser une com qui tourne sans moi » — celui qui reprend doit
// savoir à qui s'adresser et sur quoi s'aligner — et il ne demande donc aucun
// geste.

// Ce que le club est, en chiffres. Deux colonnes : le chiffre, puis ce qu'il
// veut dire — un nombre sans sa phrase ne se retient pas.
export const REPERES = [
  ['2004', 'année de création, de l’union de trois clubs'],
  ['3', 'communes : Beaumont-Monteux, Chanos-Curson, Mercurol-Veaunes'],
  ['+200', 'licenciés, des U7 aux vétérans'],
  ['10', 'catégories et 17 équipes, dont les Mam’s et les U20 créés cette saison'],
  ['21', 'éducateurs'],
  ['15', 'dirigeants, et une trentaine de bénévoles'],
  ['+2000', 'abonnés sur les réseaux du club'],
  ['8', 'événements par saison'],
];

// LA MISSION ET LES VALEURS : la référence de la ligne éditoriale, et l'une des
// missions écrites de Noé — « mettre en place une ligne éditoriale cohérente
// avec le projet du club ». Elles sont ici pour être RELUES avant d'écrire.
export const MISSION = 'Transmettre l’envie de jouer.';

export const VALEURS = [
  ['Esprit collectif', 'Penser et agir pour le groupe avant soi.'],
  ['Transmission', 'Partager son expérience et apprendre des autres.'],
  ['Respect', 'Parler et agir avec considération, quelles que soient les situations.'],
  ['Chaleur humaine', 'Accueillir chaque personne avec simplicité et bienveillance.'],
  ['Émotions', 'Exprimer ses émotions et respecter celles des autres.'],
  ['Investissement', 'S’investir activement dans la vie du club.'],
];

// LES NEUF COMMISSIONS, et qui les porte. L'ordre est celui du document du
// club. `noe` marque celles où Noé a une mission écrite : la Communication est
// LA SIENNE (cinq axes, une quinzaine de missions), et il tient une seule ligne
// côté Partenaires — « contribuer à leur visibilité dans la vie du club ».
// Distinguer les deux évite de laisser croire que la prospection est son
// travail : elle est à Lorenzo.
export const COMMISSIONS = [
  { nom: 'Présidence', gens: ['Lionel', 'Cédric'] },
  { nom: 'Secrétariat', gens: ['Benoit'] },
  { nom: 'Trésorerie', gens: ['Rémy'] },
  { nom: 'Sportif', gens: ['Christophe'] },
  { nom: 'Manifestations', gens: ['Djamel', 'Sandrine'] },
  {
    nom: 'Communication',
    gens: ['Noé', 'Lina'],
    noe: 'responsable',
    missions: [
      'Définir et structurer la communication — cohérence visuelle et rédactionnelle, planning de la saison, ligne éditoriale.',
      'Produire et diffuser les contenus — visuels, photos, vidéos, textes ; mettre en valeur équipes, joueurs, éducateurs et bénévoles.',
      'Animer la vie du club — valoriser les initiatives internes, relayer les événements.',
      'Assurer le lien interne et externe — diffusion auprès des licenciés et des parents.',
      'Coordonner et déléguer — répartir photo, vidéo, rédaction ; s’appuyer sur les éducateurs pour la remontée d’informations.',
    ],
  },
  { nom: 'Infrastructures', gens: ['Hicham'] },
  { nom: 'Buvette', gens: ['Loïc'] },
  {
    nom: 'Partenaires',
    gens: ['Lorenzo'],
    noe: 'contribue',
    missions: ['Valoriser les partenaires — contribuer à leur visibilité dans la vie du club.'],
  },
];

// Les créneaux d'entraînement de la semaine. C'est la matière du projet
// « Programmation de la semaine » : savoir qui s'entraîne où, et quand, sans
// rouvrir le visuel de la saison.
export const CRENEAUX = [
  ['Mardi', [
    ['U9', 'Beaumont-Monteux', '18h–19h15'],
    ['U13', 'Chanos-Curson', '18h–19h15'],
    ['U17', 'Beaumont-Monteux', '19h15–20h45'],
    ['U20', 'Chanos-Curson', '19h30–21h'],
  ]],
  ['Mercredi', [
    ['U11', 'Chanos-Curson', '18h–19h15'],
    ['U15', 'Châteauneuf/Isère', '18h–19h30'],
    ['Séniors', 'Chanos-Curson', '19h30–21h'],
  ]],
  ['Jeudi', [
    ['U7', 'Beaumont-Monteux', '17h45–18h45'],
    ['U9', 'Beaumont-Monteux', '18h–19h15'],
    ['U20', 'Châteauneuf/Isère', '19h30–21h'],
  ]],
  ['Vendredi', [
    ['U11', 'Beaumont-Monteux', '17h45–19h'],
    ['U13', 'Chanos-Curson', '18h–19h15'],
    ['U15', 'Beaumont-Monteux', '18h45–20h15'],
    ['U17', 'Châteauneuf/Isère', '19h15–20h45'],
    ['Séniors', 'Chanos-Curson', '19h30–21h'],
  ]],
  ['Samedi', [
    ['U7', 'Chanos-Curson', '10h–11h30'],
  ]],
];
