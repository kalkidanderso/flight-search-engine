# Quick Start Reference

This document provides a concise overview of the steps required to deploy and run the Flight Search Engine.

## Requirements Checklist
- [ ] Flight Search & Results functionality
- [ ] Real-time Price Graph
- [ ] Complex Filtering
- [ ] Responsive Design

## Fast Track Deployment (3 Steps)

### 1. Credentials
Obtain your API Key and Secret from the [Amadeus Developers Portal](https://developers.amadeus.com/).

### 2. Configuration
Add your credentials to `.env.local`:

```bash
NEXT_PUBLIC_AMADEUS_API_KEY=...
NEXT_PUBLIC_AMADEUS_API_SECRET=...
```

### 3. Execution
Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deployment (Vercel)

### Option 1: Dashboard
1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add environment variables.
4.  Deploy.

### Option 2: CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Key Features

-   **Search**: Autocomplete for airports, date validation, and location swapping.
-   **Visualization**: Interactive price graph that responds to filter changes.
-   **Filters**: Multi-parameter filtering (Stops, Price, Airline, Time) with immediate visual feedback.
-   **Responsiveness**: Adaptive layout for mobile, tablet, and desktop interfaces.

## Project Layout

-   `src/components`: UI components.
-   `src/lib`: API clients and utilities.
-   `src/app`: Application routes.
-   `.env.local`: Configuration file (do not commit to version control).

## Troubleshooting

-   **Authentication**: Verify API keys in `.env.local`.
-   **No Results**: Ensure search dates are in the future.
-   **Build Issues**: clear `.next` and `node_modules` and reinstall dependencies.
