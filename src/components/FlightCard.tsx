'use client';

import { formatTime, formatDate, parseDuration, formatPrice, getStopsLabel } from '@/lib/utils';
import type { Flight } from '@/lib/types';

interface FlightCardProps {
    flight: Flight;
    carriers: Record<string, string>;
    onSelect?: (flight: Flight) => void;
}

export default function FlightCard({ flight, carriers, onSelect }: FlightCardProps) {
    const outbound = flight.itineraries[0];
    const firstSegment = outbound.segments[0];
    const lastSegment = outbound.segments[outbound.segments.length - 1];

    const departureTime = formatTime(firstSegment.departure.at);
    const arrivalTime = formatTime(lastSegment.arrival.at);
    const duration = parseDuration(outbound.duration);
    const stops = outbound.segments.length - 1;
    const stopsLabel = getStopsLabel(stops);

    const price = formatPrice(flight.price.total, flight.price.currency);
    const airline = carriers[flight.validatingAirlineCodes[0]] || flight.validatingAirlineCodes[0];

    const hasCheckedBag = flight.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity > 0;

    return (
        <div
            className="glass-card card-hover group"
            onClick={() => onSelect?.(flight)}
        >
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Flight Details */}
                <div className="flex-1 space-y-4">
                    {/* Airline */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {flight.validatingAirlineCodes[0]}
                        </div>
                        <div>
                            <div className="font-semibold text-white">{airline}</div>
                            <div className="text-sm text-gray-400">
                                {flight.validatingAirlineCodes.join(', ')}
                            </div>
                        </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-4">
                        {/* Departure */}
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{departureTime}</div>
                            <div className="text-sm text-gray-400">{firstSegment.departure.iataCode}</div>
                            <div className="text-xs text-gray-500">
                                {formatDate(firstSegment.departure.at, 'MMM dd')}
                            </div>
                        </div>

                        {/* Duration & Stops */}
                        <div className="flex-1 relative">
                            <div className="flex items-center justify-center mb-2">
                                <div className="text-sm text-gray-400">{duration}</div>
                            </div>
                            <div className="relative">
                                <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 w-full"></div>
                                {stops > 0 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    </div>
                                )}
                                <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-center mt-2">
                                <div className="text-xs text-gray-400">{stopsLabel}</div>
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{arrivalTime}</div>
                            <div className="text-sm text-gray-400">{lastSegment.arrival.iataCode}</div>
                            <div className="text-xs text-gray-500">
                                {formatDate(lastSegment.arrival.at, 'MMM dd')}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-3 text-xs">
                        {hasCheckedBag && (
                            <div className="flex items-center gap-1 text-green-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Checked bag included</span>
                            </div>
                        )}
                        {flight.numberOfBookableSeats <= 5 && (
                            <div className="text-orange-400">
                                Only {flight.numberOfBookableSeats} seats left
                            </div>
                        )}
                        {flight.nonStop && (
                            <div className="flex items-center gap-1 text-blue-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                                <span>Non-stop</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Section */}
                <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-2 md:min-w-[140px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                        <div className="text-3xl font-bold gradient-text">
                            {price}
                        </div>
                        <div className="text-xs text-gray-400">per person</div>
                    </div>
                    <button
                        className="btn-primary px-6 py-2 text-sm whitespace-nowrap"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(flight);
                        }}
                    >
                        Select
                    </button>
                </div>
            </div>

            {/* Expandable Details (shown on hover on desktop) */}
            <div className="hidden group-hover:block mt-4 pt-4 border-t border-white/10 space-y-2 slide-up">
                <div className="text-sm font-semibold text-gray-300">Flight Details:</div>
                {outbound.segments.map((segment, index) => (
                    <div key={index} className="text-xs text-gray-400 flex justify-between">
                        <span>
                            {segment.departure.iataCode} → {segment.arrival.iataCode}
                        </span>
                        <span>
                            {carriers[segment.carrierCode]} {segment.number}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
