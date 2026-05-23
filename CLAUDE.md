# CLAUDE.md — dynolabs-io/kyc

**Repo kind:** Shared cross-product service. Ships Blueprint `bp-kyc:<semver>` to OpenOva Sovereigns.

## Phase 1 plan (per ADR 0011)

1. Service shell with Persona stub integration
2. Tier 1/2/3 webhook handlers
3. Chainalysis KYT stub
4. Blueprint published to ghcr.io/dynolabs-io/bp-kyc
5. Consumer SDK (TS + Go + Python) for ping-cash, talentmesh-io, iogrid

## Dev commands

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Banned terms

- "Cash" (use Ping / TalentMesh / IoGrid based on context)

## References

- ADR 0011: https://github.com/openova-io/openova/blob/main/docs/adr/0011-kyc-shared-service.md
