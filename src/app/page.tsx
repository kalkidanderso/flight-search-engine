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
    <main className="min-h-screen bg-gray-50/50">
      {/* Navbar / Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              ✈
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">FlightSearch</span>
          </div>
          {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Demo Mode
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Clean & Minimal */}
      <div className="bg-white border-b border-gray-200 pb-16 pt-16">
        <div className="container-custom">
          <div className="text-center mb-10 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-4">
              Where to next?
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Search global flights with real-time pricing and precision filtering.
            </p>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className="mt-8 max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="text-red-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-red-900 text-sm">Search Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="container-custom py-12">
          {/* Price Graph */}
          {allFlights.length > 0 && (
            <div className="mb-8">
              <PriceGraph flights={flights} currency={currency} />
            </div>
          )}

          {/* Filters and Results */}
          {allFlights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No flights found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your dates or destination.</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold">
                F
              </div>
              <span className="font-semibold text-slate-900">FlightSearch</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 Flight Search Engine. Professional Demo.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
