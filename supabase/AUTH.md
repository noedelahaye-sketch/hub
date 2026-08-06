# Authentification — état et étapes restantes

Le hub a un seul utilisateur : Noé. Aucune inscription publique.

## Ce qui est en place (par migration, versionné)

- RLS activée sur les 6 tables.
- Politiques `select` / `insert` / `update` / `delete` réservées au rôle `authenticated`.
- Privilèges Postgres accordés à `authenticated` uniquement. `anon` n'a aucun
  privilège : sans session, la clé publique ne donne accès à rien.

Vérifié le 6 août 2026 : une requête REST avec la clé publique et sans session
renvoie `401 permission denied` en lecture comme en écriture, sur toutes les tables.

## Ce qui reste à faire dans le dashboard Supabase

Ces deux réglages relèvent de la configuration Auth du projet, pas du schéma SQL :
ils ne peuvent pas être écrits dans une migration.

1. **Créer le compte de Noé**
   Authentication → Users → Add user → Create new user.
   Renseigner l'e-mail et un mot de passe, cocher « Auto Confirm User » pour éviter
   l'étape de confirmation par e-mail.

2. **Fermer les inscriptions**
   Authentication → Sign In / Providers → Email.
   Désactiver « Allow new users to sign up ».
   À faire **après** la création du compte, sinon la création échoue.

3. **Vérifier**
   Une tentative de `POST /auth/v1/signup` avec la clé publique doit renvoyer une
   erreur `signup_disabled` :

   ```
   curl -X POST "https://dpkyealzuabwchccdqcv.supabase.co/auth/v1/signup" \
     -H "apikey: <clé publique>" -H "Content-Type: application/json" \
     -d '{"email":"test@exemple.fr","password":"..."}'
   ```

## Côté site (à venir)

Le site affiche un écran de connexion simple si la session est absente. La session
persiste entre les visites (comportement par défaut de `supabase-js`, qui la stocke
dans le `localStorage` et rafraîchit le token).
