# dynolabs-io/kyc — Shared KYC Service

KYC + sanctions screening shared across Ping, TalentMesh, IoGrid, and other products.

Per [openova-io/openova/ADR-0011](https://github.com/openova-io/openova/blob/main/docs/adr/0011-kyc-shared-service.md):

- **Persona** primary identity-verification provider
- **Onfido** fallback if Persona unavailable
- **Chainalysis KYT** sanctions screening for crypto addresses
- **OFAC SDN / UN / EU** name-screening lists
- **Tier 1 / 2 / 3** standardized verification levels

## Phase 1 status

Stub scaffold — service contract documented, real provider integrations to wire after KYB:
- Persona KYB pending
- Onfido KYB pending
- Chainalysis KYT API access pending

## Tiers

| Tier | Required | Daily limit (USD) | Monthly limit |
|---|---|---|---|
| 0 | Phone OTP only | $0 (read-only) | $0 |
| 1 | Government ID + selfie | $200 | $1,000 |
| 2 | Tier 1 + proof of address + EDD form | $2,000 | $10,000 |
| 3 | Tier 2 + source-of-funds + enhanced sanctions screen | $10,000 | $50,000 |

## Endpoints

- `POST /kyc/v1/inquiries` — start a Tier-2 inquiry, returns Persona inquiry URL
- `POST /kyc/v1/inquiries/:id/webhook` — Persona webhook (HMAC-verified)
- `GET /kyc/v1/users/:userId` — return tier + verification status
- `POST /kyc/v1/sanctions/screen/wallet` — Chainalysis KYT wallet check
- `POST /kyc/v1/sanctions/screen/name` — OFAC name + DoB screen

## Repository layout

```
dynolabs-io/kyc/
├── README.md
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── controllers/
│   ├── services/
│   │   ├── persona.service.ts
│   │   ├── onfido.service.ts
│   │   ├── chainalysis.service.ts
│   │   └── tiers.service.ts
│   └── utils/
├── prisma/
│   └── schema.prisma
├── platform/kyc/    # Helm chart published as bp-kyc OCI artifact
└── .github/workflows/build.yml
```

## Consumers

- `ping-cash/ping-cash` — user-service references via `services/kyc/` (Tier 1/2/3 limits)
- `talentmesh-io/talentmesh` — applicants
- `iogrid/iogrid` — KYC-gated features

## License

Proprietary. Dynolabs Internal.
