'use client';

import { useState, useMemo } from 'react';
import SearchForm from '@/components/SearchForm';
import FlightResults from '@/components/FlightResults';
import PriceGraph from '@/components/PriceGraph';
import FilterPanel from '@/components/FilterPanel';
import { amadeusClient } from '@/lib/amadeus';
import { filterFlights } from '@/lib/utils';
import type { SearchParams, Flight, FlightSearchResponse, FilterState } from '@/lib/types';

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [carriers, setCarriers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const [filters, setFilters] = useState<FilterState>({
    stops: [],
    priceRange: [0, 10000],
    airlines: [],
    departureTime: [],
    arrivalTime: [],
  });

  // Calculate price range from all flights
  const priceRange = useMemo<[number, number]>(() => {
    if (allFlights.length === 0) return [0, 10000];
    const prices = allFlights.map(f => parseFloat(f.price.total));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [allFlights]);

  // Get available airlines
  const availableAirlines = useMemo(() => {
    const airlineSet = new Set<string>();
    allFlights.forEach(flight => {
      flight.validatingAirlineCodes.forEach(code => airlineSet.add(code));
    });
    return Array.from(airlineSet).map(code => ({
      code,
      name: carriers[code] || code,
    }));
  }, [allFlights, carriers]);

  // Update filters when price range changes
  useMemo(() => {
    if (allFlights.length > 0 && filters.priceRange[1] === 10000) {
      setFilters(prev => ({ ...prev, priceRange }));
    }
  }, [priceRange, allFlights]);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response: FlightSearchResponse = await amadeusClient.searchFlights(params);

      if (response.data && response.data.length > 0) {
        setAllFlights(response.data);
        setFlights(response.data);
        setCarriers(response.dictionaries.carriers);
        setCurrency(response.data[0].price.currency);

        // Reset filters
        const prices = response.data.map(f => parseFloat(f.price.total));
        const newPriceRange: [number, number] = [
          Math.floor(Math.min(...prices)),
          Math.ceil(Math.max(...prices))
        ];
        setFilters({
          stops: [],
          priceRange: newPriceRange,
          airlines: [],
          departureTime: [],
          arrivalTime: [],
        });
      } else {
        setAllFlights([]);
        setFlights([]);
        setCarriers({});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search flights. Please try again.');
      setAllFlights([]);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    const filtered = filterFlights(allFlights, newFilters, carriers);
    setFlights(filtered);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="container-custom section-padding relative z-10">
          <div className="text-center mb-12 fade-in">
            <h1 className="heading-1 gradient-text mb-4">
              Find Your Perfect Flight
            </h1>
            <p className="body-large text-gray-300 max-w-2xl mx-auto">
              Search, compare, and book flights with real-time pricing and advanced filtering
            </p>
            {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dev Mode: Using Mock Data (Amadeus API currently unavailable)
              </div>
            )}
          </div>

          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className="mt-6 glass-card border-l-4 border-red-500 bg-red-500/10">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-red-400">Error</h4>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="container-custom section-padding">
          {/* Price Graph */}
          {allFlights.length > 0 && (
            <div className="mb-8">
              <PriceGraph flights={flights} currency={currency} />
            </div>
          )}

          {/* Filters and Results */}
          {allFlights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filter Sidebar */}
              <div className="lg:col-span-1">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  availableAirlines={availableAirlines}
                  priceRange={priceRange}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <FlightResults
                  flights={flights}
                  carriers={carriers}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* No Results After Search */}
          {!isLoading && allFlights.length === 0 && hasSearched && !error && (
            <FlightResults flights={[]} carriers={{}} isLoading={false} />
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="container-custom py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2026 Flight Search Engine. Built with Next.js, TypeScript, and Amadeus API.</p>
            <p className="mt-2">Designed for excellence and user experience.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
