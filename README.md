# PriceLab

PriceLab is an agentic monetization-intelligence app that connects live competitive pricing evidence to customer economics, adoption, churn, and experiment results. It recommends a packaging hypothesis and the next test—not an unsupported “perfect price.”

The included demonstration asks whether LangChain should package the LangSmith portfolio as modular products, a shared commitment pool, or a hybrid.

> This independent demonstration uses public LangChain information and illustrative internal metrics. It is not produced by or on behalf of LangChain.

## Who it is for

- Pricing and monetization leaders
- Product marketing and growth teams
- RevOps, DealOps, and finance
- Founders and product managers at usage-based SaaS companies

## What it does

1. Accepts a company, product portfolio, pricing page, and customer segment.
2. Combines those with illustrative or authorized internal metrics: commitment, cost to serve, credit utilization, multi-product adoption, churn, target margin, and experiment lift.
3. Runs a live TinyFish workflow or an explicitly labeled demo workflow.
4. Compares adoption-led, balanced, and margin-led packaging scenarios.
5. Returns an evidence ledger and a falsifiable packaging experiment.

## Why each TinyFish primitive is necessary

### Search — discovery

Search finds direct competitors, adjacent alternatives, pricing pages, and current market evidence when the relevant URLs are not known in advance.

### Fetch — normalization

Fetch reads the discovered pages as clean content so prices, allowances, value metrics, commitments, and enterprise fences can be compared consistently.

### Agent — interaction

Agent opens the target pricing experience, operates an interactive usage calculator when one exists, and returns structured observations. Static retrieval cannot reliably reproduce a configured quote from sliders, selectors, or multi-step interfaces.

Internal metrics are never inserted into TinyFish research prompts. They are used only by PriceLab's local decision model.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`.

The app works immediately in **Demo mode**. For a live run, expand **Run on live TinyFish primitives**, enter a TinyFish API key, and choose **Run live**. The key is sent only with that analysis request and is not persisted by the application.

You may alternatively configure the server environment:

```bash
TINYFISH_API_KEY=your_key npm run dev
```

## Demo target

The default target is LangChain's LangSmith portfolio. The external evidence is public. The internal commitment, cost, utilization, adoption, churn, and experiment metrics are illustrative and visibly labeled as such.

Recommended recording flow:

1. Show the LangChain and LangSmith defaults.
2. Point out the separation between market context and internal assumptions.
3. Run the workflow.
4. Show the hybrid portfolio recommendation.
5. Compare the three financial scenarios.
6. Finish on the proposed controlled experiment and evidence ledger.

## Architecture

```text
User framing
   ├── public company and product context
   └── private/illustrative economics
            │
            ├── TinyFish Search → discover alternatives
            ├── TinyFish Fetch  → normalize evidence
            └── TinyFish Agent  → operate pricing UI
                         │
                         ▼
                PriceLab decision model
                         │
                         ▼
        recommendation + scenarios + next experiment
```

The API route is `app/api/analyze/route.ts`. It uses live TinyFish endpoints in live mode and a clearly marked evidence set in demo mode. The scenario model is deterministic so changing internal metrics changes the recommendation without inventing causal certainty.

## Safety and limitations

- Only use synthetic, aggregated, or authorized internal data.
- Public sentiment is qualitative evidence, not a representative customer sample.
- Competitive parity does not prove willingness to pay.
- Scenario outputs are directional hypotheses and should be validated with controlled tests.
- Never expose confidential deal terms in public demos.
- Agent is instructed not to submit purchases, create accounts, or contact sales.

## Build

```bash
npm run build
npm start
```

## Tech stack

- React 19 / Next-compatible Vinext runtime
- Cloudflare Workers deployment target
- TinyFish Search, Fetch, and Agent APIs
- Responsive, accessible CSS without external visual assets
