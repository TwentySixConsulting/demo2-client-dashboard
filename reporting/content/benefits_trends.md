## Benefits trends

This lives in the Benefits group of the **Trends and Hotspots** page (`/trends#benefits`):
prevalence by employer type, which of the client's own benefits sit in a rising market, the
six category themes, and the less-common benefits ordered by how established they are.

The "where the market is moving" list is computed by joining `ESTABLISHED_BENEFITS` against
`BENEFIT_MARKET_DIRECTION` in `client/src/lib/trendsData.ts`, so it reflects the client's actual
position rather than a generic list. It cannot usefully be pre-written here.
