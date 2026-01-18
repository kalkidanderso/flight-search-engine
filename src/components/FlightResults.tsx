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
                    <div key={i} className="skeleton-card animate-pulse">
                        <div className="h-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (flights.length === 0) {
        return (
            <div className="glass-card text-center py-16">
                <svg className="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-semibold text-white mb-2">No flights found</h3>
                <p className="text-gray-400 mb-6">
                    Try adjusting your search criteria or filters
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <div className="glass p-4 rounded-lg text-left">
                        <div className="text-sm text-gray-400 mb-1">Try:</div>
                        <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Different dates</li>
                            <li>• Nearby airports</li>
                            <li>• Removing some filters</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {flights.length} {flights.length === 1 ? 'Flight' : 'Flights'} Found
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Showing the best available options
                    </p>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sort by:</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('price')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${sortBy === 'price'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            Price
                        </button>
                        <button
                            onClick={() => setSortBy('duration')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${sortBy === 'duration'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            Duration
                        </button>
                        <button
                            onClick={() => setSortBy('departure')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${sortBy === 'departure'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'glass text-gray-400 hover:text-white'
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
                        className="slide-up"
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
                <div className="text-center">
                    <p className="text-sm text-gray-400 mb-4">
                        Showing {flights.length} flights. Refine your search for more specific results.
                    </p>
                </div>
            )}
        </div>
    );
}
