# Points ouverts

## Bloquants pour la mise en production

### D1 — Aucune API de remboursement chez Djomy

La spec OpenAPI n'expose aucun endpoint de remboursement. Seul l'événement
webhook `payment.refunded` existe, ce qui laisse penser que le remboursement
s'effectue depuis l'espace marchand Djomy.

Shopify exige que le marchand puisse rembourser depuis son admin. C'est un
critère d'approbation pour le canal offsite.

**En attendant :** `refundSessionReject` avec un motif explicite, plus une
annotation de commande. Ne jamais résoudre un remboursement qui n'a pas eu
lieu. Question Q1 posée à Djomy.

### D7 — URL de production Djomy inconnue

La spec ne déclare que `https://sandbox-api.djomy.africa`. Question Q2.

### D8 — Format exact de la signature webhook non spécifié

La documentation indique « le payload sera signé avec la clé secrète » et un
en-tête `X-Webhook-Signature: v1:signature`, sans préciser la chaîne signée.

L'implémentation retient `HMAC_SHA256(corps_brut_UTF8, clientSecret)` en
hexadécimal, par cohérence avec l'en-tête `X-API-KEY`. **À confirmer sur un
webhook sandbox réel avant toute recette.** Question Q3.

## Contraintes à traiter dans le code

### D2 — `payerNumber` obligatoire même en flux redirigé

`CreatePaymentCommand` déclare `payerNumber` requis, y compris pour le flux
avec redirection. Shopify ne garantit pas le téléphone de l'acheteur au
checkout.

**Traitement :** page intermédiaire hébergée par l'app pour collecter le
numéro avant redirection. Question Q5 sur le cas du paiement par carte.

### D5 — Idempotence non documentée côté Djomy

Aucune mention de clé d'idempotence ni de politique de rejeu. Un rejeu
pourrait produire un double débit.

**Traitement :** unicité de `merchantPaymentReference` et de `eventId` en
base. Question Q4 sur les limites de débit.

## Contraintes d'exploitation

### D6 — Exigences Shopify pour le canal offsite

TLS mutuel avec le CA Shopify, disponibilité 99,95 %, réponse support sous
2 heures, webhooks de conformité. À arbitrer avant la phase P4 : hébergement
et astreinte.

## Questions ouvertes chez Djomy

| # | Question | Statut |
| --- | --- | --- |
| Q1 | API de remboursement disponible ? | ⏸ à poser |
| Q2 | URL de base en production ? | ⏸ à poser |
| Q3 | Chaîne exacte signée pour le webhook ? | ⏸ à poser |
| Q4 | Limites de débit et politique de rejeu ? | ⏸ à poser |
| Q5 | `payerNumber` factice accepté si paiement par carte ? | ⏸ à poser |
| Q6 | Délai avant `payment.timeout` ? Annulation possible ? | ⏸ à poser |
