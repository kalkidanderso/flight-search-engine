'use client';

import { useState, useEffect } from 'react';
import { amadeusClient } from '@/lib/amadeus';
import { debounce } from '@/lib/utils';
import type { Airport, SearchParams } from '@/lib/types';

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [travelClass, setTravelClass] = useState<'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'>('ECONOMY');

    const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);
    const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
    const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
    const [originLoading, setOriginLoading] = useState(false);
    const [destinationLoading, setDestinationLoading] = useState(false);

    // Set default dates (tomorrow and day after)
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 8);

        setDepartureDate(tomorrow.toISOString().split('T')[0]);
        setReturnDate(dayAfter.toISOString().split('T')[0]);
    }, []);

    const searchAirports = async (keyword: string, type: 'origin' | 'destination') => {
        if (keyword.length < 2) {
            if (type === 'origin') setOriginSuggestions([]);
            else setDestinationSuggestions([]);
            return;
        }

        try {
            if (type === 'origin') setOriginLoading(true);
            else setDestinationLoading(true);

            const response = await amadeusClient.searchAirports(keyword);
            const airports: Airport[] = response.data.map(item => ({
                iataCode: item.iataCode,
                name: item.name,
                city: item.address.cityName,
                country: item.address.countryName,
            }));

            if (type === 'origin') {
                setOriginSuggestions(airports);
            } else {
                setDestinationSuggestions(airports);
            }
        } catch (error) {
            console.error('Failed to search airports:', error);
        } finally {
            if (type === 'origin') setOriginLoading(false);
            else setDestinationLoading(false);
        }
    };

    const debouncedSearchOrigin = debounce((keyword: string) => {
        searchAirports(keyword, 'origin');
    }, 300);

    const debouncedSearchDestination = debounce((keyword: string) => {
        searchAirports(keyword, 'destination');
    }, 300);

    const handleOriginChange = (value: string) => {
        setOrigin(value);
        setShowOriginSuggestions(true);
        debouncedSearchOrigin(value);
    };

    const handleDestinationChange = (value: string) => {
        setDestination(value);
        setShowDestinationSuggestions(true);
        debouncedSearchDestination(value);
    };

    const selectOrigin = (airport: Airport) => {
        setOrigin(`${airport.city} (${airport.iataCode})`);
        setShowOriginSuggestions(false);
    };

    const selectDestination = (airport: Airport) => {
        setDestination(`${airport.city} (${airport.iataCode})`);
        setShowDestinationSuggestions(false);
    };

    const extractIataCode = (value: string): string => {
        const match = value.match(/\(([A-Z]{3})\)/);
        return match ? match[1] : value.toUpperCase();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const searchParams: SearchParams = {
            origin: extractIataCode(origin),
            destination: extractIataCode(destination),
            departureDate,
            returnDate: tripType === 'roundtrip' ? returnDate : undefined,
            adults,
            travelClass,
        };

        onSearch(searchParams);
    };

    const swapLocations = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    return (
        <div className="swiss-card max-w-5xl mx-auto fade-in p-6 md:p-8 bg-white shadow-xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Type Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                    <button
                        type="button"
                        onClick={() => setTripType('roundtrip')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${tripType === 'roundtrip'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Round Trip
                    </button>
                    <button
                        type="button"
                        onClick={() => setTripType('oneway')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${tripType === 'oneway'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        One Way
                    </button>
                </div>

                {/* Location Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {/* Origin */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                            From
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => handleOriginChange(e.target.value)}
                                onFocus={() => setShowOriginSuggestions(true)}
                                placeholder="City or airport"
                                className="swiss-input pl-10 h-12 text-lg font-medium"
                                required
                            />
                        </div>

                        {showOriginSuggestions && originSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                                {originSuggestions.map((airport) => (
                                    <div
                                        key={airport.iataCode}
                                        onClick={() => selectOrigin(airport)}
                                        className="p-3 hover:bg-slate-50 cursor-pointer transition-colors duration-200 border-b border-slate-50 last:border-0 flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-semibold text-slate-900">
                                                {airport.city}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {airport.name}
                                            </div>
                                        </div>
                                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                            {airport.iataCode}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {originLoading && (
                            <div className="absolute right-3 top-9 text-blue-600">
                                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Swap Button */}
                    <button
                        type="button"
                        onClick={swapLocations}
                        className="absolute left-1/2 top-1/2 mt-3 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:bg-white hover:shadow-md transition-all duration-200"
                        title="Swap locations"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </button>

                    {/* Destination */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                            To
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => handleDestinationChange(e.target.value)}
                                onFocus={() => setShowDestinationSuggestions(true)}
                                placeholder="City or airport"
                                className="swiss-input pl-10 h-12 text-lg font-medium"
                                required
                            />
                        </div>

                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                                {destinationSuggestions.map((airport) => (
                                    <div
                                        key={airport.iataCode}
                                        onClick={() => selectDestination(airport)}
                                        className="p-3 hover:bg-slate-50 cursor-pointer transition-colors duration-200 border-b border-slate-50 last:border-0 flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-semibold text-slate-900">
                                                {airport.city}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {airport.name}
                                            </div>
                                        </div>
                                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                            {airport.iataCode}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {destinationLoading && (
                            <div className="absolute right-3 top-9 text-blue-600">
                                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                            Departure
                        </label>
                        <input
                            type="date"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="swiss-input h-12 text-slate-900"
                            required
                        />
                    </div>
                    {tripType === 'roundtrip' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                                Return
                            </label>
                            <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                min={departureDate}
                                className="swiss-input h-12 text-slate-900"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Passengers and Class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                            Passengers
                        </label>
                        <select
                            value={adults}
                            onChange={(e) => setAdults(Number(e.target.value))}
                            className="swiss-input h-12 text-slate-900"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? 'Adult' : 'Adults'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                            Class
                        </label>
                        <select
                            value={travelClass}
                            onChange={(e) => setTravelClass(e.target.value as any)}
                            className="swiss-input h-12 text-slate-900"
                        >
                            <option value="ECONOMY">Economy</option>
                            <option value="PREMIUM_ECONOMY">Premium Economy</option>
                            <option value="BUSINESS">Business</option>
                            <option value="FIRST">First Class</option>
                        </select>
                    </div>
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full h-14 text-lg font-semibold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-white/50 border-t-white rounded-full"></div>
                            Searching...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search Flights
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
}
