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
                className="md:hidden fixed bottom-6 right-6 z-50 btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-2xl"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            <div className={`
        fixed md:sticky top-0 left-0 w-full md:w-auto h-full md:h-auto
        bg-black/20 md:bg-transparent z-40 backdrop-blur-sm md:backdrop-blur-none
        ${isOpen ? 'block' : 'hidden md:block'}
      `}>
                <div className={`
          swiss-card h-full md:h-auto overflow-y-auto bg-white p-6 md:p-6 rounded-none md:rounded-xl
          transform transition-transform duration-300 md:transform-none shadow-xl md:shadow-sm
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-80 md:w-full
        `}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                            {activeFilterCount > 0 && (
                                <p className="text-xs text-slate-500 font-medium mt-1">{activeFilterCount} active filters</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wide"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="md:hidden text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8 divide-y divide-slate-100">
                        {/* Stops Filter */}
                        <div className="pt-2 first:pt-0">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Stops</h4>
                            <div className="space-y-3">
                                {[
                                    { value: 0, label: 'Non-stop' },
                                    { value: 1, label: '1 stop' },
                                    { value: 2, label: '2+ stops' },
                                ].map(({ value, label }) => (
                                    <label key={value} className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.stops.includes(value)}
                                            onChange={() => toggleStop(value)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                        />
                                        <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="pt-6">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Price Range</h4>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min={priceRange[0]}
                                    max={priceRange[1]}
                                    value={localFilters.priceRange[1]}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        priceRange: [priceRange[0], Number(e.target.value)]
                                    })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-500">${priceRange[0]}</span>
                                    <span className="text-slate-900">${localFilters.priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Airlines */}
                        {availableAirlines.length > 0 && (
                            <div className="pt-6">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Airlines</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {availableAirlines.map(({ code, name }) => (
                                        <label key={code} className="flex items-center gap-3 cursor-pointer group select-none">
                                            <input
                                                type="checkbox"
                                                checked={localFilters.airlines.includes(code)}
                                                onChange={() => toggleAirline(code)}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                            />
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="w-6 h-6 rounded bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-600 text-[10px] font-bold border border-slate-200">
                                                    {code}
                                                </div>
                                                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors text-sm truncate">
                                                    {name}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Departure Time */}
                        <div className="pt-6">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Departure Time</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(({ value, label, icon, time }) => (
                                    <button
                                        key={value}
                                        onClick={() => toggleTimeSlot('departureTime', value)}
                                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${localFilters.departureTime.includes(value)
                                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="text-xl mb-1 filter grayscale">{icon}</div>
                                        <div className="text-xs font-bold">{label}</div>
                                        <div className="text-[10px] opacity-70 font-medium">{time}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Arrival Time */}
                        <div className="pt-6">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Arrival Time</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(({ value, label, icon, time }) => (
                                    <button
                                        key={value}
                                        onClick={() => toggleTimeSlot('arrivalTime', value)}
                                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${localFilters.arrivalTime.includes(value)
                                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="text-xl mb-1 filter grayscale">{icon}</div>
                                        <div className="text-xs font-bold">{label}</div>
                                        <div className="text-[10px] opacity-70 font-medium">{time}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Baggage */}
                        <div className="pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group select-none bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={localFilters.includedBaggage || false}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        includedBaggage: e.target.checked || undefined
                                    })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                />
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="text-slate-700 font-semibold text-sm">
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
