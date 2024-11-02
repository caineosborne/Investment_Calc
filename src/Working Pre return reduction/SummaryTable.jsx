// SummaryTable.jsx

import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const SummaryTypography = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(1, 0),
}));

const SummaryTable = ({ calculationResults }) => {
    const {
        totalInitialInvestment,
        totalMonthlyContributions,
        finalYear,
        returns
    } = calculationResults;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const getAgeWhenBalanceReachesZero = (balanceType) => {
        const lastPositiveYear = returns.findLast(year => year[balanceType] > 0);
        return lastPositiveYear ? lastPositiveYear.age : 'N/A';
    };

    const getTotalReturns = (balanceType) => {
        return finalYear[balanceType] - finalYear.totalContributions;
    };

    return (
        <StyledCard>
            <CardContent>
                <Typography variant="h6" gutterBottom>Investment Summary</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Initial Information</Typography>
                                <SummaryTypography>Total Initial Investment: {formatCurrency(totalInitialInvestment)}</SummaryTypography>
                                <SummaryTypography>Total Monthly Contributions: {formatCurrency(totalMonthlyContributions)}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Retirement Milestones</Typography>
                                <SummaryTypography>Age at Retirement: {returns.find(year => year.isGoalReached)?.age || 'N/A'}</SummaryTypography>
                                <SummaryTypography>Age when Funds Depleted (Expected Returns): {getAgeWhenBalanceReachesZero('yearEndBalance')}</SummaryTypography>
                                <SummaryTypography>Age when Funds Depleted (10% Lower Returns): {getAgeWhenBalanceReachesZero('yearEndBalanceLow')}</SummaryTypography>
                                <SummaryTypography>Age when Funds Depleted (20% Lower Returns): {getAgeWhenBalanceReachesZero('yearEndBalanceVeryLow')}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Final Amounts</Typography>
                                <SummaryTypography>Final Amount (Nominal): {formatCurrency(finalYear.yearEndBalance)}</SummaryTypography>
                                <SummaryTypography>Final Amount (10% Lower Returns): {formatCurrency(finalYear.yearEndBalanceLow)}</SummaryTypography>
                                <SummaryTypography>Final Amount (20% Lower Returns): {formatCurrency(finalYear.yearEndBalanceVeryLow)}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Inflation Adjusted Final Amounts</Typography>
                                <SummaryTypography>Inflation Adjusted: {formatCurrency(finalYear.inflationAdjustedTotal)}</SummaryTypography>
                                <SummaryTypography>Inflation Adjusted (10% Lower Returns): {formatCurrency(finalYear.inflationAdjustedTotalLow)}</SummaryTypography>
                                <SummaryTypography>Inflation Adjusted (20% Lower Returns): {formatCurrency(finalYear.inflationAdjustedTotalVeryLow)}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Total Returns</Typography>
                                <SummaryTypography>Total Contributions: {formatCurrency(finalYear.totalContributions)}</SummaryTypography>
                                <SummaryTypography>Total Returns: {formatCurrency(getTotalReturns('yearEndBalance'))}</SummaryTypography>
                                <SummaryTypography>Total Returns (10% Lower): {formatCurrency(getTotalReturns('yearEndBalanceLow'))}</SummaryTypography>
                                <SummaryTypography>Total Returns (20% Lower): {formatCurrency(getTotalReturns('yearEndBalanceVeryLow'))}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

export default SummaryTable;