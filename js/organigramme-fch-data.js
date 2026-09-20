// Sources : Responsabilités FCH.pdf p. 1–3 et organigrammes 2026–2027.
// Emma = Emma Liconnet : confirmé par Noé le 16 septembre 2026.
// Kepo = Thibault Carteron : une seule fiche, celle de Thibault (Noé, 16 septembre 2026).
// Portraits : exports individuels du club, un fichier par personne. Le cadre
// est la pastille ronde du portrait, la bande du nom restant hors champ.
// LES MISSIONS NE SONT PLUS ÉCRITES ICI (20 septembre 2026, demande de Noé :
// « un récap des responsabilités et missions comme dans le document, joint aux
// missions de chacun — si l'un change ça change sur l'autre page »).
//
// Elles vivent dans js/missions-fch.js, en UNE liste plate que deux écrans
// groupent différemment : la page d'une personne par commission, la page d'une
// commission par thème. **Recopiées des deux côtés, elles auraient fini par ne
// plus dire la même chose** — et on n'aurait pas su laquelle croire.
//
// `missions` RESTE SUR LA FICHE, dérivé au chargement : la recherche et le
// contrôle le lisent, et une seconde forme à tenir à jour n'apporterait rien.
import { MISSIONS_FCH } from './missions-fch.js';

const FICHES = {
  "lionel": {
    "id": "lionel",
    "nom": "Lionel Brouty",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/lionel.png",
        "largeur": 99,
        "hauteur": 137,
        "cadre": [
          -7,
          -7,
          113,
          113
        ]
      },
      "sportif": {
        "src": "img/organigramme/portraits/sportif/lionel.png",
        "largeur": 126,
        "hauteur": 170,
        "cadre": [
          -8,
          -9,
          141,
          141
        ]
      }
    }
  },
  "cedric": {
    "id": "cedric",
    "nom": "Cédric Sanchez",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/cedric.png",
        "largeur": 126,
        "hauteur": 187,
        "cadre": [
          -8,
          -7,
          141,
          141
        ]
      }
    }
  },
  "remy": {
    "id": "remy",
    "nom": "Rémy Terpan",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/remy.png",
        "largeur": 124,
        "hauteur": 191,
        "cadre": [
          -9,
          -8,
          141,
          141
        ]
      }
    }
  },
  "benoit": {
    "id": "benoit",
    "nom": "Benoit Carteron",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/benoit.png",
        "largeur": 108,
        "hauteur": 139,
        "cadre": [
          -2,
          -7,
          114,
          114
        ]
      },
      "sportif": {
        "src": "img/organigramme/portraits/sportif/benoit.png",
        "largeur": 139,
        "hauteur": 178,
        "cadre": [
          -2,
          -9,
          144,
          144
        ]
      }
    }
  },
  "noe": {
    "id": "noe",
    "nom": "Noé Delahaye",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/noe.png",
        "largeur": 100,
        "hauteur": 137,
        "cadre": [
          -6,
          -6,
          112,
          112
        ]
      }
    }
  },
  "djamel": {
    "id": "djamel",
    "nom": "Djamel Bentahar",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/djamel.png",
        "largeur": 108,
        "hauteur": 142,
        "cadre": [
          -3,
          -7,
          113,
          113
        ]
      }
    }
  },
  "hicham": {
    "id": "hicham",
    "nom": "Hicham Amine",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/hicham.png",
        "largeur": 99,
        "hauteur": 136,
        "cadre": [
          -7,
          -6,
          113,
          113
        ]
      }
    }
  },
  "sandrine": {
    "id": "sandrine",
    "nom": "Sandrine Riffard",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/sandrine.png",
        "largeur": 106,
        "hauteur": 131,
        "cadre": [
          -4,
          -7,
          113,
          113
        ]
      }
    }
  },
  "lina": {
    "id": "lina",
    "nom": "Lina Amine",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/lina.png",
        "largeur": 100,
        "hauteur": 131,
        "cadre": [
          -6,
          -7,
          112,
          112
        ]
      }
    }
  },
  "sandy": {
    "id": "sandy",
    "nom": "Sandy Bonnot",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/sandy.png",
        "largeur": 100,
        "hauteur": 137,
        "cadre": [
          -5,
          -7,
          112,
          112
        ]
      }
    }
  },
  "loic": {
    "id": "loic",
    "nom": "Loïc Coste",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/loic.png",
        "largeur": 99,
        "hauteur": 135,
        "cadre": [
          -7,
          -7,
          113,
          113
        ]
      }
    }
  },
  "lorenzo": {
    "id": "lorenzo",
    "nom": "Lorenzo Seignobosc",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/lorenzo.png",
        "largeur": 132,
        "hauteur": 135,
        "cadre": [
          9,
          -7,
          112,
          112
        ]
      }
    }
  },
  "christophe": {
    "id": "christophe",
    "nom": "Christophe Lucchetta",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/christophe.png",
        "largeur": 138,
        "hauteur": 137,
        "cadre": [
          13,
          -7,
          113,
          113
        ]
      },
      "sportif": {
        "src": "img/organigramme/portraits/sportif/christophe.png",
        "largeur": 178,
        "hauteur": 294,
        "cadre": [
          19,
          -9,
          142,
          142
        ]
      }
    }
  },
  "aurelien": {
    "id": "aurelien",
    "nom": "Aurélien Bourre",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/aurelien.png",
        "largeur": 171,
        "hauteur": 198,
        "cadre": [
          20,
          -8,
          124,
          124
        ]
      }
    }
  },
  "philippe": {
    "id": "philippe",
    "nom": "Philippe Cancellier",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/philippe.png",
        "largeur": 158,
        "hauteur": 178,
        "cadre": [
          7,
          -8,
          144,
          144
        ]
      }
    }
  },
  "alexandre": {
    "id": "alexandre",
    "nom": "Alexandre Caso",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/alexandre.png",
        "largeur": 129,
        "hauteur": 172,
        "cadre": [
          -4,
          -9,
          141,
          141
        ]
      }
    }
  },
  "jules": {
    "id": "jules",
    "nom": "Jules Maisonneuve",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/jules.png",
        "largeur": 156,
        "hauteur": 175,
        "cadre": [
          6,
          -9,
          142,
          142
        ]
      }
    }
  },
  "elliot": {
    "id": "elliot",
    "nom": "Elliot Chardon",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/elliot.png",
        "largeur": 126,
        "hauteur": 187,
        "cadre": [
          -9,
          -7,
          144,
          144
        ]
      }
    }
  },
  "julien": {
    "id": "julien",
    "nom": "Julien Fontaine",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/julien.png",
        "largeur": 126,
        "hauteur": 169,
        "cadre": [
          -9,
          -9,
          142,
          142
        ]
      }
    }
  },
  "stephane-c": {
    "id": "stephane-c",
    "nom": "Stéphane Coissard",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/stephane-c.png",
        "largeur": 159,
        "hauteur": 174,
        "cadre": [
          7,
          -9,
          142,
          142
        ]
      }
    }
  },
  "cyril": {
    "id": "cyril",
    "nom": "Cyril Bonnot",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/cyril.png",
        "largeur": 127,
        "hauteur": 176,
        "cadre": [
          -8,
          -9,
          142,
          142
        ]
      }
    }
  },
  "gregory-m": {
    "id": "gregory-m",
    "nom": "Grégory Mellarin",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/gregory-m.png",
        "largeur": 140,
        "hauteur": 180,
        "cadre": [
          -1,
          -9,
          142,
          142
        ]
      }
    }
  },
  "stephane-f": {
    "id": "stephane-f",
    "nom": "Stéphane Fetter",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/stephane-f.png",
        "largeur": 132,
        "hauteur": 174,
        "cadre": [
          -6,
          -9,
          142,
          142
        ]
      }
    }
  },
  "lilian": {
    "id": "lilian",
    "nom": "Lilian Charre",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/lilian.png",
        "largeur": 126,
        "hauteur": 177,
        "cadre": [
          -8,
          -7,
          141,
          141
        ]
      }
    }
  },
  "nordine": {
    "id": "nordine",
    "nom": "Nordine Guerrouche",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/nordine.png",
        "largeur": 171,
        "hauteur": 176,
        "cadre": [
          8,
          -9,
          142,
          142
        ]
      }
    }
  },
  "mahe": {
    "id": "mahe",
    "nom": "Mahé Ranc",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/mahe.png",
        "largeur": 126,
        "hauteur": 175,
        "cadre": [
          -8,
          -8,
          142,
          142
        ]
      }
    }
  },
  "robin": {
    "id": "robin",
    "nom": "Robin Guinet",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/robin.png",
        "largeur": 127,
        "hauteur": 177,
        "cadre": [
          -8,
          -8,
          142,
          142
        ]
      }
    }
  },
  "emma-liconnet": {
    "id": "emma-liconnet",
    "nom": "Emma Liconnet",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/emma-liconnet.png",
        "largeur": 102,
        "hauteur": 135,
        "cadre": [
          -5,
          -7,
          113,
          113
        ]
      },
      "sportif": {
        "src": "img/organigramme/portraits/sportif/emma-liconnet.png",
        "largeur": 128,
        "hauteur": 172,
        "cadre": [
          -8,
          -8,
          142,
          142
        ]
      }
    }
  },
  "alyssa": {
    "id": "alyssa",
    "nom": "Alyssa Naviel",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/alyssa.png",
        "largeur": 124,
        "hauteur": 178,
        "cadre": [
          -9,
          -7,
          141,
          141
        ]
      }
    }
  },
  "leo": {
    "id": "leo",
    "nom": "Léo Granjon",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/leo.png",
        "largeur": 124,
        "hauteur": 176,
        "cadre": [
          -9,
          -8,
          141,
          141
        ]
      }
    }
  },
  "melvin": {
    "id": "melvin",
    "nom": "Melvin Rothenmund",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/melvin.png",
        "largeur": 160,
        "hauteur": 176,
        "cadre": [
          9,
          -6,
          141,
          141
        ]
      }
    }
  },
  "tom": {
    "id": "tom",
    "nom": "Tom Heriaud",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/tom.png",
        "largeur": 124,
        "hauteur": 174,
        "cadre": [
          -9,
          -8,
          141,
          141
        ]
      }
    }
  },
  "antoine": {
    "id": "antoine",
    "nom": "Antoine Barral",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/antoine.png",
        "largeur": 124,
        "hauteur": 180,
        "cadre": [
          -9,
          -8,
          141,
          141
        ]
      }
    }
  },
  "gregory-b": {
    "id": "gregory-b",
    "nom": "Gregory Balayn",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/gregory-b.png",
        "largeur": 125,
        "hauteur": 184,
        "cadre": [
          -8,
          -8,
          141,
          141
        ]
      }
    }
  },
  "hubert": {
    "id": "hubert",
    "nom": "Hubert Poinot",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/hubert.png",
        "largeur": 126,
        "hauteur": 170,
        "cadre": [
          -8,
          -9,
          141,
          141
        ]
      }
    }
  },
  "mounir": {
    "id": "mounir",
    "nom": "Mounir Ayach",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/mounir.png",
        "largeur": 128,
        "hauteur": 175,
        "cadre": [
          -8,
          -8,
          145,
          145
        ]
      }
    }
  },
  "quentin": {
    "id": "quentin",
    "nom": "Quentin Sottet",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/quentin.png",
        "largeur": 124,
        "hauteur": 178,
        "cadre": [
          -9,
          -9,
          141,
          141
        ]
      }
    }
  },
  "chadi": {
    "id": "chadi",
    "nom": "Chadi Stiti",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/chadi.png",
        "largeur": 124,
        "hauteur": 180,
        "cadre": [
          -9,
          -9,
          141,
          141
        ]
      }
    }
  },
  "axel": {
    "id": "axel",
    "nom": "Axel Bravais",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/axel.png",
        "largeur": 124,
        "hauteur": 183,
        "cadre": [
          -9,
          -6,
          141,
          141
        ]
      }
    }
  },
  "anais": {
    "id": "anais",
    "nom": "Anaïs Chardon",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/anais.png",
        "largeur": 125,
        "hauteur": 184,
        "cadre": [
          -9,
          -8,
          141,
          141
        ]
      }
    }
  },
  "jean-christophe": {
    "id": "jean-christophe",
    "nom": "Jean-Christophe Fabre",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/jean-christophe.png",
        "largeur": 181,
        "hauteur": 191,
        "cadre": [
          20,
          -9,
          141,
          141
        ]
      }
    }
  },
  "clement": {
    "id": "clement",
    "nom": "Clément Revillard",
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
    },
    "photos": {
      "sportif": {
        "src": "img/organigramme/portraits/sportif/clement.png",
        "largeur": 133,
        "hauteur": 148,
        "cadre": [
          4,
          -8,
          124,
          124
        ]
      }
    }
  },
  "florian": {
    "id": "florian",
    "nom": "Florian Royol",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/florian.png",
        "largeur": 100,
        "hauteur": 134,
        "cadre": [
          -7,
          -6,
          114,
          114
        ]
      }
    }
  },
  "thibaut": {
    "id": "thibaut",
    "nom": "Thibault Carteron",
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
    },
    "photos": {
      "commissions": {
        "src": "img/organigramme/portraits/commissions/thibaut.png",
        "largeur": 119,
        "hauteur": 140,
        "cadre": [
          2,
          -4,
          113,
          113
        ]
      }
    }
  }
};

export const PERSONNES = Object.fromEntries(
  Object.entries(FICHES).map(([id, fiche]) => {
    const missions = {};
    for (const mission of MISSIONS_FCH) {
      if (mission.qui.includes(id)) (missions[mission.commission] ??= []).push(mission.texte);
    }
    return [id, { ...fiche, missions }];
  }),
);

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
