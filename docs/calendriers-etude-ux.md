# Les calendriers numériques — étude UX

> Étude demandée par Noé le 12 août 2026, après la construction du calendrier
> en grille du hub. Elle sert deux choses : dire ce que la pratique établie sait
> des calendriers, et confronter le nôtre à ce savoir. La dernière partie est un
> classement de ce qui manque, par effet réel sur l'usage.
>
> Les affirmations sourcées portent leur lien. Le reste est du jugement de
> conception, et c'est dit quand ça l'est.

---

## 1. À quoi sert vraiment un calendrier

Le premier piège est de croire qu'un calendrier sert à *planifier*. L'étude
empirique la plus citée sur l'usage réel ([Tungare & Pérez-Quiñones,
2008](https://arxiv.org/pdf/0809.3447)) montre qu'il sert au moins autant à
**se souvenir** : les gens relisent leur calendrier pour reconstituer ce qui
s'est passé, vérifier un engagement pris, dater un événement après coup. Le
calendrier est une archive autant qu'un plan.

Deux conséquences pour la conception :

1. **Le passé doit être consultable.** Un calendrier qui ne charge que
   l'à-venir n'est qu'une liste de rappels. C'était exactement notre bug du
   12 août : les événements posés sur aujourd'hui à minuit disparaissaient au
   rechargement, parce qu'on ne chargeait que « depuis maintenant ».
2. **Deux natures d'entrées cohabitent**, et elles ne se comportent pas pareil :
   les **engagements fixes** (un match à 15 h, un rendez-vous) et les
   **échéances flexibles** (un dossier à rendre, une publication à programmer).
   Les premiers ont une durée, les seconds une date. Les mêler dans un même
   dessin brouille les deux.

C'est précisément la distinction que fait notre fenêtre de création — seul
l'événement s'étend sur plusieurs jours, la tâche et la publication prennent
une date unique — et c'est la bonne.

---

## 2. Les vues, et la question à laquelle chacune répond

Le principe qui tient tout : **la bonne vue change avec la question qu'on se
pose.** Il n'y a pas de vue supérieure, il y a des vues justes pour un besoin.

| Vue | La question | Ce qu'elle cache |
|---|---|---|
| **Jour** | « Que fait ma journée, heure par heure ? » | tout le reste |
| **Semaine** | « Est-ce que ma semaine tient debout ? » | la vue d'ensemble du mois |
| **Mois** | « Où sont les trous, où sont les paquets ? » | **la durée** |
| **Agenda** | « Qu'est-ce qui arrive, dans l'ordre ? » | la forme du temps |

Sur les préférences, la seule donnée que j'ai pu vérifier est qualitative. Une
étude de conception ([Rick Mower](https://medium.com/ricklmower/case-study-designing-a-calendar-app-to-manage-meetings-5869483a7d60))
conclut que « **le mois et la semaine étaient les vues les plus favorisées** »,
devant le jour puis l'agenda — sans chiffres ni taille d'échantillon publiés,
et en précisant que les répondants pouvaient en citer plusieurs, « puisqu'il
était probable qu'aucune vue seule ne réponde à tous les besoins
d'organisation ».

> **Mise en garde de méthode.** Ma première recherche a fait remonter un
> classement chiffré très net (44 % / 35 % / 21 %). En allant lire les deux
> pages censées le porter, **aucune ne le contient** : le résumé automatique
> l'avait fabriqué. Je l'ai retiré. Méfie-toi des statistiques rondes sur ce
> sujet — la littérature publique sur les préférences de vue est mince, et
> beaucoup d'articles se recopient sans source.

**Le point le plus important, et le plus souvent manqué :** la vue mois
*écrase la durée*. Un appel de trente minutes et un atelier de trois heures
occupent la même case. C'est pour ça que la vue semaine est celle où un plan
devient honnête — elle montre si les choses se tassent, si le jeudi est déjà
saturé, s'il reste du temps entre deux blocs. Cette observation-là est solide :
elle revient dans toutes les synthèses du domaine, et elle se vérifie à l'œil
sur n'importe quel calendrier.

**Notre calendrier a les trois vues utiles** (mois, semaine, agenda) et pas la
vue jour — ce qui est défendable pour un usage personnel où les journées sont
rarement chargées de dix créneaux.

**Mais notre vue semaine n'a pas d'heures.** C'est une grille de sept colonnes
de jours, pas une grille horaire. Elle ne montre donc pas la durée non plus, et
perd l'essentiel de ce qui fait sa valeur. C'est le manque structurel n°1 (voir §8).

---

## 3. La densité, et le débordement

Un calendrier est une **interface dense** : beaucoup de données structurées dans
peu de place. Toute la difficulté tient là. La pratique établie (résumée par
[UX Patterns for Developers](https://uxpatterns.dev/patterns/data-display/calendar)
et [SaaS UI](https://www.saasui.design/blog/saas-calendar-scheduling-ux-patterns))
converge sur trois règles :

**a. Des niveaux de densité pensés, pas subis.** On décide combien d'éléments
une case montre, et ce qui se passe au-delà. Le standard : deux ou trois
éléments visibles, puis un indicateur « +N ».

**b. Le « +N » doit s'ouvrir.** C'est le point que la plupart des
implémentations ratent. Un « +2 » qui ne fait rien est pire que rien : il
annonce une information et refuse de la donner. Chez Google, un clic déplie un
pop-over avec la journée complète. ✅ **Corrigé le 12 août** : le nôtre est
devenu un bouton, et déplie la journée entière — événements de passage compris —
chaque ligne menant au détail de son élément.

**c. Une barre continue pour ce qui dure.** Un événement de trois jours est
*une* barre titrée une fois, pas la même étiquette répétée trois fois. C'est ce
que nous avons corrigé le 12 août, et c'est ce qui distingue visuellement un
calendrier d'un tableau par jour. Le corollaire technique est le placement en
**couloirs** : trier les segments par début puis par durée décroissante, et
poser chacun dans le premier couloir libre. C'est ce que fait
`segmentsDeLaSemaine` dans `js/calendrier-commun.js`.

---

## 4. Les gestes : créer, déplacer, corriger

Trois gestes font l'essentiel de l'usage d'un calendrier.

**Créer par glissement.** Tirer sur des jours ou des heures pour poser quelque
chose est le geste canonique — il dit *quand* avant de demander *quoi*, ce qui
est l'ordre naturel. Nous l'avons. Sa limite connue : sur écran tactile,
`pointerover` ne visite pas les cases voisines pendant un glissement, donc un
doigt ne sélectionne qu'un jour. Le contournement (bloquer le défilement de la
page pendant l'appui) casse plus qu'il ne répare ; notre parade — les deux dates
dans le formulaire — est honnête.

**Déplacer par glissement.** ✅ **Fait le 12 août.** Reporter est l'une des
actions les plus courantes ; elle demandait quatre gestes, elle en demande un.
Un événement de plusieurs jours garde sa durée et son heure — on décale ses deux
bornes du même nombre de jours. À la souris seulement : au doigt, capturer le
glissement obligerait à neutraliser le défilement de la page sur chaque barre,
et une grille en est couverte. Sur téléphone, on passe par « Modifier ».

**Corriger sans détruire.** Une date mal posée se répare ; la supprimer pour la
recréer fait perdre le reste de la fiche. Nous l'avons depuis le 12 août, et le
formulaire de modification n'offre par nature que ce qui a du sens dans un
calendrier — le statut d'une tâche reste géré dans son espace. Ce choix mérite
d'être tenu : **un calendrier dit *quand*, pas *comment*.**

**La saisie en langage naturel** (« match samedi 15h au Vélodrome ») est le
levier le plus spectaculaire des calendriers modernes — Fantastical en a fait sa
réputation. Mais c'est un chantier à part entière, et son gain dépend du volume
de saisie. Pour quelques événements par semaine, il ne vaut pas son coût.

---

## 5. Le confort visuel

C'est le sujet où le hub part avec une avance, parce que ses règles de forme
sont déjà écrites. Ce que dit la pratique :

**Le quadrillage doit se deviner, pas se lire.** C'est aux événements
d'attirer l'œil. Des traits pâles, pas de tuiles, pas de cadres appuyés autour
de chaque jour. Nous y sommes passés le 12 août, à ta demande.

**Ni noir pur, ni blanc pur.** Sur fond sombre, le noir absolu (#000) crée un
effet de halo autour du texte et fatigue ; le blanc pur en texte donne un
contraste excessif. La recommandation courante est un gris très sombre pour le
fond et un blanc cassé pour le texte, avec un rapport de contraste d'au moins
**4,5:1** (WCAG 1.4.3) — voir
[Smashing Magazine](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/).

> Le site Yuno respecte déjà cela sans l'avoir cherché : fond `#181818`, cartes
> `#222222`, texte `#eceeea`. Ce n'est ni du noir pur ni du blanc pur.

**Les couleurs saturées fatiguent en mode sombre.** Le doré `#e8b000` en aplat
est intense ; il est réservé chez nous à ce qui compte (l'accent, le jour même,
les barres), ce qui est la bonne discipline. Si tout devient doré, plus rien ne
l'est.

**La couleur ne doit jamais porter seule une information.** C'est la règle
d'accessibilité la plus citée pour les calendriers, parce qu'ils codent
massivement par couleur. Une barre porte la couleur de son projet — mais rien
n'écrit lequel, et un daltonien ne distinguerait pas Yuno du FCH.

✅ **La nature, elle, se lit depuis le 12 août** : un signe précède le titre
(○ tâche, ◆ publication, ▲ objectif, △ jalon, ▸ commande, ↗ relance), et une
tâche a une barre creuse là où un événement a une barre pleine — une chose à
faire n'est pas une chose qui arrive. L'événement n'a pas de signe : c'est le
cas ordinaire, la barre pleine le dit déjà. **Reste le projet**, toujours porté
par la seule couleur.

---

## 6. L'accessibilité, et pourquoi elle nous concerne quand même

Le hub a un seul utilisateur, donc l'argument « pour les autres » ne porte pas.
Mais deux points de cette liste servent *directement* :

**La navigation au clavier.** Sur un grand écran, poser un événement au clavier
est plus rapide qu'à la souris. Notre grille est aujourd'hui **entièrement
pointeur** : pas de flèches pour se déplacer de jour en jour, pas d'entrée pour
ouvrir, seul Échap fonctionne. C'est un vrai manque de confort, pas seulement
une case à cocher.

**Les cibles tactiles.** Le hub s'est donné 44 px minimum, hérité de Bac-3. Les
barres du calendrier font 1,25 rem de haut (environ 19 px) — en dessous, et
c'est assumé pour tenir la densité, mais il faut le savoir : sur téléphone,
viser une barre parmi trois demande de la précision.

**Ce qui manque franchement**, et que je signale sans le déguiser : depuis que
la grille est passée du `<table>` à des `<div>`, elle n'a **plus de sémantique**
— pas de rôles, pas de noms accessibles sur les cases. Un lecteur d'écran n'y
lit rien d'utile. Si ça ne te concerne pas aujourd'hui, ça reste une dette, et
elle est peu coûteuse à rembourser (`role="grid"`, un `aria-label` par jour).

---

## 7. Le mobile n'est pas un bureau réduit

La règle la plus répétée : **le mobile demande un repli délibéré, pas seulement
du texte plus petit.** Une grille de sept colonnes tient à 375 px — la nôtre le
prouve — mais ce qu'on y met doit changer :

- les titres deviennent illisibles au-delà de deux ou trois mots ;
- la vue semaine sans heures perd tout intérêt sur un écran étroit ;
- l'agenda redevient la meilleure vue, parce qu'une liste ne souffre pas de
  l'étroitesse.

**C'est pour ça qu'il faut garder l'agenda**, et pourquoi le supprimer parce
que « la grille fait mieux » serait une erreur. Sur téléphone, c'est l'agenda
qui répond, pas le mois.

---

## 8. Ce qui change le plus, classé

Mon jugement, appliqué à *ton* usage — un photographe qui suit des matchs, des
publications et des relances, pas un cadre à trente réunions par semaine.

**✅ 1 à 3 — faits le 12 août.** Le « +N » s'ouvre, les natures se
reconnaissent à l'œil, et une barre se déplace au glissement. Reste ceci :

**4. Les heures dans la vue semaine.** *Effet fort, coût élevé.* C'est ce qui
rendrait la semaine « honnête » — voir la durée, les chevauchements, les trous.
Mais c'est une refonte de la vue, et ça ne sert que si tu poses réellement des
horaires. **À décider selon ton usage réel dans un mois**, pas maintenant.

**5. La récurrence.** *Effet fort pour toi en particulier, coût élevé.* Une
saison de football, ce sont des entraînements hebdomadaires et des matchs
réguliers. Les saisir un par un est le genre de friction qui fait abandonner un
outil. À poser sérieusement si tu commences à saisir la saison du FCH.

**6. La navigation au clavier.** *Effet moyen, coût faible.*

**7. La sémantique de la grille.** *Effet nul aujourd'hui, coût faible.* Une
dette à solder quand on repasse dessus.

**8. La saisie en langage naturel.** *Effet moyen, coût élevé.* Ne vaut son prix
qu'au-delà d'un certain volume de saisie. Pas maintenant.

---

## 9. Ce qu'il ne faut pas prendre à ces pratiques

Un calendrier grand public optimise l'engagement. Le hub, non — sa philosophie
dit l'inverse. Trois « bonnes pratiques » courantes sont à refuser ici :

- **Les notifications et les rappels.** Déjà hors périmètre, et pour une raison
  de fond : le système réussit quand on le quitte, pas quand il rappelle à lui.
- **Les couleurs d'alerte sur une échéance proche.** Le hub n'a pas de couleur
  d'alerte et n'en aura pas. Un calendrier qui rougit est un calendrier qui
  culpabilise.
- **Les compteurs de retard, les « en retard », les badges de tâches non
  faites.** Même règle.

Le confort visuel et la lisibilité se prennent chez les autres ; l'économie de
l'attention, non.

---

## Sources

- [Tungare & Pérez-Quiñones, *An Exploratory Study of Calendar Use* (2008)](https://arxiv.org/pdf/0809.3447) — la seule source proprement académique de cette liste
- [Rick Mower — Case Study: Designing a calendar app to manage meetings](https://medium.com/ricklmower/case-study-designing-a-calendar-app-to-manage-meetings-5869483a7d60)
- [UX Patterns for Developers — Calendar View Pattern](https://uxpatterns.dev/patterns/data-display/calendar)
- [SaaS UI — Calendar & Scheduling UX Patterns (2026)](https://www.saasui.design/blog/saas-calendar-scheduling-ux-patterns)
- [hora Calendar — Google Calendar Views: Day, Week, Month](https://horacal.app/blog/2026-06-05-google-calendar-views-day-week-month-schedule/)
- [hora Calendar — Types of Calendar Layouts](https://horacal.app/blog/2026-06-05-types-of-calendar-layouts/)
- [Smashing Magazine — Inclusive Dark Mode](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)
- [Eleken — Calendar UI Examples & UX Tips](https://www.eleken.co/blog-posts/calendar-ui)
- [Page Flows — Calendar Design: UX/UI Tips](https://pageflows.com/resources/exploring-calendar-design/)
