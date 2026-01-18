// Amadeus API Client

import axios, { AxiosInstance } from 'axios';
import type {
    AmadeusAuthResponse,
    AirportSearchResponse,
    FlightSearchResponse,
    SearchParams
} from './types';

class AmadeusClient {
    private baseURL: string;
    private apiKey: string;
    private apiSecret: string;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;
    private client: AxiosInstance;
    private useMockData: boolean;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
        this.apiKey = process.env.NEXT_PUBLIC_AMADEUS_API_KEY || '';
        this.apiSecret = process.env.NEXT_PUBLIC_AMADEUS_API_SECRET || '';
        this.useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    /**
     * Get access token from Amadeus API
     */
    private async getAccessToken(): Promise<string> {
        if (this.useMockData) return 'mock-token';

        // Return cached token if still valid
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', this.apiKey);
            params.append('client_secret', this.apiSecret);

            const response = await this.client.post<AmadeusAuthResponse>(
                '/v1/security/oauth2/token',
                params
            );

            this.accessToken = response.data.access_token;
            // Set expiry to 5 minutes before actual expiry for safety
            this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

            return this.accessToken;
        } catch (error) {
            console.error('Failed to get access token, using mock data:', error);
            // Fallback to mock data if auth fails
            this.useMockData = true;
            return 'mock-token';
        }
    }

    /**
     * Generate mock airports
     */
    private getMockAirports(keyword: string): AirportSearchResponse {
        const mockAirports = [
            { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
            { iataCode: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom' },
            { iataCode: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
            { iataCode: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates' },
            { iataCode: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore' },
            { iataCode: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan' },
            { iataCode: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan' },
            { iataCode: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia' },
            { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
            { iataCode: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States' },
        ];

        const filtered = mockAirports.filter(a =>
            a.name.toLowerCase().includes(keyword.toLowerCase()) ||
            a.city.toLowerCase().includes(keyword.toLowerCase()) ||
            a.iataCode.toLowerCase().includes(keyword.toLowerCase())
        );

        return {
            meta: { count: filtered.length, links: { self: '' } },
            data: filtered.map(a => ({
                type: 'location',
                subType: 'AIRPORT',
                name: a.name,
                detailedName: a.name,
                id: a.iataCode,
                self: { href: '', methods: [] },
                timeZoneOffset: '+00:00',
                iataCode: a.iataCode,
                geoCode: { latitude: 0, longitude: 0 },
                address: {
                    cityName: a.city,
                    cityCode: a.iataCode,
                    countryName: a.country,
                    countryCode: 'XX',
                    regionCode: 'XX'
                },
                analytics: { travelers: { score: 0 } }
            }))
        };
    }

    /**
     * Generate mock flight search response
     */
    private getMockFlights(params: SearchParams): FlightSearchResponse {
        const count = 25;
        const carriers = ['AA', 'BA', 'DL', 'EK', 'SQ', 'JL', 'QF', 'AF', 'LH', 'UA'];
        const carrierNames: Record<string, string> = {
            'AA': 'American Airlines',
            'BA': 'British Airways',
            'DL': 'Delta Air Lines',
            'EK': 'Emirates',
            'SQ': 'Singapore Airlines',
            'JL': 'Japan Airlines',
            'QF': 'Qantas',
            'AF': 'Air France',
            'LH': 'Lufthansa',
            'UA': 'United Airlines'
        };

        const flights = Array.from({ length: count }, (_, i) => {
            const carrier = carriers[Math.floor(Math.random() * carriers.length)];
            const basePrice = 300 + Math.random() * 1000;
            const isDirect = Math.random() > 0.3;
            const durationHours = 2 + Math.floor(Math.random() * 12);
            const departureHour = Math.floor(Math.random() * 24);

            const departureDate = new Date(params.departureDate);
            departureDate.setHours(departureHour, 0, 0);

            const arrivalDate = new Date(departureDate);
            arrivalDate.setHours(departureDate.getHours() + durationHours);

            const segments = [];
            if (isDirect) {
                segments.push({
                    departure: { iataCode: params.origin, at: departureDate.toISOString() },
                    arrival: { iataCode: params.destination, at: arrivalDate.toISOString() },
                    carrierCode: carrier,
                    number: `${Math.floor(Math.random() * 9000) + 1000}`,
                    aircraft: { code: '737' },
                    duration: `PT${durationHours}H`,
                    numberOfStops: 0
                });
            } else {
                const midPointDate = new Date(departureDate);
                midPointDate.setHours(departureDate.getHours() + Math.floor(durationHours / 2));

                segments.push({
                    departure: { iataCode: params.origin, at: departureDate.toISOString() },
                    arrival: { iataCode: 'XYZ', at: midPointDate.toISOString() },
                    carrierCode: carrier,
                    number: `${Math.floor(Math.random() * 9000) + 1000}`,
                    aircraft: { code: '737' },
                    duration: `PT${Math.floor(durationHours / 2)}H`,
                    numberOfStops: 0
                });

                segments.push({
                    departure: { iataCode: 'XYZ', at: midPointDate.toISOString() },
                    arrival: { iataCode: params.destination, at: arrivalDate.toISOString() },
                    carrierCode: carrier,
                    number: `${Math.floor(Math.random() * 9000) + 1000}`,
                    aircraft: { code: '737' },
                    duration: `PT${Math.ceil(durationHours / 2)}H`,
                    numberOfStops: 0
                });
            }

            return {
                id: `${i + 1}`,
                type: 'flight-offer',
                source: 'GDS',
                instantTicketingRequired: false,
                nonStop: isDirect,
                oneWay: !params.returnDate,
                lastTicketingDate: '',
                numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
                itineraries: [{
                    duration: `PT${durationHours}H`,
                    segments
                }],
                price: {
                    currency: 'USD',
                    total: basePrice.toFixed(2),
                    base: (basePrice * 0.8).toFixed(2),
                    grandTotal: basePrice.toFixed(2)
                },
                pricingOptions: {
                    fareType: ['PUBLISHED'],
                    includedCheckedBagsOnly: Math.random() > 0.5
                },
                validatingAirlineCodes: [carrier],
                travelerPricings: [{
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'USD',
                        total: basePrice.toFixed(2),
                        base: (basePrice * 0.8).toFixed(2),
                        grandTotal: basePrice.toFixed(2)
                    },
                    fareDetailsBySegment: [{
                        segmentId: '1',
                        cabin: params.travelClass || 'ECONOMY',
                        fareBasis: 'Y',
                        class: 'Y',
                        includedCheckedBags: {
                            quantity: Math.random() > 0.5 ? 1 : 0
                        }
                    }]
                }]
            };
        });

        return {
            meta: { count, links: { self: '' } },
            data: flights,
            dictionaries: {
                locations: {},
                aircraft: {},
                currencies: { USD: 'US Dollar' },
                carriers: carrierNames
            }
        };
    }

    /**
     * Make authenticated request to Amadeus API
     */
    private async makeRequest<T>(
        method: 'GET' | 'POST',
        endpoint: string,
        params?: Record<string, any>
    ): Promise<T> {
        if (this.useMockData) {
            // Return mock data after a small delay to simulate network
            await new Promise(resolve => setTimeout(resolve, 800));

            if (endpoint.includes('locations')) {
                return this.getMockAirports(params?.keyword) as unknown as T;
            }
            if (endpoint.includes('flight-offers')) {
                return this.getMockFlights(params as unknown as SearchParams) as unknown as T;
            }
            return { data: [] } as unknown as T;
        }

        const token = await this.getAccessToken();

        // Re-check if we switched to mock mode during token fetch
        if (this.useMockData) {
            return this.makeRequest<T>(method, endpoint, params);
        }

        try {
            const response = await this.client.request<T>({
                method,
                url: endpoint,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: method === 'GET' ? params : undefined,
                data: method === 'POST' ? params : undefined,
            });

            return response.data;
        } catch (error: any) {
            console.error('API request failed, falling back to mock data:', error.message);
            this.useMockData = true; // Switch to mock mode on error
            return this.makeRequest<T>(method, endpoint, params);
        }
    }

    /**
     * Search for airports by keyword
     */
    async searchAirports(keyword: string): Promise<AirportSearchResponse> {
        if (!keyword || keyword.length < 2) {
            return { meta: { count: 0, links: { self: '' } }, data: [] };
        }

        return this.makeRequest<AirportSearchResponse>('GET', '/v1/reference-data/locations', {
            subType: 'AIRPORT,CITY',
            keyword,
            'page[limit]': 10,
        });
    }

    /**
     * Search for flight offers
     */
    async searchFlights(params: SearchParams): Promise<FlightSearchResponse> {
        const searchParams: Record<string, any> = {
            originLocationCode: params.origin,
            destinationLocationCode: params.destination,
            departureDate: params.departureDate,
            adults: params.adults,
            max: 50, // Limit results for better performance
        };

        // Add optional parameters
        if (params.returnDate) searchParams.returnDate = params.returnDate;
        if (params.children) searchParams.children = params.children;
        if (params.infants) searchParams.infants = params.infants;
        if (params.travelClass) searchParams.travelClass = params.travelClass;
        if (params.nonStop) searchParams.nonStop = true;
        if (params.maxPrice) searchParams.maxPrice = params.maxPrice;

        searchParams.currencyCode = 'USD';

        return this.makeRequest<FlightSearchResponse>(
            'GET',
            '/v2/shopping/flight-offers',
            searchParams
        );
    }

    /**
     * Get flight price analysis for date range (for graph)
     */
    async getFlightPriceAnalysis(
        origin: string,
        destination: string,
        departureDate: string
    ): Promise<any> {
        try {
            return this.makeRequest('GET', '/v1/shopping/flight-dates', {
                origin,
                destination,
                departureDate,
                oneWay: false,
                duration: 7,
                nonStop: false,
                viewBy: 'DATE',
            });
        } catch (error) {
            console.warn('Flight price analysis not available:', error);
            return { data: [] };
        }
    }
}

// Export singleton instance
export const amadeusClient = new AmadeusClient();
