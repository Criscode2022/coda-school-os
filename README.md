# Coda

**The operating system for independent music schools.**

Coda keeps a small conservatory in order: students and guardians, faculty, rooms, the weekly lesson board, tuition, instrument rentals, and recitals. Built as a production-ready Angular 19 + NestJS 11 + Neon Postgres + Tailwind monorepo.

## Why it exists

Independent schools still run on paper diaries, WhatsApp groups, and a spreadsheet named `cuotas-final-FINAL.xlsx`. Coda is the single workspace for:

- **Students** — instrument, level, guardian, status
- **Faculty** — rates, instruments, bios
- **Rooms** — capacity and piano
- **Schedule** — book, complete, cancel, no-show
- **Tuition** — monthly plans, invoices, generate-this-month
- **Rentals** — assign a cello, mark repair
- **Recitals** — program order, pieces, composers

## Stack

| Layer | Choice |
| --- | --- |
| Web | Angular 19, standalone components, Tailwind CSS 3 |
| API | NestJS 11, Passport JWT, class-validator, Swagger |
| Data | Neon Postgres in production, embedded [PGLite](https://pglite.dev/) when `DATABASE_URL` is unset |
| Auth | Email + password, bcrypt, 7-day JWT |

## Demo

```
email     demo@coda.school
password  demo1234
school    Conservatori Mar (Valencia)
```

The seed includes eight students, four teachers, four rooms, a week of lessons, tuition invoices (including overdue), instrument rentals, and the *Tardor al Mar* recital.

## Local development

```bash
npm install --prefix apps/api
npm install --prefix apps/web
npm run dev
```

- Web: `http://localhost:8080`
- API: `http://127.0.0.1:3001/api`
- Swagger: `http://127.0.0.1:3001/api/docs`

## Production

```bash
npm run build
DATABASE_URL=postgres://… JWT_SECRET=… PORT=8080 npm start
```

Nest serves the compiled Angular app and the `/api` surface on one port. Point `DATABASE_URL` at a Neon pooled connection string.

## Tests

```bash
# API must be running (dev or prod)
npm run test:api
```

The smoke test logs in as the demo director, reads the dashboard, creates and deletes a student, and checks seeded lessons.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | prod | Neon / Postgres. Omit locally to use PGLite. |
| `JWT_SECRET` | prod | Signs access tokens. |
| `PORT` | no | Default `8080` in production. |
| `HOST` | no | Default `0.0.0.0`. |

Do not commit secrets. Copy `.env.example` when you deploy.

## License

MIT
