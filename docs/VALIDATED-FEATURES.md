# Fonctionnalités validées

Une fonctionnalité n'entre ici qu'une fois son résultat réel vérifié.
Ces comportements sont protégés : toute modification qui les casse est une
régression à corriger avant de poursuivre.

## Vérifié par tests automatisés — 2026-08-24

Suite complète : `npm test` → **134 tests, 8 fichiers**.
Couverture de `app/lib/` : 96,6 % des lignes, 90,2 % des branches.

### Signature HMAC — `app/lib/djomy/signature.ts` (22 tests)

- En-tête `X-API-KEY` au format `<clientId>:<hex 64>`, conforme à la doc Djomy.
- Signature = `HMAC_SHA256(message, clientSecret)`, encodage UTF-8 respecté.
- Vérification de webhook : préfixe `v1:` optionnel, casse et espaces tolérés.
- Rejet d'une signature falsifiée, d'un corps altéré d'un seul caractère,
  d'un secret différent, d'une signature non hexadécimale ou de longueur
  différente — sans jamais lever d'exception.
- Comparaison à temps constant.

### Client HTTP — `app/lib/djomy/client.ts` (26 tests)

- `POST /v1/auth` avec `X-API-KEY` seul et corps `{}`.
- Jeton mis en cache, réutilisé, renouvelé 60 s avant expiration.
- Une seule authentification malgré des appels concurrents.
- `401` → une ré-authentification puis rejeu ; abandon si le `401` persiste.
- `429` et `5xx` rejoués trois fois avec attente 1 s puis 2 s.
- `400`, `422` jamais rejoués.
- Panne réseau et dépassement de délai convertis en `DjomyNetworkError`.
- `success: false` traité comme une erreur même sur un code HTTP 2xx.
- Réponse sans `data` ou non JSON signalée en `DjomyProtocolError`.
- Journaux exempts de secret, de jeton et de numéro complet.

### Montants et devises — `app/lib/djomy/currency.ts` (20 tests)

- Correspondance ISO ↔ Djomy dans les deux sens, devise inconnue rejetée.
- GNF et XOF : toute décimale non nulle refusée, jamais arrondie.
- USD et SLE : deux décimales au maximum.
- Montant nul, négatif, non numérique, non fini ou hors précision entière
  sûre : refusé.
- Comparaison de montants insensible aux artefacts de l'arithmétique
  flottante.

### Webhooks — `app/lib/djomy/webhook.ts` (21 tests)

- Signature vérifiée avant toute analyse du contenu.
- Payloads V1 et V2 produisant des données de paiement identiques.
- Transferts sortants (`payout.*`) reconnus en V2.
- `eventId` exigé : sans lui, aucune protection contre le rejeu.
- `estPaiementReussi` exige `payment.success` **et** un statut abouti.

### Numéros de téléphone — `app/lib/phone.ts` (10 tests)

- Guinée et Côte d'Ivoire, formats `+224`, `00224`, `224`, national.
- Espaces, tirets, points et parenthèses ignorés.
- Longueur incorrecte, saisie vide ou pays hors périmètre : refusés.

### Chiffrement — `app/lib/crypto.server.ts` (13 tests)

- AES-256-GCM, IV aléatoire par valeur, aller-retour fidèle.
- Chiffré ou tag altéré : rejeté, jamais de valeur fausse renvoyée.
- Message d'erreur ne révélant pas la cause.

### Erreurs typées — `app/lib/djomy/errors.ts` (14 tests)

- `estRejouable` vrai pour `429` et `5xx`, faux pour `400`, `401`, `403`, `422` :
  c'est cette règle qui pilote les rejeux du client.
- Panne réseau toujours rejouable ; erreur de protocole jamais rejouable.
- Message destiné à l'acheteur exempt de détail technique et de cause interne.
- Masquage des numéros : indicatif et deux derniers chiffres seulement.

### Configuration — `app/lib/env.server.ts` (8 tests)

- Variable manquante signalée nommément, sans divulguer aucune valeur.
- `SHOPIFY_APP_URL` imposée en https, `ENCRYPTION_KEY` de 32 octets.

## Vérifié manuellement — 2026-08-24

- `npx tsc --noEmit` : aucun écart de typage.
- `npx prisma validate` : schéma valide.

## Non encore vérifié

Aucun appel réel à l'API Djomy n'a été effectué : les clés sandbox ne sont
pas encore disponibles. Le format de signature des webhooks reste à
confirmer sur un webhook réel (cf. D8 dans KNOWN-ISSUES.md).
