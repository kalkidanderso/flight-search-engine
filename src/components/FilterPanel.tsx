'use client';

import { useState, useEffect } from 'react';
import type { FilterState } from '@/lib/types';

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    availableAirlines: Array<{ code: string; name: string }>;
    priceRange: [number, number];
}

export default function FilterPanel({
    filters,
    onFilterChange,
    availableAirlines,
    priceRange
}: FilterPanelProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        onFilterChange(localFilters);
    }, [localFilters]);

    const toggleStop = (stops: number) => {
        const newStops = localFilters.stops.includes(stops)
            ? localFilters.stops.filter(s => s !== stops)
            : [...localFilters.stops, stops];
        setLocalFilters({ ...localFilters, stops: newStops });
    };

    const toggleAirline = (code: string) => {
        const newAirlines = localFilters.airlines.includes(code)
            ? localFilters.airlines.filter(a => a !== code)
            : [...localFilters.airlines, code];
        setLocalFilters({ ...localFilters, airlines: newAirlines });
    };

    const toggleTimeSlot = (type: 'departureTime' | 'arrivalTime', slot: string) => {
        const current = localFilters[type];
        const newSlots = current.includes(slot)
            ? current.filter(s => s !== slot)
            : [...current, slot];
        setLocalFilters({ ...localFilters, [type]: newSlots });
    };

    const clearAllFilters = () => {
        setLocalFilters({
            stops: [],
            priceRange: priceRange,
            airlines: [],
            departureTime: [],
            arrivalTime: [],
            maxDuration: undefined,
            includedBaggage: undefined,
        });
    };

    const activeFilterCount =
        localFilters.stops.length +
        localFilters.airlines.length +
        localFilters.departureTime.length +
        localFilters.arrivalTime.length +
        (localFilters.includedBaggage ? 1 : 0);

    const timeSlots = [
        { value: 'morning', label: 'Morning', icon: '🌅', time: '5AM - 12PM' },
        { value: 'afternoon', label: 'Afternoon', icon: '☀️', time: '12PM - 5PM' },
        { value: 'evening', label: 'Evening', icon: '🌆', time: '5PM - 9PM' },
        { value: 'night', label: 'Night', icon: '🌙', time: '9PM - 5AM' },
    ];

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed bottom-6 right-6 z-50 btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-2xl pulse-glow"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            <div className={`
        fixed md:sticky top-0 left-0 w-full md:w-auto h-full md:h-auto
        bg-black/50 md:bg-transparent z-40
        ${isOpen ? 'block' : 'hidden md:block'}
      `}>
                <div className={`
          glass-card h-full md:h-auto overflow-y-auto
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900/50 backdrop-blur-sm p-4 md:p-0 md:bg-transparent -m-6 md:m-0 mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Filters</h3>
                            {activeFilterCount > 0 && (
                                <p className="text-sm text-gray-400">{activeFilterCount} active</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="md:hidden text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Stops Filter */}
                        <div>
                            <h4 className="font-semibold text-white mb-3">Stops</h4>
                            <div className="space-y-2">
                                {[
                                    { value: 0, label: 'Non-stop' },
                                    { value: 1, label: '1 stop' },
                                    { value: 2, label: '2+ stops' },
                                ].map(({ value, label }) => (
                                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.stops.includes(value)}
                                            onChange={() => toggleStop(value)}
                                            className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                                        />
                                        <span className="text-gray-300 group-hover:text-white transition-colors">
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h4 className="font-semibold text-white mb-3">Price Range</h4>
                            <div className="space-y-3">
                                <input
                                    type="range"
                                    min={priceRange[0]}
                                    max={priceRange[1]}
                                    value={localFilters.priceRange[1]}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        priceRange: [priceRange[0], Number(e.target.value)]
                                    })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">${priceRange[0]}</span>
                                    <span className="text-white font-semibold">${localFilters.priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Airlines */}
                        {availableAirlines.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-white mb-3">Airlines</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {availableAirlines.map(({ code, name }) => (
                                        <label key={code} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={localFilters.airlines.includes(code)}
                                                onChange={() => toggleAirline(code)}
                                                className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {code}
                                                </div>
                                                <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                                                    {name}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Departure Time */}
                        <div>
                            <h4 className="font-semibold text-white mb-3">Departure Time</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(({ value, label, icon, time }) => (
                                    <button
                                        key={value}
                                        onClick={() => toggleTimeSlot('departureTime', value)}
                                        className={`p-3 rounded-lg border transition-all duration-300 ${localFilters.departureTime.includes(value)
                                                ? 'border-blue-500 bg-blue-500/20 text-white'
                                                : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{icon}</div>
                                        <div className="text-xs font-semibold">{label}</div>
                                        <div className="text-xs opacity-70">{time}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Arrival Time */}
                        <div>
                            <h4 className="font-semibold text-white mb-3">Arrival Time</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(({ value, label, icon, time }) => (
                                    <button
                                        key={value}
                                        onClick={() => toggleTimeSlot('arrivalTime', value)}
                                        className={`p-3 rounded-lg border transition-all duration-300 ${localFilters.arrivalTime.includes(value)
                                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                                : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{icon}</div>
                                        <div className="text-xs font-semibold">{label}</div>
                                        <div className="text-xs opacity-70">{time}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Baggage */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={localFilters.includedBaggage || false}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        includedBaggage: e.target.checked || undefined
                                    })}
                                    className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                                />
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="text-gray-300 group-hover:text-white transition-colors">
                                        Checked bag included
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
