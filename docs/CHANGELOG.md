# Journal des modifications

## 2026-08-24 — Socle et connecteur Djomy

### Ajouté

- Plan d'implémentation validé : stratégie hybride, stack Node/TypeScript/Remix.
- Spec OpenAPI Djomy archivée dans `docs/api/`.
- Connecteur Djomy `app/lib/djomy/` : signature HMAC, client HTTP avec cache de
  jeton et rejeux, analyse des webhooks V1 et V2, conversion des montants et
  devises, types issus de la spec, erreurs typées.
- Normalisation des numéros de téléphone (GN, CI, SL, SN, ML).
- Chiffrement AES-256-GCM des secrets marchands.
- Validation de la configuration au démarrage.
- Schéma Prisma : sessions Shopify, identifiants marchands, paiements,
  journal des webhooks.
- Documentation projet.

### Vérifié

- 134 tests automatisés, tous verts — 96,6 % de couverture sur `app/lib/`.
- Typage TypeScript sans écart.
- Schéma Prisma valide.

### Reste à faire

- App Shopify embarquée et écran de configuration.
- Canal manuel réconcilié par webhook.
- Payments App Extension offsite.
- Réponses de Djomy aux questions Q1 à Q6.
