// Utility functions for the Flight Search Engine

import { format, parseISO, differenceInMinutes } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
    try {
        return format(parseISO(dateString), formatStr);
    } catch (error) {
        return dateString;
    }
}

/**
 * Format time from ISO string
 */
export function formatTime(dateString: string): string {
    try {
        return format(parseISO(dateString), 'HH:mm');
    } catch (error) {
        return dateString;
    }
}

/**
 * Parse ISO duration string (e.g., "PT2H30M") to readable format
 */
export function parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;

    if (hours && minutes) {
        return `${hours}h ${minutes}m`;
    } else if (hours) {
        return `${hours}h`;
    } else if (minutes) {
        return `${minutes}m`;
    }
    return duration;
}

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(start: string, end: string): number {
    try {
        return differenceInMinutes(parseISO(end), parseISO(start));
    } catch (error) {
        return 0;
    }
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: string | number, currency: string = 'USD'): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
}

/**
 * Get airline name from code
 */
export function getAirlineName(code: string, carriers: Record<string, string>): string {
    return carriers[code] || code;
}

/**
 * Get number of stops from segments
 */
export function getStopsCount(segments: any[]): number {
    return Math.max(0, segments.length - 1);
}

/**
 * Get stops label
 */
export function getStopsLabel(count: number): string {
    if (count === 0) return 'Non-stop';
    if (count === 1) return '1 stop';
    return `${count} stops`;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get time of day from hour
 */
export function getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

/**
 * Extract hour from ISO date string
 */
export function getHourFromISO(dateString: string): number {
    try {
        return parseISO(dateString).getHours();
    } catch (error) {
        return 0;
    }
}

/**
 * Generate price range buckets for graph
 */
export function generatePriceBuckets(flights: any[], bucketCount: number = 10) {
    if (flights.length === 0) return [];

    const prices = flights.map(f => parseFloat(f.price.total));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const bucketSize = (maxPrice - minPrice) / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
        min: minPrice + i * bucketSize,
        max: minPrice + (i + 1) * bucketSize,
        count: 0,
        label: formatPrice(minPrice + i * bucketSize),
    }));

    prices.forEach(price => {
        const bucketIndex = Math.min(
            Math.floor((price - minPrice) / bucketSize),
            bucketCount - 1
        );
        buckets[bucketIndex].count++;
    });

    return buckets;
}

/**
 * Sort flights by different criteria
 */
export function sortFlights(flights: any[], sortBy: 'price' | 'duration' | 'departure') {
    return [...flights].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return parseFloat(a.price.total) - parseFloat(b.price.total);
            case 'duration':
                const durationA = calculateDuration(
                    a.itineraries[0].segments[0].departure.at,
                    a.itineraries[0].segments[a.itineraries[0].segments.length - 1].arrival.at
                );
                const durationB = calculateDuration(
                    b.itineraries[0].segments[0].departure.at,
                    b.itineraries[0].segments[b.itineraries[0].segments.length - 1].arrival.at
                );
                return durationA - durationB;
            case 'departure':
                return new Date(a.itineraries[0].segments[0].departure.at).getTime() -
                    new Date(b.itineraries[0].segments[0].departure.at).getTime();
            default:
                return 0;
        }
    });
}

/**
 * Filter flights based on filter state
 */
export function filterFlights(flights: any[], filters: any, carriers: Record<string, string>) {
    return flights.filter(flight => {
        // Stops filter
        if (filters.stops.length > 0) {
            const stopsCount = getStopsCount(flight.itineraries[0].segments);
            if (!filters.stops.includes(stopsCount)) return false;
        }

        // Price range filter
        const price = parseFloat(flight.price.total);
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
            return false;
        }

        // Airlines filter
        if (filters.airlines.length > 0) {
            const flightAirlines = flight.validatingAirlineCodes;
            const hasMatchingAirline = flightAirlines.some((code: string) =>
                filters.airlines.includes(code)
            );
            if (!hasMatchingAirline) return false;
        }

        // Departure time filter
        if (filters.departureTime.length > 0) {
            const departureHour = getHourFromISO(flight.itineraries[0].segments[0].departure.at);
            const timeOfDay = getTimeOfDay(departureHour);
            if (!filters.departureTime.includes(timeOfDay)) return false;
        }

        // Arrival time filter
        if (filters.arrivalTime.length > 0) {
            const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
            const arrivalHour = getHourFromISO(lastSegment.arrival.at);
            const timeOfDay = getTimeOfDay(arrivalHour);
            if (!filters.arrivalTime.includes(timeOfDay)) return false;
        }

        // Max duration filter
        if (filters.maxDuration) {
            const duration = calculateDuration(
                flight.itineraries[0].segments[0].departure.at,
                flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at
            );
            if (duration > filters.maxDuration) return false;
        }

        return true;
    });
}
