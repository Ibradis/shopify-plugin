# Djomy pour Shopify

Extension de paiement mobile pour Shopify, adossée à l'agrégateur [Djomy](https://djomy.africa) :
Orange Money, MTN Mobile Money, Kulu, et carte via le portail Djomy.

## État

Socle et connecteur Djomy livrés et testés. Les canaux d'encaissement sont en cours.
Voir le [plan d'implémentation](docs/plans/2026-08-24-djomy-shopify-payments.md).

| Brique | État |
| --- | --- |
| Signature HMAC et vérification des webhooks | ✅ testé |
| Client HTTP Djomy (jeton, rejeux, erreurs typées) | ✅ testé |
| Conversion montants et devises | ✅ testé |
| Normalisation des numéros de téléphone | ✅ testé |
| Chiffrement des secrets marchands | ✅ testé |
| Modèle de données | ✅ schéma validé |
| App Shopify embarquée | ⏸ à faire |
| Canal manuel réconcilié par webhook | ⏸ à faire |
| Payments App Extension offsite | ⏸ à faire |

## Démarrage

```bash
cp .env.example .env
openssl rand -base64 32          # à reporter dans ENCRYPTION_KEY
npm install
npm test
```

Base de données locale :

```bash
docker run --name djomy-pg -e POSTGRES_USER=djomy -e POSTGRES_PASSWORD=djomy \
  -e POSTGRES_DB=djomy -p 5432:5432 -d postgres:16
npm run prisma:migrate
```

## Commandes

| Commande | Effet |
| --- | --- |
| `npm test` | Suite de tests |
| `npm run test:coverage` | Tests + couverture |
| `npm run typecheck` | Vérification TypeScript |
| `npm run config:link` | Rattache le dossier à une app du Partner Dashboard |
| `npm run dev` | Serveur de développement Shopify |

## Documentation

- [Contexte projet](docs/PROJECT-CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Décisions techniques](docs/TECHNICAL-DECISIONS.md)
- [Fonctionnalités validées](docs/VALIDATED-FEATURES.md)
- [Points ouverts](docs/KNOWN-ISSUES.md)
- [Spec OpenAPI Djomy](docs/api/djomy-openapi-partner.json)
