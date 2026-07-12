# TransitOps Odoo

## Admin User Credentials
-**username**: admin@admin.com
-**password**: admin@1234
A modern, full-stack web application built with SvelteKit, designed for transit operations

## 🚀 Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn-svelte](https://www.shadcn-svelte.com/)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: PostgreSQL (via [Neon Database](https://neon.tech/))
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Deployment Adapter**: Vercel Adapter

## 📦 Prerequisites

Make sure you have the following installed:

- Node.js (v24 or later recommended)
- npm, pnpm, or bun

## 🛠️ Getting Started

### 1. Install Dependencies

Clone the repository and install the dependencies:

```bash
bun install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in the required variables in `.env`:

- `DATABASE_URL`: Your PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: A high entropy secret for authentication (minimum 32 characters).
- `ORIGIN`: The origin URL for the app (e.g., `http://localhost:5173` for local development).

### 3. Database Setup

Once your `DATABASE_URL` is set, push the schema to your database:

```bash
bun run db:push
```

### 4. Run the Development Server

Start the application in development mode:

```bash
bun run dev
# To automatically open in your browser
bun run dev -- --open
```

## 📜 Available Scripts

- `bun run dev`: Starts the development server.
- `bun run build`: Creates a production-ready build.
- `bun run preview`: Previews the production build locally.
- `bun run check`: Runs Svelte checks and TypeScript validation.
- `bun run lint`: Lints the codebase with ESLint and Prettier.
- `bun run format`: Formats code using Prettier.
- `bun run test`: Runs all tests (Unit + E2E).
- `bun run test:unit`: Runs unit tests via Vitest.
- `bun run test:e2e`: Runs end-to-end tests via Playwright.
- `bun run db:push`: Pushes schema changes directly to the database.
- `bun run db:generate`: Generates database migrations.
- `bun run db:studio`: Opens Drizzle Studio to inspect database data.
- `bun run auth:schema`: Generates Better Auth schema for Drizzle.

## 🏗️ Building for Production

To create a production build of your app:

```bash
bun --bun run build
```

You can preview the production build with `bun --bun run preview`.
