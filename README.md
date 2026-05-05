# automated-pr

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Latest Update

### Feature: Add Dummy Page 1

A new interactive delivery dashboard page has been added at the `/page1` route. This page includes:

- Seeded project data with metrics
- Search, status filtering, and sorting controls
- Summary metrics cards and project detail cards
- Session snapshot persistence of visible projects

For details on this feature, see [PR #5](https://github.com/rully-saputra15/demo-ai-pr/pull/5) by @rully-saputra15.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

You can start editing the pages by modifying files under the `app/` directory, for example `app/page.tsx` or the newly added `app/page1/page.tsx`. The app supports hot reloading and updates automatically as you edit files.

---

## Available Scripts

- `dev`: Starts the Next.js development server (`next dev`).
- `build`: Builds the application for production (`next build`).
- `start`: Runs the built application in production mode (`next start`).
- `lint`: Runs ESLint to check for code quality issues (`eslint`).
- `docs:update`: Updates the README documentation via a script (`node scripts/update-readme-with-chatgpt.mjs`).

---

## Technologies Used

- [Next.js v16.2.4](https://nextjs.org)
- React 19.2.4
- Tailwind CSS for styling
- TypeScript for static typing
- ESLint with Next.js configuration for linting

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Comprehensive guide and API reference.
- [Learn Next.js](https://nextjs.org/learn) — Official interactive tutorial.
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework.

---

## Deployment

Deploy your Next.js app easily with the [Vercel platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more info.
