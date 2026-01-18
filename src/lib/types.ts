// TypeScript interfaces for the Flight Search Engine

export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  maxPrice?: number;
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
}

export interface Itinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Array<{
    amount: string;
    type: string;
  }>;
  grandTotal: string;
}

export interface Flight {
  id: string;
  type: string;
  source: string;
  instantTicketingRequired: boolean;
  nonStop: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: Price;
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
}

export interface FlightSearchResponse {
  meta: {
    count: number;
    links?: {
      self: string;
    };
  };
  data: Flight[];
  dictionaries: {
    locations: Record<string, {
      cityCode: string;
      countryCode: string;
    }>;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
  };
}

export interface PricePoint {
  price: number;
  count: number;
  label: string;
}

export interface FilterState {
  stops: number[];
  priceRange: [number, number];
  airlines: string[];
  departureTime: string[];
  arrivalTime: string[];
  maxDuration?: number;
  includedBaggage?: boolean;
}

export interface AirportSearchResponse {
  meta: {
    count: number;
    links: {
      self: string;
    };
  };
  data: Array<{
    type: string;
    subType: string;
    name: string;
    detailedName: string;
    id: string;
    self: {
      href: string;
      methods: string[];
    };
    timeZoneOffset: string;
    iataCode: string;
    geoCode: {
      latitude: number;
      longitude: number;
    };
    address: {
      cityName: string;
      cityCode: string;
      countryName: string;
      countryCode: string;
      regionCode: string;
    };
    analytics: {
      travelers: {
        score: number;
      };
    };
  }>;
}

export interface AmadeusAuthResponse {
  type: string;
  username: string;
  application_name: string;
  client_id: string;
  token_type: string;
  access_token: string;
  expires_in: number;
  state: string;
  scope: string;
}
