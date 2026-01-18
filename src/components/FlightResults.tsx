'use client';

import { useState } from 'react';
import FlightCard from './FlightCard';
import { sortFlights } from '@/lib/utils';
import type { Flight } from '@/lib/types';

interface FlightResultsProps {
    flights: Flight[];
    carriers: Record<string, string>;
    isLoading: boolean;
}

export default function FlightResults({ flights, carriers, isLoading }: FlightResultsProps) {
    const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');

    const sortedFlights = sortFlights(flights, sortBy);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                                <div className="flex justify-between">
                                    <div className="h-8 bg-slate-100 rounded w-16"></div>
                                    <div className="h-8 bg-slate-100 rounded w-32"></div>
                                    <div className="h-8 bg-slate-100 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="w-full md:w-32 h-12 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (flights.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No flights found</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    We couldn't find any flights matching your criteria. Try adjusting your dates or filters.
                </p>
                <div className="inline-block bg-slate-50 rounded-lg p-6 text-left border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Suggestions</div>
                    <ul className="text-sm text-slate-600 space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Check adjacent dates
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Try varying airport codes
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Clear some filters
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {flights.length} {flights.length === 1 ? 'Flight' : 'Flights'} Found
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Prices include taxes and fees
                    </p>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sort by:</span>
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setSortBy('price')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${sortBy === 'price'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Price
                        </button>
                        <button
                            onClick={() => setSortBy('duration')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${sortBy === 'duration'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Duration
                        </button>
                        <button
                            onClick={() => setSortBy('departure')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${sortBy === 'departure'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Departure
                        </button>
                    </div>
                </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4">
                {sortedFlights.map((flight, index) => (
                    <div
                        key={flight.id}
                        className="animate-in slide-in-from-bottom-2 fade-in duration-500"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <FlightCard
                            flight={flight}
                            carriers={carriers}
                            onSelect={(f) => console.log('Selected flight:', f)}
                        />
                    </div>
                ))}
            </div>

            {/* Load More (if needed) */}
            {flights.length >= 50 && (
                <div className="text-center py-6">
                    <p className="text-sm text-slate-400 font-medium">
                        Showing top {flights.length} results. Refine search for more.
                    </p>
                </div>
            )}
        </div>
    );
}
