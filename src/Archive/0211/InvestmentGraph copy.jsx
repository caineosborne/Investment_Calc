import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Box } from '@mui/material';

const InvestmentGraph = ({ data, isCoastingEnabled, coastingStartYear, goalReachedYear }) => {
    const formatCurrency = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (absValue >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value.toFixed(0);
    };

    const formatAxisTick = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (absValue >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    <p>{`Age: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: $${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const maxValue = useMemo(() => {
        const maxInvestment = Math.max(...data.map(item => item.investmentAmount));
        const maxSpending = Math.max(...data.map(item => item.yearlySpend || 0));
        return Math.max(maxInvestment, maxSpending) * 1.1;
    }, [data]);

    const riskyScenariosPresent = data.some(year =>
        year.yearEndBalance <= 0 || year.yearEndBalanceLow <= 0 || year.yearEndBalanceVeryLow <= 0
    );

    return (
        <Box sx={{ height: '100%', width: '100%', pb: 4 }}>
            <ResponsiveContainer width="100%" height={500}>
                <ComposedChart
                    data={data}
                    margin={{ top: 20, right: 65, left: 65, bottom: 45 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="age"
                        interval={4}
                        label={{
                            value: 'Age',
                            position: 'bottom',
                            offset: 0
                        }}
                    />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#82ca9d"
                        tickFormatter={formatAxisTick}
                        label={{
                            value: 'Portfolio Value',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -50,
                            style: { textAnchor: 'middle' }
                        }}
                        tickCount={8}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#8884d8"
                        domain={[0, maxValue]}
                        tickFormatter={formatAxisTick}
                        label={{
                            value: 'Investment/Spending',
                            angle: 90,
                            position: 'insideRight',
                            offset: -40,
                            style: { textAnchor: 'middle' }
                        }}
                        tickCount={8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{
                            bottom: -20,
                            fontSize: '0.75rem',
                            lineHeight: '1'
                        }}
                    />
                    <Bar
                        yAxisId="right"
                        dataKey="investmentAmount"
                        fill="#8884d8"
                        name="Investment Earnings"
                        fillOpacity={0.5}
                        barSize={20}
                    />
                    <Bar
                        yAxisId="right"
                        dataKey="yearlySpend"
                        fill="#ff6347"
                        name="Yearly Spend"
                        fillOpacity={0.5}
                        barSize={20}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="yearEndBalance"
                        stroke="#82ca9d"
                        strokeWidth={4}
                        name="Expected Returns"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="yearEndBalanceLow"
                        stroke="#ffc658"
                        strokeWidth={3}
                        name="10% Lower Returns"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="yearEndBalanceVeryLow"
                        stroke="#ff7300"
                        strokeWidth={3}
                        name="20% Lower Returns"
                    />
                    {riskyScenariosPresent && (
                        <rect x="0" y="0" width="100%" height="100%" fill="rgba(255,0,0,0.1)" />
                    )}
                    {isCoastingEnabled && (
                        <ReferenceLine
                            x={coastingStartYear}
                            stroke="blue"
                            strokeDasharray="3 3"
                            yAxisId="left"
                        >
                            <Label
                                value="Coasting Starts"
                                position="top"
                                offset={-20}
                            />
                        </ReferenceLine>
                    )}
                    <ReferenceLine
                        x={goalReachedYear}
                        stroke="green"
                        strokeDasharray="3 3"
                        yAxisId="left"
                    >
                        <Label
                            value="Retirement Starts"
                            position="top"
                            offset={isCoastingEnabled && Math.abs(coastingStartYear - goalReachedYear) <= 2 ? -40 : -20}
                        />
                    </ReferenceLine>
                </ComposedChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default InvestmentGraph;