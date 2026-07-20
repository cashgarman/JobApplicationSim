# Job Application Simulator

An idle clicker about the modern hiring market. Two sides of the same broken system fight a war nobody can win — while AI Recruitment, ATS vendors, and other middlemen invoice everyone.

*Congratulations on finding a job posting for a job that doesn't exist. You're already overqualified for this README.*

## How It Works

You don't play as a hero. You play as **both casualties**.

The screen is split into three columns:

| Column | Who | What they do |
|--------|-----|--------------|
| **Job Seekers** | You, statistically | Click **Apply** ($4.99 per application). Burn savings. Collect rejections. Occasionally get an AI interview. Almost never get a human one. |
| **AI Recruitment** | The profitable middle | Routes applications through ATS filters, AI screeners, and automated processing. Takes a cut. Delivers rejection messages with corporate warmth. |
| **Companies** | Your would-be employer | Click **Post Role**. Spend on AI recruitment tools. Watch open roles pile up and positions go unfilled. |

### The Loop

1. **Apply** or **Post Role** to push traffic through the pipeline.
2. Applications resolve into outcomes: **rejection** (most common), **AI interview** (still a rejection, but with extra steps), or **human interview** (rare, spiritually meaningless).
3. Both sides accumulate **Despair** — a shared misery meter that climbs with every click, every passive drain, and every loan you shouldn't have taken.
4. Buy **upgrades** and **generators** on either side. Names like *Keyword Stuffing*, *Ghost Job Posting*, and *LinkedIn Easy Apply Bot* sound helpful. They mostly make the funnel worse for everyone except the invoice.
5. When savings or revenue run dry, take a **loan**. Interest compounds. Despair accelerates. The bank believes in you. Incorrectly.
6. When either Despair bar hits 100, the market achieves equilibrium: **Game Over**.

Game over can end in **Seeker Burnout**, **Companies Collapse**, or **Mutual Destruction** — depending on which side breaks first. Therapy is not covered under your plan.

Progress saves automatically to your browser. Hit **Give Up** in the header to wipe your save and start the cycle of hope and disappointment over again.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)

### Install

```bash
npm install
```

### Run the game (development)

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Click **Good Luck...** and begin your statistically inevitable decline.

### Build for production

```bash
npm run build
npm run preview
```

`preview` serves the production build locally so you can experience optimized despair.

## Tests

There is no Jest/Vitest suite yet — the game's logic is validated by a **balance simulation** that fast-forwards thousands of applications, maxes out upgrades, and checks that rejection rates, despair growth, and game-over conditions behave as designed.

Run it with:

```bash
npx tsx scripts/balance-test.ts
```

The script prints PASS/WARN lines for:

- Rejection rate after bulk applications
- Whether game over triggers within the simulation window
- Whether despair climbs at a reasonable pace

If all three pass, the economy is *balanced* — which, in this game, means *reliably miserable for everyone involved*. Exactly as intended.

## Tech Stack

- React 19 + TypeScript
- Vite
- Zustand (game state)
- Tailwind CSS

## Design Philosophy

> Everyone loses. The middlemen get paid.

If you're having fun, you're not playing it right. If you're not having fun, welcome to the job market.
