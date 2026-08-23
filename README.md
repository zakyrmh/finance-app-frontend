# 💰 Finance App Frontend

A modern, responsive, and robust personal finance management web application built with **Nuxt 3 / Nuxt 4**, **Vue 3**, **Tailwind CSS v4**, and **TypeScript**.

---

## ✨ Features

- **🔐 Authentication & Authorization**
  - User Registration & Login
  - Route protection via `auth` and `guest` middleware
  - Secure session management with `useAuth` composable

- **📊 Dashboard & Financial Overview**
  - Real-time balance and net worth calculation
  - Monthly cashflow insights (Income vs. Expense)
  - Quick action shortcuts for frequent transactions

- **💳 Multi-Wallet Management**
  - Support for multiple financial accounts (Bank accounts, E-wallets, Cash)
  - Individual wallet balance monitoring

- **💸 Transaction Tracking**
  - Income, Expense, and Transfer recording
  - Categorization and date filtering
  - Transaction history with detailed metadata

- **🏷️ Category Management**
  - Custom income and expense categories
  - Visual icons and color palettes

- **📝 Debts & Receivables (Hutang / Piutang)**
  - Track debts owed and receivables due
  - Due date reminders and payment status tracking

- **🎨 Modern UI & Responsive Design**
  - Styled with Tailwind CSS v4 and custom theme design tokens
  - Mobile-first, adaptive layouts for desktop, tablet, and mobile devices

- **🧪 Testing Suite**
  - Unit and integration tests with **Vitest**, **@vue/test-utils**, and **happy-dom**

---

## 🛠️ Tech Stack

- **Framework:** [Nuxt 3](https://nuxt.com/) (Nuxt 4 directory structure)
- **UI Library:** [Vue 3](https://vuejs.org/) (Composition API & `<script setup>`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Testing:** [Vitest](https://vitest.dev/) + [@vue/test-utils](https://test-utils.vuejs.org/)

---

## 📁 Project Structure

```text
finance-app-frontend/
├── app/
│   ├── assets/css/        # Tailwind & global theme styling
│   ├── components/        # Reusable UI components (AppHeader, AppSidebar, etc.)
│   ├── composables/       # Composable logic (useAuth, useWallets, useTransactions, etc.)
│   ├── layouts/           # App layouts (default.vue)
│   ├── middleware/        # Route guards (auth.ts, guest.ts)
│   ├── pages/             # File-based routing (dashboard, wallets, debts, login, etc.)
│   └── types/             # TypeScript interfaces and type definitions
├── public/                # Static public assets (favicon, robots.txt)
├── tests/                 # Vitest test files
├── .env                   # Environment variables (local)
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Project scripts & dependencies
├── tsconfig.json          # TypeScript compiler configuration
└── vitest.config.ts       # Test runner configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher (Node 20+ recommended)
- **pnpm**: `v9.x` or higher (or `corepack enable pnpm`)

### 1. Clone the Repository

```bash
git clone https://github.com/zakyrmh/finance-app-frontend.git
cd finance-app-frontend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example` if available):

```env
NUXT_PUBLIC_API_BASE='/api/v1'
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server with hot-module replacement |
| `pnpm build` | Builds the application for production deployment |
| `pnpm preview` | Locally previews the production build |
| `pnpm typecheck` | Validates TypeScript types across the project |
| `pnpm test` | Runs the Vitest test suite |

---

## 🧪 Running Tests

To run unit and validation tests:

```bash
pnpm test
```

---

## 📄 License

This project is licensed under the terms defined in the [LICENSE](LICENSE) file.
