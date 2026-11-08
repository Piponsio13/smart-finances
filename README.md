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

Run `mise run web:build` and `mise run mobile:typecheck` independently. The API test task expects an isolated PostgreSQL test database and uses the connection and JWT settings from your shell. Export `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and a test-only `JWT_SECRET` before running `mise run api:test` or the combined `mise run check`. GitHub Actions provisions a test database for the API.

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
