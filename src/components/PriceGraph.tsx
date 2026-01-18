'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { Flight } from '@/lib/types';

interface PriceGraphProps {
    flights: Flight[];
    currency?: string;
}

export default function PriceGraph({ flights, currency = 'USD' }: PriceGraphProps) {
    const chartData = useMemo(() => {
        if (flights.length === 0) return [];

        // Group flights by price ranges
        const prices = flights.map(f => parseFloat(f.price.total)).sort((a, b) => a - b);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const bucketCount = Math.min(15, flights.length);
        const bucketSize = (maxPrice - minPrice) / bucketCount;

        const buckets = Array.from({ length: bucketCount }, (_, i) => {
            const bucketMin = minPrice + i * bucketSize;
            const bucketMax = minPrice + (i + 1) * bucketSize;
            const count = prices.filter(p => p >= bucketMin && p < bucketMax).length;

            return {
                price: Math.round(bucketMin),
                count,
                label: formatPrice(bucketMin, currency),
            };
        });

        return buckets;
    }, [flights, currency]);

    if (chartData.length === 0) {
        return (
            <div className="glass-card h-80 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No price data available</p>
                    <p className="text-sm mt-2">Search for flights to see price trends</p>
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 border border-white/20">
                    <p className="text-white font-semibold">{payload[0].payload.label}</p>
                    <p className="text-blue-400 text-sm">
                        {payload[0].value} {payload[0].value === 1 ? 'flight' : 'flights'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-card fade-in">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Price Distribution</h3>
                <p className="text-sm text-gray-400">
                    Real-time price trends across {flights.length} available flights
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="label"
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        label={{ value: 'Number of Flights', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#667eea"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={800}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="glass p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Cheapest</div>
                    <div className="text-lg font-bold text-green-400">
                        {formatPrice(Math.min(...flights.map(f => parseFloat(f.price.total))), currency)}
                    </div>
                </div>
                <div className="glass p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Average</div>
                    <div className="text-lg font-bold text-blue-400">
                        {formatPrice(
                            flights.reduce((sum, f) => sum + parseFloat(f.price.total), 0) / flights.length,
                            currency
                        )}
                    </div>
                </div>
                <div className="glass p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Most Expensive</div>
                    <div className="text-lg font-bold text-purple-400">
                        {formatPrice(Math.max(...flights.map(f => parseFloat(f.price.total))), currency)}
                    </div>
                </div>
            </div>
        </div>
    );
}
