// LES RESPONSABILITÉS ET MISSIONS DU FC HERMITAGE — la source, et la seule.
//
// Source : « Responsabilités FCH-2.pdf », saison 2026–2027, remis par Noé le
// 20 septembre 2026. Le document se lit de DEUX FAÇONS — « par personne »
// (p. 1–3) et « par commission » (p. 4–6) —, et ce sont les MÊMES missions
// rangées deux fois. C'est ce que Noé demande d'obtenir à l'écran : *« un récap
// des responsabilités et missions comme dans le document, joint aux missions de
// chacun — si l'un change ça change sur l'autre page ».*
//
// D'OÙ UNE LISTE PLATE, ET RIEN D'AUTRE. Une mission est une phrase, un thème,
// une commission et une personne ; les deux vues ne sont que deux façons de la
// grouper. Écrire les missions DANS chaque fiche de personne, comme le hub le
// faisait jusqu'ici, obligeait à les recopier dans la page d'une commission —
// **et deux copies d'une même phrase finissent toujours par diverger**, sans
// qu'on sache laquelle est la bonne.
//
// LE THÈME EST NOUVEAU, et c'est lui qui rend le récapitulatif lisible : c'est
// le titre de colonne du document (« Représenter le club », « Coordonner et
// déléguer »…). Les missions du hub n'en avaient pas — elles étaient une simple
// liste de phrases par personne, transcrites de la version précédente du
// document, plus longues et moins nombreuses. Cette version-ci les découpe en
// gestes courts, et c'est ce découpage qui se range en colonnes.
//
// UNE MISSION PEUT ÊTRE À DEUX, et le document l'écrit ainsi : les seize
// missions de la présidence portent la pastille de Lionel ET celle de Cédric.
// `qui` est donc toujours une liste.
//
// LES IDENTIFIANTS SONT CEUX DE L'ORGANIGRAMME (js/organigramme-fch-data.js) :
// « Kepo » y est Thibault Carteron — une seule fiche depuis le 16 septembre —,
// et « Emma » est Emma Liconnet.

const M = (commission, theme, lignes) =>
  lignes.map(([texte, ...qui]) => ({ commission, theme, texte, qui }));

export const MISSIONS_FCH = [
  // --- Présidence (Lionel / Cédric) -----------------------------------------
  ...M('presidence', 'Représenter le club', [
    ["Être l’image du club aux yeux de l’extérieur", 'lionel', 'cedric'],
    ["Se montrer auprès des acteurs du club", 'lionel', 'cedric'],
    ["Porter l’image et les valeurs du club", 'lionel', 'cedric'],
  ]),
  ...M('presidence', 'Assurer le bon fonctionnement du club', [
    ["Anticiper les besoins et accompagner les évolutions", 'lionel', 'cedric'],
    ["S’assurer que chacun connait son rôle", 'cedric', 'lionel'],
    ["Veiller à l’organisation globale (sportive, associative, administrative)", 'lionel', 'cedric'],
  ]),
  ...M('presidence', 'Animer et fédérer', [
    ["Maintenir un climat positif et constructif", 'lionel', 'cedric'],
    ["Valoriser l’engagement des bénévoles", 'lionel', 'cedric'],
    ["Créer une dynamique collective", 'lionel', 'cedric'],
    ["Partager les informations avec l’autre co-président", 'lionel', 'cedric'],
  ]),
  ...M('presidence', 'Définir et porter le projet du club', [
    ["Prendre les décisions stratégiques nécessaires à son développement", 'lionel', 'cedric'],
    ["S’assurer que les actions du club sont alignées avec le projet", 'lionel', 'cedric'],
    ["Donner une vision claire et cohérente", 'lionel', 'cedric'],
  ]),
  ...M('presidence', 'Coordonner et déléguer', [
    ["Donner de l’autonomie tout en assurant un suivi", 'lionel', 'cedric'],
    ["S’appuyer sur les responsables de pôles (sportif, communication, évènements…)", 'lionel', 'cedric'],
    ["Répartir les rôles et responsabilités au sein du club", 'lionel', 'cedric'],
  ]),

  // --- Secrétariat (Benoit) --------------------------------------------------
  ...M('secretariat', 'Gérer l’administratif', [
    ["Assurer le suivi des paiements et documents (en lien avec le trésorier si besoin)", 'benoit'],
    ["Vérifier la conformité des dossiers", 'benoit'],
    ["Suivre les inscriptions et les licences", 'benoit'],
  ]),
  ...M('secretariat', 'Organiser et structurer', [
    ["S’assurer que les informations sont centralisées et organisées", 'benoit'],
    ["Mettre en place un fonctionnement clair et accessible", 'benoit'],
    ["Anticiper les échéances administratives (licences, engagements, réunions…)", 'benoit'],
  ]),
  ...M('secretariat', 'Assurer la communication administrative', [
    ["Gérer les échanges administratifs avec les institutions gouvernementales (mairies, région…)", 'sandy'],
    ["Gérer les échanges administratifs avec les institutions sportives (district, ligue…)", 'benoit'],
    ["Transmettre les informations officielles aux licenciés et familles", 'benoit'],
  ]),
  ...M('secretariat', 'Coordonner et déléguer', [
    ["Travailler en lien avec le trésorier et les responsables de pôles", 'benoit'],
  ]),

  // --- Trésorerie (Rémy) -----------------------------------------------------
  ...M('tresorerie', 'Gérer les finances', [
    ["Assurer les encaissements et paiements", 'remy'],
    ["Tenir une comptabilité claire et à jour", 'remy'],
    ["Gérer les dépenses (matériel, engagements, fonctionnement…)", 'remy'],
    ["Suivre les recettes (licences, évènements, partenariats…)", 'remy'],
  ]),
  ...M('tresorerie', 'Assurer la transparence', [
    ["Participer à la présentation du bilan financier", 'remy'],
    ["Rendre les comptes lisibles et compréhensibles", 'remy'],
    ["Présenter régulièrement la situation financière au bureau/CA", 'remy'],
  ]),
  ...M('tresorerie', 'Travailler en lien avec les autres commissions', [
    ["Avec le responsable partenariats : suivi des apports financiers", 'remy'],
    ["Avec le responsable évènements : gestion des recettes liées aux évènements", 'remy'],
    ["Avec le secrétaire : suivi des inscriptions et paiements", 'remy'],
  ]),
  ...M('tresorerie', 'Anticiper et piloter', [
    ["Alerter en cas de déséquilibre ou de risque", 'remy'],
    ["Participer à l’élaboration du budget", 'remy'],
    ["Prévoir les besoins financiers du club", 'remy'],
    ["Suivre l’évolution de la trésorerie", 'remy'],
  ]),
  ...M('tresorerie', 'Coordonner et déléguer', [
    ["Structurer un fonctionnement simple pour les flux d’argent", 'remy'],
    ["S’appuyer sur d’autres membres pour certaines tâches (buvette, encaissements…)", 'remy'],
  ]),

  // --- Direction sportive (Christophe) ---------------------------------------
  ...M('sportif', 'Définir et faire vivre le projet sportif', [
    ["Soutenir le projet club", 'christophe'],
    ["Adapter le projet aux réalités du terrain", 'christophe'],
    ["Assurer une cohérence entre les catégories", 'christophe'],
    ["Clarifier les objectifs et les principes de jeu du club", 'christophe'],
  ]),
  ...M('sportif', 'Structurer le fonctionnement', [
    ["Faciliter la communication entre éducateurs", 'christophe'],
    ["Adapter l’organisation en fonction des besoins", 'christophe'],
    ["Veiller au respect du fonctionnement du club", 'christophe'],
    ["Mettre en place un cadre clair pour les éducateurs", 'christophe'],
  ]),
  ...M('sportif', 'Accompagner les éducateurs', [
    ["Observer ponctuellement des séances ou matchs", 'christophe'],
    ["Favoriser le partage de pratiques entre éducateurs", 'christophe'],
    ["Aider à la structuration des séances et des cycles", 'christophe'],
    ["Être disponible pour échanger et conseiller", 'christophe'],
  ]),
  ...M('sportif', 'Travailler en lien avec les autres commissions', [
    ["Avec l’évènementiel : partie sportive des manifs", 'christophe'],
    ["Avec la communication : valorisation du sportif", 'christophe'],
    ["Avec le bureau : lien sportif", 'christophe'],
    ["Avec le président : vision et décisions", 'christophe'],
  ]),
  ...M('sportif', 'Coordonner et déléguer', [
    ["Coordonner les inscriptions aux tournois externes de toutes les catégories", 'christophe'],
    ["Impliquer les éducateurs dans le projet", 'christophe'],
    ["Répartir les responsabilités au sein du pôle sportif", 'christophe'],
    ["S’appuyer sur les référents de catégorie", 'christophe'],
  ]),

  // --- Matériel et infrastructures (Hicham) ----------------------------------
  ...M('infrastructures', 'Gérer le matériel', [
    ["Veiller au bon usage du matériel", 'hicham'],
    ["Organiser le renouvellement ou les achats", 'benoit'],
    ["Identifier les besoins ou manques", 'hicham'],
    ["Suivre le matériel du club (ballons, chasubles, équipements…)", 'hicham'],
  ]),
  ...M('infrastructures', 'Anticiper et organiser', [
    ["Être réactif en cas de problème", 'hicham'],
    ["Mettre en place un fonctionnement simple pour le suivi du matériel", 'benoit'],
    ["Prévoir les besoins en fonction de la saison et de l’activité", 'benoit'],
  ]),
  ...M('infrastructures', 'Assurer le bon état des installations', [
    ["Identifier les problèmes ou besoins d’interventions", 'hicham'],
    ["S’assurer de la propreté et du bon état des vestiaires", 'sandy'],
    ["Veiller à l’entretien des terrains", 'hicham'],
  ]),
  ...M('infrastructures', 'Coordonner et déléguer', [
    ["Faire appel aux services concernés (mairie, prestataires si besoin…)", 'sandy'],
    ["Mobiliser des bénévoles ou membres du club si nécessaire", 'hicham'],
    ["S’appuyer sur les éducateurs pour faire remonter les besoins", 'hicham'],
  ]),

  // --- Manifestations (Djamel / Sandrine) ------------------------------------
  ...M('manifestations', 'Concevoir et organiser les évènements', [
    ["Anticiper les aspects logistiques", 'loic'],
    ["Structurer leur organisation (planning, besoins…)", 'sandrine'],
    ["Proposer et planifier les évènements du club (tournois, loto, soirées, stages…)", 'djamel'],
  ]),
  ...M('manifestations', 'Assurer le bon déroulement', [
    ["Garantir un cadre accueillant, convivial et sécurisé", 'lina'],
    ["Veiller à l’organisation globale et à la gestion des imprévus", 'djamel'],
    ["Être présent ou représenté lors des évènements", 'djamel'],
  ]),
  ...M('manifestations', 'Animer la vie du club', [
    ["Contribuer à l’esprit familial du club", 'thibaut'],
    ["Favoriser la participation des licenciés, parents et bénévoles", 'sandy'],
    ["Créer des moments de partage et de cohésion", 'hicham'],
  ]),
  ...M('manifestations', 'Coordonner et déléguer', [
    ["S’assurer que chacun connaît son rôle", 'djamel'],
    ["Mobiliser les ressources nécessaires à chaque évènement", 'emma-liconnet'],
    ["Répartir les rôles entre bénévoles, éducateurs et membres du club", 'sandrine'],
  ]),
  ...M('manifestations', 'Travailler en lien avec les autres commissions', [
    ["Échanger avec les responsables sportifs pour adapter l’organisation", 'thibaut'],
    ["Collaborer avec la communication pour valoriser les évènements", 'sandy'],
  ]),
  ...M('manifestations', 'Respecter le fonctionnement du club', [
    ["Faire des retours après les évènements pour améliorer les suivants", 'emma-liconnet'],
    ["Faire le lien avec l’organisation et les besoins du club", 'lina'],
  ]),

  // --- Buvette (Loïc) --------------------------------------------------------
  ...M('buvette', 'Gérer les approvisionnements', [
    ["Organiser les achats et le réapprovisionnement", 'loic'],
    ["Adapter les commandes selon les évènements ou demandes spécifiques", 'loic'],
    ["Anticiper les besoins en fonction du planning des matchs", 'loic'],
  ]),
  ...M('buvette', 'Veiller à la bonne gestion des produits', [
    ["Vérifier que la buvette est prête à fonctionner les jours de match et évènements", 'loic'],
    ["S’assurer que les stocks sont au bon endroit au bon moment", 'loic'],
    ["Assurer la mise à disposition du matériel", 'loic'],
  ]),
  ...M('buvette', 'Garantir le bon fonctionnement', [
    ["Ajuster le fonctionnement si nécessaire", 'loic'],
    ["Anticiper les périodes à forte activité", 'loic'],
    ["Veiller à une organisation simple et efficace", 'loic'],
  ]),
  ...M('buvette', 'Coordonner et déléguer', [
    ["Transmettre les résultats financier au trésorier", 'hicham'],
    ["Clarifier le fonctionnement (qui fait quoi, quand)", 'loic'],
    ["Aider les éducateurs pour mobiliser les parents", 'sandy'],
  ]),

  // --- Communication (Noé) ---------------------------------------------------
  ...M('communication', 'Définir et structurer la communication', [
    ["Assurer une cohérence visuelle et rédactionnelle", 'noe'],
    ["Organiser la communication sur la saison (planning, priorités)", 'noe'],
    ["Mettre en place une ligne éditoriale cohérente avec le projet du club", 'noe'],
  ]),
  ...M('communication', 'Animer la vie du club', [
    ["Participer à la création d’une dynamique collective autour du club", 'lina'],
    ["Valoriser les initiatives internes", 'lina'],
    ["Relayer les évènements et actions du club", 'lina'],
  ]),
  ...M('communication', 'Produire et diffuser les contenus', [
    ["Créer des contenus (visuels, photos, vidéos, textes)", 'noe'],
    ["Mettre en valeur les équipes, joueurs, éducateurs et bénévoles", 'noe'],
    ["Publier les programmations, résultats, évènements", 'noe'],
    ["Gérer les réseaux sociaux du club", 'noe'],
  ]),
  ...M('communication', 'Assurer le lien interne et externe', [
    ["Valoriser les partenaires et relations extérieures", 'lina'],
    ["Veiller à la bonne diffusion des informations auprès des licenciés et des parents", 'lina'],
    ["Faciliter la circulation de l’information entre les acteurs du club", 'lina'],
  ]),
  ...M('communication', 'Coordonner et déléguer', [
    ["Structurer un fonctionnement simple et efficace", 'noe'],
    ["Impliquer d’autres bénévoles ou jeunes du club", 'noe'],
    ["Répartir les tâches (photo, vidéo, rédaction…)", 'noe'],
    ["S’appuyer sur les éducateurs pour la remontée d’informations (résultats, photos…)", 'noe'],
  ]),

  // --- Partenaires (Lorenzo) -------------------------------------------------
  ...M('partenaires', 'Développer des partenariats', [
    ["Proposer des formes de partenariats simples et adaptées", 'lina'],
    ["Présenter le club, son projet et ses valeurs", 'lina'],
    ["Identifier et contacter des entreprises locales", 'lina'],
  ]),
  ...M('partenaires', 'Fidéliser les partenaires', [
    ["Proposer des moments de rencontre (matchs, évènements…)", 'sandy'],
    ["Donner des nouvelles du club", 'sandy'],
    ["Maintenir un contact régulier", 'sandy'],
  ]),
  ...M('partenaires', 'Structurer et organiser', [
    ["Avoir un fonctionnement simple et clair", 'emma-liconnet'],
    ["Anticiper les périodes clés (début de saison, renouvellement…)", 'lionel'],
    ["Suivre les partenaires (contacts, engagements, renouvellements)", 'emma-liconnet'],
  ]),
  ...M('partenaires', 'Coordonner et déléguer', [
    ["Mobiliser le président ou d’autres membres du club pour accompagner certaines démarches", 'lorenzo'],
    ["Travailler en lien avec le responsable communication pour la valorisation", 'lorenzo'],
    ["Impliquer les membres du club dans la recherche et le développement de contacts", 'lorenzo'],
  ]),
  ...M('partenaires', 'Valoriser les partenaires', [
    ["Contribuer à leur visibilité dans la vie du club", 'noe'],
    ["Veiller au respect des engagements pris", 'lina'],
    ["S’assurer qu’ils sont mis en avant (réseaux, terrain, évènements…)", 'lina'],
  ]),
];

// LE CADRE, EN TÊTE DU DOCUMENT (p. 1). Il explique ce que cette répartition
// EST — et surtout ce qu'elle n'est pas —, et c'est la moitié la plus
// importante : une liste de missions sans son cadre se lit comme une liste de
// comptes à rendre. Elle ouvre donc le récapitulatif, mot pour mot.
export const CADRE_MISSIONS = [
  "Cette répartition des responsabilités est un cadre d’aide.",
  "Elle permet d’avoir une vision claire des missions à remplir dans chaque commission, de mieux répartir la charge mentale et d’éviter que tout repose sur les mêmes personnes.",
  "L’objectif n’est pas de rajouter de la pression, mais de permettre à chacun de savoir où il peut contribuer, à qui se référer et comment faire avancer les sujets.",
  "Être responsable d’une mission ne signifie pas devoir tout faire seul. Cela signifie veiller à ce que le sujet avance : en réalisant l’action, en la déléguant, en sollicitant de l’aide ou en la mettant en discussion si besoin.",
  "Ce cadre reste évolutif et pourra être adapté selon les besoins du club et les disponibilités de chacun.",
];

// LES DEUX LECTURES, et elles ne font que GROUPER la même liste — c'est ce qui
// garantit qu'une mission corrigée bouge des deux côtés à la fois.
//
// L'ORDRE DES THÈMES EST CELUI DU DOCUMENT, jamais l'alphabet : « Coordonner et
// déléguer » y ferme toujours la marche, et c'est vrai des neuf commissions.
// Une `Map` retient l'ordre de première rencontre, qui est celui de la liste.
export function missionsParTheme(missions) {
  const themes = new Map();
  for (const mission of missions) {
    if (!themes.has(mission.theme)) themes.set(mission.theme, []);
    themes.get(mission.theme).push(mission);
  }
  return [...themes].map(([theme, lignes]) => ({ theme, missions: lignes }));
}

// UN PÔLE PEUT RASSEMBLER PLUSIEURS COMMISSIONS (20 septembre 2026, demande de
// Noé : « les tâches de la présidence et de l'administration doivent être dans
// organisation du club »).
//
// CE QUE ÇA RÈGLE. La présidence, le secrétariat et la trésorerie portent
// quarante-deux des cent trente-cinq missions et n'ont PAS de page à eux : le
// projet du club les écarte de ses domaines — *« ce sont des fonctions, pas des
// domaines »*. Elles n'avaient donc qu'un repli dans l'onglet du bureau, ce qui
// n'est pas une page. « Organisation du club » EST leur pôle, et c'est Noé qui
// le dit.
//
// LA TABLE EST ÉCRITE, et ne se déduit de rien : aucun nom ne rapproche
// « organisation » de « présidence », et c'est tant mieux — un rapprochement
// deviné se serait trompé le jour où une commission naît.
export const COMMISSIONS_DU_POLE = {
  organisation: ['presidence', 'secretariat', 'tresorerie'],
};

// CE QU'UN PÔLE PORTE, en respectant l'ordre de la table. Un pôle ordinaire n'a
// que sa commission homonyme ; « organisation » en a trois.
export const commissionsDuPole = (id) => COMMISSIONS_DU_POLE[id] ?? [id];

export const missionsDeLaCommission = (id) =>
  MISSIONS_FCH.filter((mission) => mission.commission === id);

export const missionsDeLaPersonne = (id) =>
  MISSIONS_FCH.filter((mission) => mission.qui.includes(id));
