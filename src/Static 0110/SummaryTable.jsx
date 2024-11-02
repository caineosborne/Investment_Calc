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
        returns,
        totalInitialInvestment,
        totalMonthlyContributions,
        goalReachedYear,
        currentAge
    } = calculationResults;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const getAgeWhenBalanceReachesZero = (balanceType) => {
        const lastPositiveYear = returns.findLast(year => year[balanceType] > 0);
        return lastPositiveYear ? lastPositiveYear.age : 'N/A';
    };

    const getTotalSaved = () => {
        return returns.slice(0, goalReachedYear).reduce((sum, year) => sum + year.investmentAmount, 0);
    };

    const getWorkingPhaseReturns = () => {
        const finalWorkingYear = returns[goalReachedYear - 1];
        return finalWorkingYear.yearEndBalance - totalInitialInvestment - getTotalSaved();
    };

    const getRetirementPhaseSpent = () => {
        return returns.slice(goalReachedYear).reduce((sum, year) => sum + (year.yearlySpend || 0), 0);
    };

    const getRetirementPhaseReturns = () => {
        const finalYear = returns[returns.length - 1];
        const retirementStartBalance = returns[goalReachedYear - 1].yearEndBalance;
        return finalYear.yearEndBalance - retirementStartBalance + getRetirementPhaseSpent();
    };

    return (
        <StyledCard>
            <CardContent>
                <Typography variant="h6" gutterBottom>Investment Summary</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Working Phase (Until Age {goalReachedYear + currentAge - 1})</Typography>
                                <SummaryTypography>Total Saved: {formatCurrency(getTotalSaved())}</SummaryTypography>
                                <SummaryTypography>Total Investment Returns: {formatCurrency(getWorkingPhaseReturns())}</SummaryTypography>
                                <SummaryTypography>Net Total: {formatCurrency(getTotalSaved() + getWorkingPhaseReturns())}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Retirement Phase</Typography>
                                <SummaryTypography>Total Spent: {formatCurrency(getRetirementPhaseSpent())}</SummaryTypography>
                                <SummaryTypography>Total Investment Returns: {formatCurrency(getRetirementPhaseReturns())}</SummaryTypography>
                                <SummaryTypography>Net Total: {formatCurrency(getRetirementPhaseReturns() - getRetirementPhaseSpent())}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>Money Depletion Age</Typography>
                                <SummaryTypography>Base Case: {getAgeWhenBalanceReachesZero('yearEndBalance')}</SummaryTypography>
                                <SummaryTypography>10% Lower Returns: {getAgeWhenBalanceReachesZero('yearEndBalanceLow')}</SummaryTypography>
                                <SummaryTypography>20% Lower Returns: {getAgeWhenBalanceReachesZero('yearEndBalanceVeryLow')}</SummaryTypography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

export default SummaryTable;