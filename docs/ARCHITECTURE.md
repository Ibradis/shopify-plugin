# Architecture

## Vue d'ensemble

```
                    ┌──────────────────────────────┐
  Checkout Shopify  │      App Shopify (Remix)     │        API Djomy
        │           │                              │
        │  canal 1  │  routes/pay.$reference       │   POST /v1/auth
        ├──────────>│  routes/webhooks.djomy       │   POST /v1/payments/gateway
        │           │  routes/app.settings         │   POST /v1/payments
        │  canal 2  │                              │   GET  /v1/payments/{id}/status
        └──────────>│  routes/payments.session     │
                    │  routes/payments.refund      │<── webhook X-Webhook-Signature
                    │                              │
                    │  lib/djomy/  ← connecteur    │
                    │  lib/crypto.server.ts        │
                    │  Prisma / PostgreSQL         │
                    └──────────────────────────────┘
```

## Connecteur Djomy — `app/lib/djomy/`

| Fichier | Rôle |
| --- | --- |
| `signature.ts` | HMAC-SHA256 : en-tête `X-API-KEY` et vérification des webhooks |
| `client.ts` | Transport HTTP, cache de jeton, rejeux, erreurs typées |
| `webhook.ts` | Vérification puis analyse des webhooks (V1 et V2) |
| `currency.ts` | Correspondance ISO ↔ Djomy, contrôle de précision des montants |
| `types.ts` | Types issus de la spec OpenAPI |
| `errors.ts` | Erreurs typées et masquage des données sensibles |

Le connecteur ne connaît ni Shopify ni Prisma. Il est testable seul et
réutilisable sur un autre socle.

## Authentification Djomy

```
signature = HMAC_SHA256(message = clientId, clé = clientSecret) → hex
X-API-KEY: <clientId>:<signature>

POST /v1/auth  (X-API-KEY seul, corps {})
  → accessToken, expiresIn = 3600 s

Requêtes protégées : Authorization: Bearer <token>  +  X-API-KEY
```

Le jeton est mis en cache jusqu'à 60 secondes avant son expiration. Un `401`
déclenche une seule ré-authentification suivie d'un rejeu ; cette reprise ne
consomme pas de tentative de rejeu, un jeton périmé n'étant pas une panne.

## Politique de rejeu

| Situation | Comportement |
| --- | --- |
| Panne réseau, délai dépassé | 3 tentatives, attente 1 s puis 2 s |
| `429`, `5xx` | 3 tentatives, même attente |
| `401` (une fois) | Ré-authentification puis rejeu |
| `400`, `403`, `422` | Échec immédiat — la requête est en cause |

## Sécurité

- `clientSecret` marchand et numéros de payeur chiffrés en AES-256-GCM
  (`app/lib/crypto.server.ts`), clé maîtresse dans `ENCRYPTION_KEY`.
- Webhooks vérifiés sur le **corps brut** : toute re-sérialisation invaliderait
  la signature. Comparaison à temps constant.
- Journaux : jamais de secret, de jeton ni de numéro complet. Les numéros sont
  masqués (`00224*******22`).
- Configuration validée au démarrage ; l'application refuse de démarrer si une
  variable manque.

## Idempotence

Deux garde-fous, chacun porté par une contrainte d'unicité en base :

- `DjomyPayment.merchantPaymentReference` — un paiement par commande.
- `DjomyWebhookEvent.eventId` — un webhook rejoué n'est jamais retraité.

## mTLS

Exigé par Shopify pour le canal offsite (phase P4). À configurer sur
l'hébergement retenu avec le certificat CA Shopify. Non requis pour le canal
manuel.
