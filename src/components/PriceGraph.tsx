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
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                    <p className="text-slate-900 font-bold mb-1">{payload[0].payload.label}</p>
                    <p className="text-blue-600 text-xs font-semibold">
                        {payload[0].value} {payload[0].value === 1 ? 'flight' : 'flights'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="swiss-card bg-white p-6 fade-in shadow-sm border border-slate-100/50">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Price Trends</h3>
                <p className="text-xs text-slate-500 font-medium">
                    Distribution based on {flights.length} results
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        label={{ value: 'Flights', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
                <div className="px-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cheapest</div>
                    <div className="text-lg font-extrabold text-emerald-600">
                        {formatPrice(Math.min(...flights.map(f => parseFloat(f.price.total))), currency)}
                    </div>
                </div>
                <div className="px-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Average</div>
                    <div className="text-lg font-extrabold text-blue-600">
                        {formatPrice(
                            flights.reduce((sum, f) => sum + parseFloat(f.price.total), 0) / flights.length,
                            currency
                        )}
                    </div>
                </div>
                <div className="px-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Max</div>
                    <div className="text-lg font-extrabold text-slate-600">
                        {formatPrice(Math.max(...flights.map(f => parseFloat(f.price.total))), currency)}
                    </div>
                </div>
            </div>
        </div>
    );
}
