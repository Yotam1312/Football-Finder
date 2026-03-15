<p align="center">
  <img src="./frontend/src/assets/FootBall Finder Logo.png" alt="Football Finder Logo" width="400"/>
</p>

# Football Finder

Football fans travel. Matches happen everywhere. Finding them shouldn't be hard.

**Football Finder** is a match discovery platform that lets you search any European city and instantly see every game happening there — the teams, the stadium, the kick-off time, and how to get there. No more jumping between league sites, Google searches, and club calendars. One search, every match.

Beyond discovery, each team has a **FanBase** — a community space where fans share seat tips, pub recommendations, and match-day advice. Real knowledge from real fans, for every ground in Europe.

---

## Features

- Search matches by city and date range across 10 European leagues
- Full match detail — teams, venue, local kick-off time, standings, and ticket links
- Google Maps directions to every stadium
- FanBase pages for every team — browse by Country → League → Team or search directly
- Community posts organized by type: Seat Tips, Pubs & Food, Local Crowd, I'm Going
- No account needed to browse — fully public

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL on Azure via Prisma ORM |
| Match Data | API-Football — nightly sync across 10 leagues |
| Animations | Framer Motion |
| Deployment | Azure (backend + DB) · Vercel (frontend) |

---

## Covered Leagues

England · Spain · Germany · Italy · France — top 2 leagues per country, 10 total.

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 — Foundation | Backend, database schema, nightly fixture sync | ✅ Complete |
| 2 — Match Discovery | City search, results page, match detail page | ✅ Complete |
| 3 — FanBase Browse | Team navigation and community post feeds | ✅ Complete |
| 4 — Auth & Posting | Email verification, post creation, full accounts | 🔜 Next |
| 5 — Polish & Launch | Mobile audit, transportation guide, public launch | 🔜 Planned |
