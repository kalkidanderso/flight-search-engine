# Flight Search Engine

A responsive flight search application built with Next.js 14, TypeScript, and the Amadeus API. This project demonstrates real-time data visualization, advanced filtering capabilities, and a modern user interface design.

## Features

### Core Functionality
- **Flight Search**: Search for flights by origin, destination, dates, and number of passengers.
- **Airport Autocomplete**: Integrated search for airports using IATA codes and city names.
- **Real-time Price Graph**: Interactive price distribution chart that updates dynamically based on active filters.
- **Complex Filtering**: Filter results by number of stops, price range, airlines, and departure/arrival times.
- **Responsive Design**: Optimized layout for mobile, tablet, and desktop devices.
- **Demo Mode**: Built-in mock data generation to ensure functionality even when the API is unavailable.

### User Interface
- **Modern Design**: Clean interface using glassmorphism effects and smooth transitions.
- **Data Visualization**: Clear presentation of price trends and flight statistics.
- **Interactive Elements**: Hover effects, animated transitions, and immediate feedback for user actions.
- **Dark Theme**: Consistent dark mode styling throughout the application.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **API**: Amadeus Self-Service API
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Amadeus API credentials (test environment key and secret)

### Installation

1.  Clone the repository (or download source):
    ```bash
    git clone <repository-url>
    cd flight-search-engine
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env.local` file in the root directory and add your Amadeus credentials. You can use the provided `.env.local.example` as a template.

    ```env
    NEXT_PUBLIC_AMADEUS_API_KEY=your_api_key
    NEXT_PUBLIC_AMADEUS_API_SECRET=your_api_secret
    NEXT_PUBLIC_AMADEUS_BASE_URL=https://test.api.amadeus.com
    
    # Optional: Set to true to force mock data usage
    NEXT_PUBLIC_USE_MOCK_DATA=false
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
npm start
```

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (SearchForm, FlightCard, PriceGraph, etc.).
- `src/lib`: Utility functions, types, and API client configuration.
- `public`: Static assets.

## Deployment

This application is designed to be easily deployed on Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Import the project into Vercel.
3.  Add the required environment variables (`NEXT_PUBLIC_AMADEUS_API_KEY`, etc.) in the Vercel dashboard.
4.  Deploy.

## Troubleshooting

- **Authentication Errors**: Verify that your API credentials are correct and that you are using the test environment URL.
- **No Results**: Ensure you are searching for valid routes with future dates. The test API has limited data coverage.
- **Demo Mode**: If the API is unreachable, the application can switch to Demo Mode. Check the console for logs or set `NEXT_PUBLIC_USE_MOCK_DATA=true` to force this mode.

## License

This project is created for educational and demonstration purposes.
