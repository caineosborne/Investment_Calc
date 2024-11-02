import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));
const InvestmentGraph = ({ data, isCoastingEnabled, coastingStartYear, goalReachedYear }) => {
    const formatCurrency = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
            return (value / 1000000).toFixed(3) + 'M';
        } else if (absValue >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toFixed(0);
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
        return Math.max(maxInvestment, maxSpending) * 1.1; // Add 10% for padding
    }, [data]);

    const riskyScenariosPresent = data.some(year =>
        year.yearEndBalance <= 0 || year.yearEndBalanceLow <= 0 || year.yearEndBalanceVeryLow <= 0
    );

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom>Investment Growth Over Time</Typography>
            <ResponsiveContainer width="100%" height={600}>
                <ComposedChart
                    data={data}
                    margin={{ top: 50, right: 50, left: 50, bottom: 50 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" label={{ value: 'Age', position: 'bottom', offset: 0 }} />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#82ca9d"
                        tickFormatter={formatCurrency}
                        label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#8884d8"
                        domain={[0, maxValue]}
                        tickFormatter={formatCurrency}
                        label={{ value: 'Investment/Spending Amount', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar yAxisId="right" dataKey="investmentAmount" fill="#8884d8" name="Investment Earnings" fillOpacity={0.3} />
                    <Bar yAxisId="right" dataKey="yearlySpend" fill="#ff6347" name="Yearly Spend" fillOpacity={0.3} />
                    <Line yAxisId="left" type="monotone" dataKey="yearEndBalance" stroke="#82ca9d" strokeWidth={3} name="Expected Returns" />
                    <Line yAxisId="left" type="monotone" dataKey="yearEndBalanceLow" stroke="#ffc658" strokeWidth={2} name="10% Lower Returns" />
                    <Line yAxisId="left" type="monotone" dataKey="yearEndBalanceVeryLow" stroke="#ff7300" strokeWidth={2} name="20% Lower Returns" />
                    {riskyScenariosPresent && (
                        <rect x="0" y="0" width="100%" height="100%" fill="rgba(255,0,0,0.1)" />
                    )}
                    {isCoastingEnabled && (
                        <ReferenceLine x={coastingStartYear} stroke="blue" strokeDasharray="3 3" yAxisId="left">
                            <Label value="Coasting Starts" position="top" />
                        </ReferenceLine>
                    )}
                    <ReferenceLine x={goalReachedYear} stroke="green" strokeDasharray="3 3" yAxisId="left">
                        <Label value="Retirement Starts" position="top" />
                    </ReferenceLine>
                </ComposedChart>
            </ResponsiveContainer>
        </StyledPaper>
    );
};

export default InvestmentGraph;