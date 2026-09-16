// Sources : Responsabilités FCH.pdf p. 1–3 et organigrammes 2026–2027.
// Emma = Emma Liconnet : confirmé par Noé le 16 septembre 2026.
// Kepo = Thibault Carteron : une seule fiche, celle de Thibault (Noé, 16 septembre 2026).
// Portraits : exports individuels du club, un fichier par personne. Le cadre
// est la pastille ronde du portrait, la bande du nom restant hors champ.
export const PERSONNES = {
  "lionel": {
    "id": "lionel",
    "nom": "Lionel Brouty",
    "missions": {
      "presidence": [
        "Porter l’image et les valeurs du club et le représenter à l’extérieur.",
        "Donner une vision claire, aligner les actions sur le projet et prendre les décisions stratégiques.",
        "Veiller à l’organisation sportive, associative et administrative ; anticiper les besoins.",
        "Clarifier les rôles, répartir les responsabilités et s’appuyer sur les responsables de pôles.",
        "Partager les informations entre coprésidents, donner de l’autonomie et assurer le suivi.",
        "Créer une dynamique collective, valoriser les bénévoles et maintenir un climat constructif."
      ],
      "partenaires": [
        "Anticiper les périodes clés des partenariats : début de saison et renouvellements."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/lionel.png",
      "largeur": 128,
      "hauteur": 191,
      "cadre": [
        -9,
        -5,
        146,
        146
      ]
    }
  },
  "cedric": {
    "id": "cedric",
    "nom": "Cédric Sanchez",
    "missions": {
      "presidence": [
        "Porter l’image et les valeurs du club et le représenter à l’extérieur.",
        "Donner une vision claire, aligner les actions sur le projet et prendre les décisions stratégiques.",
        "Veiller à l’organisation sportive, associative et administrative ; anticiper les besoins.",
        "Clarifier les rôles, répartir les responsabilités et s’appuyer sur les responsables de pôles.",
        "Partager les informations entre coprésidents, donner de l’autonomie et assurer le suivi.",
        "Créer une dynamique collective, valoriser les bénévoles et maintenir un climat constructif."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/cedric.png",
      "largeur": 128,
      "hauteur": 196,
      "cadre": [
        -9,
        -1,
        146,
        146
      ]
    }
  },
  "remy": {
    "id": "remy",
    "nom": "Rémy Terpan",
    "missions": {
      "tresorerie": [
        "Tenir une comptabilité claire et à jour ; assurer encaissements et paiements.",
        "Gérer les dépenses et suivre les recettes : licences, événements et partenariats.",
        "Présenter régulièrement la situation financière au bureau et au CA ; rendre les comptes lisibles et participer au bilan financier.",
        "Suivre la trésorerie, prévoir les besoins et participer au budget ; alerter en cas de déséquilibre.",
        "Suivre les apports financiers avec les partenaires, les recettes avec les manifestations et les paiements avec le secrétariat.",
        "Structurer les flux d’argent et s’appuyer sur les autres membres pour les encaissements."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/remy.png",
      "largeur": 129,
      "hauteur": 195,
      "cadre": [
        -10,
        -6,
        149,
        149
      ]
    }
  },
  "benoit": {
    "id": "benoit",
    "nom": "Benoit Carteron",
    "missions": {
      "secretariat": [
        "Suivre les inscriptions et les licences ; vérifier la conformité des dossiers.",
        "Assurer le suivi des paiements et documents avec le trésorier si besoin.",
        "Centraliser et organiser les informations dans un fonctionnement clair et accessible.",
        "Anticiper les échéances administratives : licences, engagements et réunions.",
        "Gérer les échanges avec les institutions sportives et transmettre les informations officielles aux licenciés et familles.",
        "Travailler en lien avec le trésorier et les responsables de pôles."
      ],
      "infrastructures": [
        "Mettre en place un fonctionnement simple pour le suivi du matériel.",
        "Prévoir les besoins selon la saison et l’activité ; organiser le renouvellement et les achats."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/benoit.png",
      "largeur": 140,
      "hauteur": 197,
      "cadre": [
        -4,
        -5,
        149,
        149
      ]
    }
  },
  "noe": {
    "id": "noe",
    "nom": "Noé Delahaye",
    "missions": {
      "communication": [
        "Animer une dynamique collective ; accompagner et soutenir l’équipe.",
        "Clarifier et faire vivre le cadre ; suivre, ajuster et faire avancer les sujets.",
        "Mettre en place la ligne éditoriale et organiser la communication sur la saison.",
        "Assurer une cohérence visuelle et rédactionnelle.",
        "Créer les visuels, photos, vidéos et textes ; gérer les réseaux sociaux.",
        "Publier les programmations, résultats et événements ; mettre en valeur équipes, joueurs, éducateurs et bénévoles.",
        "Répartir les tâches de photo, vidéo et rédaction ; impliquer les bénévoles et les jeunes.",
        "S’appuyer sur les éducateurs pour les remontées d’informations et structurer un fonctionnement simple."
      ],
      "partenaires": [
        "Contribuer à la visibilité des partenaires dans la vie du club."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/noe.png",
      "largeur": 129,
      "hauteur": 207,
      "cadre": [
        -10,
        -8,
        149,
        149
      ]
    }
  },
  "djamel": {
    "id": "djamel",
    "nom": "Djamel Bentahar",
    "missions": {
      "manifestations": [
        "Animer une dynamique collective ; accompagner et soutenir l’équipe.",
        "Clarifier et faire vivre le cadre ; suivre, ajuster et faire avancer les sujets.",
        "S’assurer que chacun connaît son rôle.",
        "Proposer et planifier les événements : tournois, loto, soirées et stages.",
        "Être présent ou représenté lors des événements ; veiller à l’organisation et gérer les imprévus."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/djamel.png",
      "largeur": 141,
      "hauteur": 211,
      "cadre": [
        -4,
        -7,
        149,
        149
      ]
    }
  },
  "hicham": {
    "id": "hicham",
    "nom": "Hicham Amine",
    "missions": {
      "infrastructures": [
        "Animer une dynamique collective ; accompagner et soutenir l’équipe.",
        "Clarifier et faire vivre le cadre ; suivre, ajuster et faire avancer les sujets.",
        "Suivre le matériel du club et veiller à son bon usage ; identifier les besoins ou manques.",
        "Mobiliser bénévoles et membres du club ; s’appuyer sur les éducateurs pour faire remonter les besoins.",
        "Être réactif en cas de problème ; identifier les interventions nécessaires.",
        "Veiller à l’entretien des terrains."
      ],
      "manifestations": [
        "Créer des moments de partage et de cohésion."
      ],
      "buvette": [
        "Transmettre les résultats financiers au trésorier."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/hicham.png",
      "largeur": 133,
      "hauteur": 207,
      "cadre": [
        -10,
        -6,
        149,
        149
      ]
    }
  },
  "sandrine": {
    "id": "sandrine",
    "nom": "Sandrine Riffard",
    "missions": {
      "manifestations": [
        "Animer une dynamique collective ; accompagner et soutenir l’équipe.",
        "Clarifier et faire vivre le cadre ; suivre, ajuster et faire avancer les sujets.",
        "Répartir les rôles entre bénévoles, éducateurs et membres du club.",
        "Structurer l’organisation des événements : planning et besoins."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/sandrine.png",
      "largeur": 138,
      "hauteur": 208,
      "cadre": [
        -3,
        -5,
        149,
        149
      ]
    }
  },
  "lina": {
    "id": "lina",
    "nom": "Lina Amine",
    "missions": {
      "communication": [
        "Participer à une dynamique collective, valoriser les initiatives et relayer les événements.",
        "Faciliter la circulation de l’information entre les acteurs du club et auprès des licenciés et parents.",
        "Valoriser les partenaires et relations extérieures."
      ],
      "partenaires": [
        "Identifier et contacter les entreprises locales ; présenter le club, son projet et ses valeurs.",
        "Proposer des partenariats simples et adaptés.",
        "Veiller au respect des engagements et à la mise en avant des partenaires."
      ],
      "manifestations": [
        "Faire le lien avec l’organisation et les besoins du club.",
        "Garantir un cadre accueillant, convivial et sécurisé."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/lina.png",
      "largeur": 100,
      "hauteur": 131,
      "cadre": [
        -8,
        -7,
        116,
        116
      ]
    }
  },
  "sandy": {
    "id": "sandy",
    "nom": "Sandy Bonnot",
    "missions": {
      "secretariat": [
        "Gérer les échanges administratifs avec les institutions gouvernementales : mairies et région."
      ],
      "infrastructures": [
        "Faire appel aux services concernés : mairie ou prestataires.",
        "S’assurer de la propreté et du bon état des vestiaires."
      ],
      "buvette": [
        "Aider les éducateurs à mobiliser les parents."
      ],
      "manifestations": [
        "Favoriser la participation des licenciés, parents et bénévoles.",
        "Collaborer avec la communication pour valoriser les événements."
      ],
      "partenaires": [
        "Maintenir un contact régulier et donner des nouvelles du club.",
        "Proposer des moments de rencontre lors des matchs et événements."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/sandy.png",
      "largeur": 129,
      "hauteur": 192,
      "cadre": [
        -10,
        -6,
        149,
        149
      ]
    }
  },
  "loic": {
    "id": "loic",
    "nom": "Loïc Coste",
    "missions": {
      "buvette": [
        "Animer une dynamique collective ; accompagner et soutenir l’équipe.",
        "Clarifier et faire vivre le cadre ; suivre, ajuster et faire avancer les sujets.",
        "Organiser les achats et le réapprovisionnement ; veiller au stockage des produits.",
        "Anticiper les besoins selon les matchs et adapter les commandes aux événements.",
        "Clarifier qui fait quoi et quand ; vérifier que la buvette est prête pour les matchs et événements.",
        "S’assurer que les stocks sont au bon endroit au bon moment.",
        "Anticiper les périodes de forte activité, ajuster le fonctionnement et veiller à une organisation simple."
      ],
      "manifestations": [
        "Anticiper les aspects logistiques des événements."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/loic.png",
      "largeur": 149,
      "hauteur": 206,
      "cadre": [
        12,
        -5,
        146,
        146
      ]
    }
  },
  "lorenzo": {
    "id": "lorenzo",
    "nom": "Lorenzo Seignobosc",
    "missions": {
      "partenaires": [
        "Animer une dynamique collective ; accompagner et soutenir l’équipe.",
        "Clarifier et faire vivre le cadre ; suivre, ajuster et faire avancer les sujets.",
        "Mobiliser le président ou d’autres membres pour accompagner les démarches.",
        "Travailler avec le responsable communication pour la valorisation des partenaires.",
        "Impliquer les membres dans la recherche et le développement de contacts."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/lorenzo.png",
      "largeur": 170,
      "hauteur": 205,
      "cadre": [
        11,
        -3,
        145,
        145
      ]
    }
  },
  "christophe": {
    "id": "christophe",
    "nom": "Christophe Lucchetta",
    "missions": {
      "sportif": [
        "Soutenir le projet du club, clarifier les objectifs et principes de jeu et les adapter au terrain.",
        "Assurer une cohérence entre les catégories.",
        "Mettre en place un cadre clair pour les éducateurs, faciliter leurs échanges et adapter l’organisation aux besoins.",
        "Observer ponctuellement séances et matchs ; aider à structurer les séances et cycles.",
        "Favoriser le partage de pratiques et être disponible pour conseiller les éducateurs.",
        "Faire le lien avec les manifestations, la communication, le bureau et les présidents.",
        "Coordonner les inscriptions aux tournois externes de toutes les catégories.",
        "Répartir les responsabilités sportives, impliquer les éducateurs et s’appuyer sur les référents de catégorie."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/christophe.png",
      "largeur": 179,
      "hauteur": 176,
      "cadre": [
        15,
        -4,
        149,
        149
      ]
    }
  },
  "aurelien": {
    "id": "aurelien",
    "nom": "Aurélien Bourre",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/aurelien.png",
      "largeur": 171,
      "hauteur": 198,
      "cadre": [
        20,
        -1,
        125,
        125
      ]
    }
  },
  "philippe": {
    "id": "philippe",
    "nom": "Philippe Cancellier",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/philippe.png",
      "largeur": 158,
      "hauteur": 178,
      "cadre": [
        6,
        -4,
        146,
        146
      ]
    }
  },
  "alexandre": {
    "id": "alexandre",
    "nom": "Alexandre Caso",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/alexandre.png",
      "largeur": 129,
      "hauteur": 172,
      "cadre": [
        -5,
        -7,
        143,
        143
      ]
    }
  },
  "jules": {
    "id": "jules",
    "nom": "Jules Maisonneuve",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/jules.png",
      "largeur": 156,
      "hauteur": 175,
      "cadre": [
        5,
        -5,
        145,
        145
      ]
    }
  },
  "elliot": {
    "id": "elliot",
    "nom": "Elliot Chardon",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/elliot.png",
      "largeur": 126,
      "hauteur": 187,
      "cadre": [
        -9,
        2,
        144,
        144
      ]
    }
  },
  "julien": {
    "id": "julien",
    "nom": "Julien Fontaine",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/julien.png",
      "largeur": 126,
      "hauteur": 169,
      "cadre": [
        -9,
        -6,
        144,
        144
      ]
    }
  },
  "stephane-c": {
    "id": "stephane-c",
    "nom": "Stéphane Coissard",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/stephane-c.png",
      "largeur": 159,
      "hauteur": 174,
      "cadre": [
        6,
        -1,
        145,
        145
      ]
    }
  },
  "cyril": {
    "id": "cyril",
    "nom": "Cyril Bonnot",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/cyril.png",
      "largeur": 127,
      "hauteur": 176,
      "cadre": [
        -9,
        -6,
        145,
        145
      ]
    }
  },
  "gregory-m": {
    "id": "gregory-m",
    "nom": "Grégory Mellarin",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/gregory-m.png",
      "largeur": 140,
      "hauteur": 180,
      "cadre": [
        -2,
        -3,
        145,
        145
      ]
    }
  },
  "stephane-f": {
    "id": "stephane-f",
    "nom": "Stéphane Fetter",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/stephane-f.png",
      "largeur": 132,
      "hauteur": 174,
      "cadre": [
        -7,
        -5,
        145,
        145
      ]
    }
  },
  "lilian": {
    "id": "lilian",
    "nom": "Lilian Charre",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/lilian.png",
      "largeur": 126,
      "hauteur": 177,
      "cadre": [
        -9,
        -2,
        144,
        144
      ]
    }
  },
  "nordine": {
    "id": "nordine",
    "nom": "Nordine Guerrouche",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/nordine.png",
      "largeur": 171,
      "hauteur": 176,
      "cadre": [
        7,
        -4,
        145,
        145
      ]
    }
  },
  "mahe": {
    "id": "mahe",
    "nom": "Mahé Ranc",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/mahe.png",
      "largeur": 126,
      "hauteur": 175,
      "cadre": [
        -9,
        -5,
        144,
        144
      ]
    }
  },
  "robin": {
    "id": "robin",
    "nom": "Robin Guinet",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/robin.png",
      "largeur": 127,
      "hauteur": 177,
      "cadre": [
        -9,
        -6,
        145,
        145
      ]
    }
  },
  "emma-liconnet": {
    "id": "emma-liconnet",
    "nom": "Emma Liconnet",
    "missions": {
      "partenaires": [
        "Avoir un fonctionnement simple et clair.",
        "Suivre les contacts, engagements et renouvellements des partenaires."
      ],
      "manifestations": [
        "Mobiliser les ressources nécessaires à chaque événement.",
        "Faire des retours après les événements pour améliorer les suivants."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/emma-liconnet.png",
      "largeur": 102,
      "hauteur": 135,
      "cadre": [
        -7,
        -6,
        116,
        116
      ]
    }
  },
  "alyssa": {
    "id": "alyssa",
    "nom": "Alyssa Naviel",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/alyssa.png",
      "largeur": 124,
      "hauteur": 178,
      "cadre": [
        -9,
        -4,
        142,
        142
      ]
    }
  },
  "leo": {
    "id": "leo",
    "nom": "Léo Granjon",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/leo.png",
      "largeur": 124,
      "hauteur": 176,
      "cadre": [
        -9,
        -4,
        142,
        142
      ]
    }
  },
  "melvin": {
    "id": "melvin",
    "nom": "Melvin Rothenmund",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/melvin.png",
      "largeur": 160,
      "hauteur": 176,
      "cadre": [
        9,
        -2,
        142,
        142
      ]
    }
  },
  "tom": {
    "id": "tom",
    "nom": "Tom Heriaud",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/tom.png",
      "largeur": 124,
      "hauteur": 174,
      "cadre": [
        -9,
        -5,
        142,
        142
      ]
    }
  },
  "antoine": {
    "id": "antoine",
    "nom": "Antoine Barral",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/antoine.png",
      "largeur": 124,
      "hauteur": 180,
      "cadre": [
        -9,
        -6,
        142,
        142
      ]
    }
  },
  "gregory-b": {
    "id": "gregory-b",
    "nom": "Gregory Balayn",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/gregory-b.png",
      "largeur": 125,
      "hauteur": 184,
      "cadre": [
        -8,
        -6,
        142,
        142
      ]
    }
  },
  "hubert": {
    "id": "hubert",
    "nom": "Hubert Poinot",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/hubert.png",
      "largeur": 126,
      "hauteur": 170,
      "cadre": [
        -9,
        -5,
        144,
        144
      ]
    }
  },
  "mounir": {
    "id": "mounir",
    "nom": "Mounir Ayach",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/mounir.png",
      "largeur": 128,
      "hauteur": 175,
      "cadre": [
        -9,
        -5,
        146,
        146
      ]
    }
  },
  "quentin": {
    "id": "quentin",
    "nom": "Quentin Sottet",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/quentin.png",
      "largeur": 124,
      "hauteur": 178,
      "cadre": [
        -9,
        -6,
        142,
        142
      ]
    }
  },
  "chadi": {
    "id": "chadi",
    "nom": "Chadi Stiti",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/chadi.png",
      "largeur": 124,
      "hauteur": 180,
      "cadre": [
        -9,
        -6,
        142,
        142
      ]
    }
  },
  "axel": {
    "id": "axel",
    "nom": "Axel Bravais",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/axel.png",
      "largeur": 124,
      "hauteur": 183,
      "cadre": [
        -9,
        -4,
        142,
        142
      ]
    }
  },
  "anais": {
    "id": "anais",
    "nom": "Anaïs Chardon",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/anais.png",
      "largeur": 125,
      "hauteur": 184,
      "cadre": [
        -9,
        -5,
        142,
        142
      ]
    }
  },
  "jean-christophe": {
    "id": "jean-christophe",
    "nom": "Jean-Christophe Fabre",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/jean-christophe.png",
      "largeur": 181,
      "hauteur": 191,
      "cadre": [
        20,
        -4,
        142,
        142
      ]
    }
  },
  "clement": {
    "id": "clement",
    "nom": "Clément Revillard",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/clement.png",
      "largeur": 133,
      "hauteur": 148,
      "cadre": [
        4,
        -5,
        125,
        125
      ]
    }
  },
  "florian": {
    "id": "florian",
    "nom": "Florian Royol",
    "missions": {},
    "photo": {
      "src": "img/organigramme/portraits/florian.png",
      "largeur": 100,
      "hauteur": 134,
      "cadre": [
        -8,
        -4,
        116,
        116
      ]
    }
  },
  "thibaut": {
    "id": "thibaut",
    "nom": "Thibault Carteron",
    "missions": {
      "manifestations": [
        "Contribuer à l’esprit familial du club.",
        "Échanger avec les responsables sportifs pour adapter l’organisation."
      ]
    },
    "photo": {
      "src": "img/organigramme/portraits/thibaut.png",
      "largeur": 119,
      "hauteur": 140,
      "cadre": [
        2,
        1,
        113,
        113
      ]
    }
  }
};
export const GROUPES = [
  {
    "id": "presidence",
    "nom": "Présidence",
    "couleur": "#e52330",
    "membres": [
      "lionel",
      "cedric"
    ],
    "responsables": [
      "lionel",
      "cedric"
    ],
    "type": "bureau",
    "aide": ""
  },
  {
    "id": "secretariat",
    "nom": "Secrétariat",
    "couleur": "#639273",
    "membres": [
      "benoit",
      "sandy"
    ],
    "responsables": [
      "benoit"
    ],
    "type": "bureau",
    "aide": "Licences, inscriptions et démarches administratives"
  },
  {
    "id": "tresorerie",
    "nom": "Trésorerie",
    "couleur": "#b47b58",
    "membres": [
      "remy"
    ],
    "responsables": [
      "remy"
    ],
    "type": "bureau",
    "aide": "Paiements, recettes et budget"
  },
  {
    "id": "sportif",
    "nom": "Direction sportive",
    "couleur": "#dfba18",
    "membres": [
      "christophe"
    ],
    "responsables": [
      "christophe"
    ],
    "type": "bureau",
    "aide": "Projet sportif et accompagnement des éducateurs"
  },
  {
    "id": "communication",
    "nom": "Communication",
    "couleur": "#9580d5",
    "membres": [
      "noe",
      "lina"
    ],
    "responsables": [
      "noe"
    ],
    "type": "commissions",
    "aide": "Photos, réseaux sociaux et informations du club"
  },
  {
    "id": "partenaires",
    "nom": "Partenaires",
    "couleur": "#548fce",
    "membres": [
      "lorenzo",
      "lionel",
      "noe",
      "lina",
      "sandy",
      "emma-liconnet"
    ],
    "responsables": [
      "lorenzo"
    ],
    "type": "commissions",
    "aide": "Contacts, engagements et visibilité des partenaires"
  },
  {
    "id": "manifestations",
    "nom": "Manifestations",
    "couleur": "#d59f55",
    "membres": [
      "djamel",
      "sandrine",
      "hicham",
      "lina",
      "sandy",
      "emma-liconnet",
      "loic",
      "thibaut"
    ],
    "responsables": [
      "djamel",
      "sandrine"
    ],
    "type": "commissions",
    "aide": "Événements, organisation et bénévoles"
  },
  {
    "id": "infrastructures",
    "nom": "Matériel et infrastructures",
    "couleur": "#cf8c4d",
    "membres": [
      "hicham",
      "benoit",
      "sandy",
      "florian"
    ],
    "responsables": [
      "hicham"
    ],
    "type": "commissions",
    "aide": "Matériel, terrains et vestiaires"
  },
  {
    "id": "buvette",
    "nom": "Buvette",
    "couleur": "#b78b5e",
    "membres": [
      "loic",
      "hicham",
      "sandy"
    ],
    "responsables": [
      "loic"
    ],
    "type": "commissions",
    "aide": "Approvisionnement, ouverture et fonctionnement"
  },
  {
    "id": "ecole",
    "nom": "Pôle école de foot",
    "couleur": "#5483e5",
    "membres": [
      "aurelien"
    ],
    "responsables": [
      "aurelien"
    ],
    "type": "sportif",
    "aide": "Référent U7–U9"
  },
  {
    "id": "preformation",
    "nom": "Pôle préformation",
    "couleur": "#ed414b",
    "membres": [
      "philippe"
    ],
    "responsables": [
      "philippe"
    ],
    "type": "sportif",
    "aide": "Référent U11–U13"
  },
  {
    "id": "formation",
    "nom": "Pôle formation",
    "couleur": "#d8b200",
    "membres": [
      "alexandre"
    ],
    "responsables": [
      "alexandre"
    ],
    "type": "sportif",
    "aide": "Référent U15–U17–U20"
  },
  {
    "id": "u7",
    "nom": "U7",
    "couleur": "#49699f",
    "membres": [
      "jules",
      "elliot"
    ],
    "responsables": [
      "jules"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "u9",
    "nom": "U9",
    "couleur": "#5483e5",
    "membres": [
      "aurelien",
      "julien",
      "stephane-c"
    ],
    "responsables": [
      "aurelien"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "u11",
    "nom": "U11",
    "couleur": "#b73940",
    "membres": [
      "philippe",
      "cyril",
      "gregory-m",
      "stephane-f",
      "lilian"
    ],
    "responsables": [
      "philippe"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "u13",
    "nom": "U13",
    "couleur": "#ed414b",
    "membres": [
      "nordine",
      "mahe",
      "robin",
      "christophe"
    ],
    "responsables": [
      "nordine"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "u15",
    "nom": "U15 · Entente FCH–COC",
    "couleur": "#a78d08",
    "membres": [
      "lionel",
      "emma-liconnet",
      "alyssa",
      "leo",
      "melvin"
    ],
    "responsables": [
      "lionel"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "u17",
    "nom": "U17 · Entente FCH–COC",
    "couleur": "#a78d08",
    "membres": [
      "tom",
      "antoine",
      "gregory-b"
    ],
    "responsables": [
      "tom"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "u20",
    "nom": "U20 · Entente FCH–COC",
    "couleur": "#d8b200",
    "membres": [
      "hubert",
      "alexandre"
    ],
    "responsables": [
      "hubert",
      "alexandre"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "seniors",
    "nom": "Séniors",
    "couleur": "#e9c000",
    "membres": [
      "benoit",
      "mounir",
      "quentin",
      "chadi",
      "axel"
    ],
    "responsables": [
      "benoit"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "mams",
    "nom": "Mam’s",
    "couleur": "#d60070",
    "membres": [
      "anais",
      "cedric"
    ],
    "responsables": [
      "anais",
      "cedric"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "veterans",
    "nom": "Vétérans",
    "couleur": "#a78d08",
    "membres": [
      "remy",
      "jean-christophe"
    ],
    "responsables": [
      "remy",
      "jean-christophe"
    ],
    "type": "sportif",
    "aide": ""
  },
  {
    "id": "gardiens",
    "nom": "Entraîneurs des gardiens",
    "couleur": "#7890b2",
    "membres": [
      "clement",
      "aurelien"
    ],
    "responsables": [],
    "type": "sportif",
    "aide": ""
  }
];
