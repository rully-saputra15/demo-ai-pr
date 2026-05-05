# automated-pr

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Latest Update

### Feature: Add New Page 4 Delivery Board

A new interactive delivery dashboard page has been added at the `/page4` route. This page includes:

- Seeded project data with project status types and date formatting
- Search input, status filters, and sort toggle controls
- Summary metric cards and project cards with report links
- Session snapshot persistence to keep visible projects across page reloads

For details on this feature, see [PR #10](https://github.com/rully-saputra15/demo-ai-pr/pull/10) by @rully-saputra15.

```mermaid
flowchart LR
  seed["Seeded project data"]
  controls["Search, status, and sort controls"]
  computed["Memoized visible projects"]
  metrics["Summary metric cards"]
  cards["Project cards with report links"]
  storage["Session snapshot persistence"]

  seed -- "feeds" --> computed
  controls -- "filter and sort" --> computed
  computed -- "drives" --> metrics
  computed -- "renders" --> cards
  computed -- "stores IDs" --> storage
```

---

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

Edit pages inside the `app/` directory to modify the application, for example `app/page4/page.tsx` for the new delivery board page. The app supports hot reloading.

---

## Available Scripts

- `dev` — Runs the Next.js development server (`next dev`).
- `build` — Builds the app for production (`next build`).
- `start` — Starts the production server (`next start`).
- `lint` — Runs ESLint to check code quality (`eslint`).
- `docs:update` — Updates the README using ChatGPT (`node scripts/update-readme-with-chatgpt.mjs`).

---

## Technologies Used

- Next.js v16.2.4
- React 19.2.4 and React DOM 19.2.4
- Tailwind CSS for styling
- TypeScript for static typing
- ESLint with Next.js configuration for linting

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Official docs and API reference.
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework.
- [React](https://reactjs.org) — JavaScript library for building user interfaces.

---

## Deployment

Deploy your app easily with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

More info: [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying).
