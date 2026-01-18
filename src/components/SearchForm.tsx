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
        <div className="glass-card max-w-5xl mx-auto fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Type Toggle */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setTripType('roundtrip')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${tripType === 'roundtrip'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Round Trip
                    </button>
                    <button
                        type="button"
                        onClick={() => setTripType('oneway')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${tripType === 'oneway'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        One Way
                    </button>
                </div>

                {/* Location Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {/* Origin */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            From
                        </label>
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => handleOriginChange(e.target.value)}
                            onFocus={() => setShowOriginSuggestions(true)}
                            placeholder="City or airport"
                            className="input-field"
                            required
                        />
                        {showOriginSuggestions && originSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 glass-card max-h-60 overflow-y-auto">
                                {originSuggestions.map((airport) => (
                                    <div
                                        key={airport.iataCode}
                                        onClick={() => selectOrigin(airport)}
                                        className="p-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/5 last:border-0"
                                    >
                                        <div className="font-semibold text-white">
                                            {airport.city} ({airport.iataCode})
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {airport.name}, {airport.country}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {originLoading && (
                            <div className="absolute right-3 top-11 text-blue-400">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Swap Button */}
                    <button
                        type="button"
                        onClick={swapLocations}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block w-10 h-10 rounded-full glass hover:bg-white/20 transition-all duration-300 hover:rotate-180"
                        title="Swap locations"
                    >
                        <svg className="w-5 h-5 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </button>

                    {/* Destination */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            To
                        </label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleDestinationChange(e.target.value)}
                            onFocus={() => setShowDestinationSuggestions(true)}
                            placeholder="City or airport"
                            className="input-field"
                            required
                        />
                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 glass-card max-h-60 overflow-y-auto">
                                {destinationSuggestions.map((airport) => (
                                    <div
                                        key={airport.iataCode}
                                        onClick={() => selectDestination(airport)}
                                        className="p-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/5 last:border-0"
                                    >
                                        <div className="font-semibold text-white">
                                            {airport.city} ({airport.iataCode})
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {airport.name}, {airport.country}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {destinationLoading && (
                            <div className="absolute right-3 top-11 text-blue-400">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Departure
                        </label>
                        <input
                            type="date"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="input-field"
                            required
                        />
                    </div>
                    {tripType === 'roundtrip' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Return
                            </label>
                            <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                min={departureDate}
                                className="input-field"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Passengers and Class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Passengers
                        </label>
                        <select
                            value={adults}
                            onChange={(e) => setAdults(Number(e.target.value))}
                            className="input-field"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <option key={num} value={num} className="bg-gray-800">
                                    {num} {num === 1 ? 'Adult' : 'Adults'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Class
                        </label>
                        <select
                            value={travelClass}
                            onChange={(e) => setTravelClass(e.target.value as any)}
                            className="input-field"
                        >
                            <option value="ECONOMY" className="bg-gray-800">Economy</option>
                            <option value="PREMIUM_ECONOMY" className="bg-gray-800">Premium Economy</option>
                            <option value="BUSINESS" className="bg-gray-800">Business</option>
                            <option value="FIRST" className="bg-gray-800">First Class</option>
                        </select>
                    </div>
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Searching flights...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
