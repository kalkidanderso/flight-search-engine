# Setup Guide

This guide provides step-by-step instructions for configuring and running the Flight Search Engine locally and deploying it to Vercel.

## 1. Amadeus API Credentials

The application requires access to the Amadeus Self-Service API.

1.  Visit the [Amadeus for Developers](https://developers.amadeus.com/) portal.
2.  Register for a free account.
3.  Navigate to "My Self-Service Workspace".
4.  Create a new application.
5.  Note down the **API Key** and **API Secret** provided.

## 2. Environment Configuration

1.  Locate the `.env.local` file in the project's root directory.
2.  Update the file with your credentials:

    ```env
    NEXT_PUBLIC_AMADEUS_API_KEY=your_api_key_here
    NEXT_PUBLIC_AMADEUS_API_SECRET=your_api_secret_here
    NEXT_PUBLIC_AMADEUS_BASE_URL=https://test.api.amadeus.com
    ```

    *Note: The `NEXT_PUBLIC_USE_MOCK_DATA` variable can be set to `true` to bypass the API and use simulated data for testing purposes.*

## 3. Local Development

To start the application locally:

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Open `http://localhost:3000` in your web browser.

## 4. Testing the Application

Once running, you can test the functionality by searching for flights.

-   **Recommended Routes**:
    -   JFK (New York) to LAX (Los Angeles)
    -   LHR (London) to CDG (Paris)

-   **Usage Tips**:
    -   Use the autocomplete dropdown to select valid airports.
    -   Ensure selected travel dates are in the future.
    -   Experiment with the filters (stops, price, airlines) to observe real-time updates in the results and price graph.

## 5. Deployment (Vercel)

### Method A: Vercel Dashboard (Recommended)

1.  Push your code to a Git repository.
2.  Log in to Vercel and import the repository.
3.  In the project configuration, verify the following settings:
    -   **Framework Preset**: Next.js
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `.next`
4.  Add your environment variables (`NEXT_PUBLIC_AMADEUS_API_KEY`, etc.) in the dashboard.
5.  Click **Deploy**.

### Method B: Vercel CLI

1.  Install the Vercel CLI:
    ```bash
    npm i -g vercel
    ```

2.  Run the deployment command:
    ```bash
    vercel
    ```

3.  Follow the prompts to link the project.
4.  Add environment variables using the CLI or dashboard.
5.  Deploy to production:
    ```bash
    vercel --prod
    ```

## Common Issues

-   **Authentication Failed**: Double-check that your API Key and Secret are correctly pasted in `.env.local` without extra spaces.
-   **No Flights Found**: This may occur if the route is not supported by the test API or if the dates are invalid. Switch to Mock Data mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`) to verify the UI functionality if API issues persist.
