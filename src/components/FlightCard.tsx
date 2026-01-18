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
            className="swiss-card group hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
            onClick={() => onSelect?.(flight)}
        >
            <div className="p-5 flex flex-col md:flex-row justify-between gap-6">
                {/* Flight Details */}
                <div className="flex-1 space-y-5">
                    {/* Airline */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-slate-200">
                            {flight.validatingAirlineCodes[0]}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 leading-tight">{airline}</div>
                            <div className="text-xs font-medium text-slate-500">
                                Operated by {flight.validatingAirlineCodes.join(', ')}
                            </div>
                        </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-6">
                        {/* Departure */}
                        <div className="text-center min-w-[3.5rem]">
                            <div className="text-2xl font-bold text-slate-900 leading-none">{departureTime}</div>
                            <div className="text-sm font-bold text-slate-600 mt-1">{firstSegment.departure.iataCode}</div>
                        </div>

                        {/* Duration & Stops */}
                        <div className="flex-1 relative px-2">
                            <div className="flex items-center justify-center mb-1">
                                <div className="text-xs font-medium text-slate-500">{duration}</div>
                            </div>
                            <div className="relative flex items-center">
                                <div className="h-[2px] bg-slate-200 w-full rounded-full"></div>
                                {stops > 0 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1.5 py-0.5 border border-slate-200 rounded-full z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    </div>
                                )}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 transform translate-x-1/2 bg-white pl-1">
                                    <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center mt-1">
                                <div className="text-xs font-medium text-slate-500">
                                    {stops === 0 ? 'Non-stop' : stopsLabel}
                                </div>
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center min-w-[3.5rem]">
                            <div className="text-2xl font-bold text-slate-900 leading-none">{arrivalTime}</div>
                            <div className="text-sm font-bold text-slate-600 mt-1">{lastSegment.arrival.iataCode}</div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-3 text-xs font-medium pt-1">
                        {hasCheckedBag && (
                            <div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Checked bag included</span>
                            </div>
                        )}
                        {flight.numberOfBookableSeats <= 5 && (
                            <div className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                Only {flight.numberOfBookableSeats} seats left
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Section */}
                <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-3 md:min-w-[150px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {price}
                        </div>
                        <div className="text-xs text-slate-400 font-medium lowercase">per person</div>
                    </div>
                    <button
                        className="btn-primary px-6 py-2.5 w-full md:w-auto text-sm shadow-md shadow-slate-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(flight);
                        }}
                    >
                        Select Flight
                    </button>
                </div>
            </div>

            {/* Expandable Details (shown on hover on desktop) */}
            <div className="hidden group-hover:block bg-slate-50 border-t border-slate-100 p-4 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-3">
                    {outbound.segments.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{segment.departure.iataCode}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-bold text-slate-700">{segment.arrival.iataCode}</span>
                            </div>
                            <div className="font-medium">
                                {carriers[segment.carrierCode]} · Flight {segment.number}
                            </div>
                            <div>
                                {parseDuration(segment.duration)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
