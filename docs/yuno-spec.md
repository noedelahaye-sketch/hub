# Yuno — cahier des charges de l'espace

**BROUILLON.** Les sections marquées « à trancher » attendent les réponses de
Noé. Rien ne se construit avant validation. Même principe que le cahier des
charges de Bac-3 : chaque règle s'accompagne de sa raison, et si une règle
gêne à l'usage, on la change en connaissance de cause.

---

## 1. Ce que cet espace est, et n'est pas

**C'est l'outil de travail du photographe.** Ce que Noé ouvre pour savoir où
en est chaque reportage, ce qu'il doit livrer, et où en est la marque.

**Ce n'est pas la vitrine.** yuno_rph se montre sur Instagram (et un jour sur
un site public dédié, si le besoin vient). Ici, rien n'est destiné à être vu
par un client ou un club. Conséquence : on optimise pour la densité
d'information utile, pas pour l'effet.

**Il vit dans le hub** (`#photo`), derrière la connexion, avec sa propre forme :
sa feuille de style, ses écrans, ses règles — celles de ce document, pas celles
des autres espaces. Le dashboard du hub continue de lire ses données en direct.

La philosophie du hub s'applique ici comme partout : montrer ce qui est
accompli d'abord, pas de compteur de retard, pas de couleur d'alerte.

---

## 2. Le principe directeur — proposition

**Le site suit le cycle réel d'un reportage.** Un match shooté n'est pas fini :
il devient des photos à trier, puis une galerie à livrer, puis (parfois) un
post. Proposition de pipeline, à corriger selon la réalité du travail de Noé :

```
prévu  →  shooté  →  trié  →  livré  →  publié
```

Si ce pipeline est juste, c'est lui qui structure l'écran principal : chaque
reportage est une carte qui avance d'étape en étape, et « qu'est-ce que je
dois faire maintenant ? » se lit d'un coup d'œil (ce qui est shooté mais pas
trié, trié mais pas livré).

> **À trancher.** Le cycle ci-dessus est-il le bon ? Y a-t-il des étapes en
> trop, ou manquantes (retouche ? sélection client ? facturation ?) ?

---

## 3. Identité

> **À trancher — les couleurs.** Le hub affiche aujourd'hui un corail
> (`#d9694f`) choisi par défaut. Quelles sont les vraies couleurs de yuno_rph
> (celles de l'identité Instagram, du logo, des templates de posts) ?
> Donner les codes hex si possible, ou une capture à imiter.

> **À trancher — la typographie.** Garder les trois polices du hub (Clash
> Display / Instrument Sans / Geist Mono), ou l'identité Yuno a-t-elle sa
> propre police de titre ?

Le ton : celui d'un carnet de travail. Sobre, dense, factuel. Les seuls moments
de fierté affichée sont les victoires (galerie livrée, accréditation obtenue)
— comme partout dans le hub.

---

## 4. Les écrans — proposition

L'espace garde la navigation du hub (onglet Yuno) et utilise les sous-adresses
(`#photo/...`) pour ses écrans internes.

### Écran principal (`#photo`)

1. **Les reportages en cours** — les cartes du pipeline, groupées par étape,
   l'action suivante évidente. C'est le cœur, donc c'est en premier.
2. **À venir** — les prochains matchs/événements à couvrir, avec lieu et heure.
3. **La marque** — la progression vers les 1 000 abonnés (saisie à la main,
   voir §5) et ce que ça sert : la crédibilité pour la CAN 2027.
4. **Victoires** — livraisons, accréditations, jalons de la marque.

### Écrans secondaires (à confirmer)

- `#photo/reportage/<id>` — le détail d'un reportage : club, date, notes,
  liens (galerie livrée, post publié).
- `#photo/can-2027` — le cap long terme : ce qu'il faut avoir fait d'ici là
  (accréditations, portfolio, contacts). Un écran qu'on relit, pas qu'on gère.

> **À trancher — les jobs réels.** Décrire une semaine type : qu'est-ce que
> tu viens faire ici un lundi matin ? Après un match le samedi ? Qu'est-ce qui
> te manque aujourd'hui (et que ni Instagram, ni tes dossiers, ni ta tête ne
> tiennent bien) ?

---

## 5. Les données

Les tables du hub servent déjà : `objectifs` (CAN 2027, 1 000 abonnés),
`evenements` (matchs à couvrir), `victoires`, `taches` (projet `photo`).

Le pipeline demande une table en plus — proposition :

### reportages
- `id` uuid PK
- `titre` text NOT NULL — « U17 contre Vitré »
- `club` text
- `date_seance` timestamptz — quand ça se shoote
- `etape` text CHECK (etape IN ('prevu','shoote','trie','livre','publie'))
- `lien_galerie` text — l'URL livrée au club
- `lien_post` text — le post Instagram, s'il y en a un
- `notes` text
- `created_at` timestamptz default now()

Passer un reportage en `livre` insère une victoire, comme une tâche terminée.

**Les abonnés Instagram** : pas d'API (celle d'Instagram est fermée et
capricieuse) — une saisie manuelle rapide, comme l'humeur du dashboard : un
chiffre de temps en temps, la courbe se dessine.

### suivi_abonnes (à confirmer)
- `date` date UNIQUE
- `abonnes` int NOT NULL

> **À trancher.** Ce suivi manuel vaut-il la peine, ou c'est une corvée de
> plus ? Sans lui, l'objectif « 1 000 abonnés » reste un objectif à jalons
> comme les autres.

Toute évolution du schéma passe par une migration versionnée dans le repo du
hub, qui reste le gardien unique du schéma Supabase.

---

## 6. Ce qu'on ne construit pas

- **Pas de gestion de fichiers photo.** Les photos vivent où elles vivent
  (Lightroom, disque, Drive). Ici on ne garde que des liens et des états.
- **Pas de CRM.** Les contacts de clubs tiennent dans les notes d'un
  reportage tant qu'ils n'ont pas prouvé qu'il leur faut plus.
- **Pas de comptabilité.** Le jour où les revenus 2027 arrivent, ce sera une
  vraie question — pas avant.

Chacun de ces « non » est réversible, mais il se rouvre avec un besoin
constaté, pas avec une envie de complétude.

---

## 7. Questions ouvertes — récapitulatif

1. Le pipeline `prévu → shooté → trié → livré → publié` est-il le bon ?
2. Les couleurs de yuno_rph (codes hex, ou référence à imiter) ?
3. Typo : celles du hub, ou une police propre à la marque ?
4. Une semaine type : qu'est-ce que l'écran principal doit répondre ?
5. Suivi des abonnés à la main : oui ou non ?
6. L'écran CAN 2027 : qu'est-ce qui doit y figurer concrètement ?
