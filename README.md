# NYC Gov Job Search

A fast, filterable job browser for [NYC.gov](https://www.nyc.gov) public job listings — built for people who are **not** current city employees and want a better search experience than the official site provides.

Jobs are pulled from the [NYC Open Data API](https://data.cityofnewyork.us/resource/kpav-sd4t.json) and refreshed automatically every 2 days using a local IndexedDB cache, so the app loads instantly on repeat visits.

---

## Features

- 🔍 **Faceted filters** — filter by agency, employment type, salary range, exam requirement, civil service title, level, posting age, and salary frequency. Counts update live as you filter.
- ❤️ **Favorites** — save jobs you're interested in, persisted across sessions via localStorage.
- 🙈 **Hide jobs** — hide listings you've already reviewed to keep your list clean.
- 📜 **Infinite scroll** — jobs load progressively as you scroll, no pagination needed.
- ⚡ **Local cache** — job data is stored in IndexedDB and only re-fetched when it's more than 2 days old.
- 📱 **Responsive** — works on mobile and desktop.

---

## Tech Stack

| Layer       | Technology                                                                   |
| ----------- | ---------------------------------------------------------------------------- |
| Framework   | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build tool  | [Vite 7](https://vitejs.dev)                                                 |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com)                                   |
| Icons       | [Heroicons](https://heroicons.com)                                           |
| Toasts      | [react-hot-toast](https://react-hot-toast.com)                               |
| Local DB    | IndexedDB (via custom `db.ts` helpers)                                       |
| Data source | [NYC Open Data](https://opendata.cityofnewyork.us)                           |
| Deployment  | [Netlify](https://www.netlify.com)                                           |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- [npm](https://www.npmjs.com) v9 or higher
- A free [NYC Open Data app token](https://data.cityofnewyork.us/profile/app_tokens) (required to avoid rate limiting)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/nyc-gov-better-jobs-app.git
cd nyc-gov-better-jobs-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Add your NYC Open Data app token:
VITE_NYC_JOBS_APP_TOKEN=your_token_here

To get a token:

1. Create a free account at [data.cityofnewyork.us](https://data.cityofnewyork.us)
2. Go to your profile → **Developer Settings** → **Create New App Token**

> ⚠️ The app will still work without a token but may hit rate limits and return 403 errors, especially in production.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## Deployment

The app is configured for Netlify via `netlify.toml`. To deploy your own instance:

1. Push the repo to GitHub
2. Connect it to a new Netlify site
3. Add `VITE_NYC_JOBS_APP_TOKEN` as an environment variable under **Site Settings → Environment Variables**
4. Netlify will build and deploy automatically on every push to `main`

---

---

## Data Notes

- Only **External** postings are shown — Internal postings require existing city employment
- Jobs older than **6 months** are filtered out
- Duplicate job IDs are deduplicated, preferring the External posting and the most recently updated version
- Job data refreshes every **2 days** from the API; force a refresh by clearing your browser's IndexedDB for the site

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you'd like to change.
