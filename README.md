# Smart Finances

Smart Finances has three applications in one Git repository:

| Directory | Application | Tooling |
| --- | --- | --- |
| `apps/api` | REST API, authentication, and persistence | Spring Boot, Java 21, Maven Wrapper, PostgreSQL 15 |
| `apps/web` | Browser client | React, Vite, npm |
| `apps/mobile` | Mobile client | React Native, Expo SDK 57, npm |

The clients have separate npm lockfiles and both call the API. Mise selects a compatible Node and Java version and runs commands in the correct app directory. The Maven Wrapper continues to pin Maven. The original Git histories are reachable from the three import merge commits.

## Local setup

Install [mise](https://mise.jdx.dev/getting-started.html) and Docker with Compose. From the repository root:

```sh
mise trust
mise install
mise run setup
cp apps/api/.env.example apps/api/.env
mise run db:up
mise run api:dev
```

The API loads the local shell-compatible `apps/api/.env` file and runs with the Spring `dev` profile. The database task starts only PostgreSQL; the API runs on your host at port 8080. If you run the full Docker Compose stack instead, set its backend JDBC hostname to `postgres` in `apps/api/.env`.

In separate terminals, run `mise run web:dev` or `mise run mobile:dev`. Both clients default to `http://localhost:8080`. For a physical phone use your computer's LAN address in `apps/mobile/.env` (copy the example first). For the standard Android emulator use `http://10.0.2.2:8080`. Native Expo builds need the platform SDK and a development build; see the [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/).

Run `mise run db:stop` to stop local PostgreSQL and retain its data.

## Checks

Run `mise run web:test`, `mise run web:build`, and `mise run mobile:typecheck` independently. The API test task expects an isolated PostgreSQL test database and uses the connection and JWT settings from your shell. Export `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and a test-only `JWT_SECRET` before running `mise run api:test` or the combined `mise run check`. GitHub Actions provisions a test database for the API.

The web client restores a saved session through `GET /api/auth/me` before displaying protected pages. Expired or rejected tokens return the user to sign-in; temporary connection failures offer retry. Run the API and web changes together. If the web app uses a different origin, add it to the comma-separated `CORS_ALLOWED_ORIGINS` in the API environment.

The Render blueprint uses `apps/api` as its service root. Keep deployment secrets in Render.

## Run the whole stack in Docker

Start Docker Desktop and run `mise run stack:up` from the repository root.
Stop any host API, Vite, or Expo processes first so ports 8080, 5173, and 8081
are available. Open the UI at http://localhost:5173. Docker Desktop groups
`ui`, `api`, `mobile`, and `postgres` under `smart-finances`.

The mobile container runs Expo Metro. Install and launch the development build
on a simulator or phone. For a phone, set `SMART_FINANCES_HOST` to your Mac's LAN
IP when starting the stack. Re-run `mise run stack:up` to rebuild images after
source changes.

The Docker stack starts with a separate PostgreSQL volume from the host
development workflow above. Run `mise run stack:down` to stop the stack and
keep its data.

## Google and Apple sign-in

Email/password sign-in remains available. Google and Apple can create accounts and
sign returning users into the same app session. Identities are keyed by provider
and subject. Existing accounts are never linked automatically by matching email;
use the original sign-in method if that email already belongs to an account.
Apple private relay addresses work as separate provider accounts.

1. Apply [the social auth schema migration](apps/api/db/migrations/20261122_social_auth.sql)
   to production PostgreSQL before deploying the API (`ddl-auto=validate`). Local
   development with the `dev` profile creates the tables automatically.
2. Create a Google OAuth **Web application** client. Register your exact browser
   origins, set `VITE_GOOGLE_CLIENT_ID` in `apps/web/.env`, and include that ID in
   the API's comma-separated `GOOGLE_CLIENT_IDS`.
3. For native Google sign-in, set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to that web
   client ID. Create an iOS OAuth client for the app bundle ID and set
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. The Expo config derives its reversed URL
   scheme. Register an Android OAuth client with your app package and signing
   certificate SHA-1. Native Google sign-in requires a rebuilt development build;
   it does not run in Expo Go. The native SDK uses an account chooser on every
   explicit sign-in to obtain a fresh credential.
4. Enable Sign in with Apple for your Apple App ID. For web, create a Services ID,
   associate it with that App ID, and register your HTTPS domain and exact return
   URL. Set `VITE_APPLE_CLIENT_ID` to the Services ID and
   `VITE_APPLE_REDIRECT_URI` to that registered URL (for example,
   `https://finance.example/login`). Apple web sign-in requires a real HTTPS domain.
   Set API `APPLE_CLIENT_IDS` to both the Services ID and the iOS bundle ID.
   Rebuild the native app to apply its Apple entitlement. Native Apple sign-in is
   offered on supported iOS devices; Android users can use Google or email.
5. Restart the API and clients after updating their environments. Keep only public
   client IDs in client environments. No provider secret is required for these
   ID-token sign-in flows. Allow the web origin through `CORS_ALLOWED_ORIGINS`.

The API verifies provider signatures using cached, rotating public keys, validates
issuer, audience, expiration, subject and available nonces, and requires a verified
email when creating an account. Token digests in PostgreSQL prevent concurrent
credential replay; expired digests are cleaned up during successful sign-in.
Provider tokens are exchanged for app tokens and are not stored in client session
storage. Provider controls appear when configured. A live provider test requires
registered credentials, browser origins, and signed native builds.

Provider setup references: [Google token validation](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token),
[Apple JS](https://developer.apple.com/documentation/signinwithapplejs),
[Expo Apple authentication](https://docs.expo.dev/versions/v57.0.0/sdk/apple-authentication/).

## Shared visual design

Web and mobile use the green-and-ivory visual system defined in
[`design/tokens.json`](design/tokens.json). Update that file, then run
`node scripts/sync-design-tokens.mjs` (or `mise run design:sync`) to regenerate
both palettes and the web CSS variables. Commit the generated files with the
source change. `node scripts/sync-design-tokens.mjs --check` detects drift and
runs in CI and `mise run check`.

Web components inherit the MUI theme in `apps/web/src/theme/theme.ts`; auth and
navigation use the generated CSS variables. Shared native controls use the same
color and radius tokens with platform system fonts. Reuse `Brand`, shared form
controls, cards, and dialogs for new screens, including loading and empty states.
