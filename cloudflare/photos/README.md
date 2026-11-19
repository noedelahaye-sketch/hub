# Photos Yuno — le stockage des photos du hub

Un Worker Cloudflare et un stockage R2, sur **un compte Cloudflare à part** de
celui de la livraison des joueurs : 10 Go gratuits de ce côté-ci, et rien ne se
mélange avec ce qu'on livre aux joueurs.

- Le Worker garde les **fichiers** — l'original en pleine qualité et sa vignette.
- Le **classement** (match, tri, ordre d'un carrousel) vit dans le Supabase du hub.
- On entre avec **la session du hub** : pas de second mot de passe.
- Une photo se lit par une **adresse signée** valable six heures.

**En ligne depuis le 19 novembre 2026** : https://photos-yuno.yuno-rph1.workers.dev
(compte Cloudflare `yuno.rph1@gmail.com`, stockage `photos-yuno` en Europe). La
seconde serrure `UTILISATEUR_ID` est posée : seul le compte du hub de Noé entre.

## Le rangement dans le stockage

- `originaux/<année>/<mois>/<aléa>-<nom>` : le fichier tel qu'il est arrivé.
- `vignettes/<année>/<mois>/<aléa>-<nom>.jpg` : sa vignette, faite dans le navigateur.

## Ce qu'il faut faire une seule fois

1. **Créer le compte Cloudflare** des photos, avec une autre adresse e-mail que
   celle de la livraison.
2. **Créer un jeton d'API** sur ce compte : *My Profile → API Tokens → Create
   Token → « Edit Cloudflare Workers »*, puis ajouter la permission
   *Account → Workers R2 Storage → Edit*.
3. **Le poser dans `cloudflare/photos/.env`**, un fichier que git ignore :

   ```
   CLOUDFLARE_API_TOKEN=le-jeton
   CLOUDFLARE_ACCOUNT_ID=l-identifiant-du-compte
   ```

   L'identifiant du compte se lit dans la colonne de droite du tableau de bord
   Cloudflare. **Wrangler lit ce fichier tout seul** dans ce dossier : la
   livraison garde sa propre connexion (`wrangler login`), sans qu'on ait à se
   déconnecter de l'une pour publier l'autre.
4. **Créer le stockage et le secret de signature** :

   ```bash
   cd cloudflare/photos
   npm install
   npx wrangler r2 bucket create photos-yuno --location weur
   npx wrangler r2 bucket lifecycle add photos-yuno envois-abandonnes --abort-multipart-days 1
   openssl rand -hex 32 | npx wrangler secret put SIGNATURE_SECRET
   ```

   Facultatif, une seconde serrure : `npx wrangler secret put UTILISATEUR_ID`
   avec l'identifiant Supabase de Noé. Seul ce compte pourra alors entrer, même
   si les inscriptions venaient à se rouvrir.

## À chaque modification, en deux temps

**Une seule version en ligne** (décision de Noé, 19 novembre 2026) : à la
différence de la livraison, personne d'autre que lui ne se sert de ce stockage,
et le Worker local suffit pour essayer sans rien abîmer. Une version de test se
remettrait en cinq minutes le jour où la photothèque en ligne demandera plus de
prudence.

1. **En local** : `npm run dev`, puis le Worker répond sur
   http://127.0.0.1:8797 (données dans `.local-data`, secret dans `.dev.vars`).
   Le hub local (http://localhost:4173) a le droit de l'appeler.
2. **En ligne**, une fois validé : `npm run deploy`.

## Réglages (`wrangler.toml`)

- `MAX_TOTAL_GB` : le plafond. Au-delà, plus aucun envoi. 10 Go = l'offre gratuite.
- `ORIGINES` : les sites qui ont le droit d'appeler le Worker.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` : le projet du hub, qui dit qui est connecté.
  Valeurs publiques, déjà présentes dans le code du hub.

## Les adresses du Worker

| | |
|---|---|
| `POST /envoi/debut` | `{ nom, type, taille }` → `{ cle, envoiId }` |
| `PUT /envoi/morceau?cle&envoi&n` | un morceau (au moins 5 Mo, sauf le dernier) → `{ n, etag }` |
| `POST /envoi/fin` | `{ cle, envoiId, morceaux }` → `{ cle, taille }` |
| `POST /envoi/annuler` | `{ cle, envoiId }` |
| `PUT /vignette?cle` | la vignette JPEG, 2 Mo au plus |
| `POST /signer` | `{ cles: [...] }` → une adresse `original` et `vignette` par clé |
| `GET /f/<clé>?exp&sig` | la lecture, plages d'octets comprises (vidéos) |
| `DELETE /fichier?cle` | l'original et sa vignette |
| `GET /place` | `{ occupe, plafond }` en octets |

Toutes demandent `Authorization: Bearer <jeton de session Supabase>`, sauf la
lecture, autorisée par sa signature.
