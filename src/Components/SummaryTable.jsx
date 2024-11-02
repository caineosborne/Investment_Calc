import React from 'react';
import { Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
}));

const CompactCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(1.5),
    '&:last-child': {
        paddingBottom: theme.spacing(1.5),
    },
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
}));

const SmallTypography = styled(Typography)({
    fontSize: '0.75rem',
    lineHeight: 1.2,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: '0.25rem'
});

const ValueTypography = styled(Typography)({
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.2,
    textAlign: 'center'
});

const SummaryTable = ({ calculationResults }) => {
    const {
        returns,
        totalInitialInvestment,
        currentAge,
        goalReachedYear,
    } = calculationResults;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getAgeWhenBalanceReachesZero = (balanceType) => {
        const lastPositiveYear = returns.findLast(year => year[balanceType] > 0);
        return lastPositiveYear ? lastPositiveYear.age : 'N/A';
    };

    const retirementAge = currentAge + goalReachedYear - 1;
    const workingPhase = returns.slice(0, goalReachedYear);
    const retirementPhase = returns.slice(goalReachedYear);

    const getTotalSaved = () => {
        return workingPhase.reduce((sum, year) => sum + (year.investmentAmount - year.yearlyReturn), 0);
    };

    const getWorkingPhaseReturns = () => {
        return workingPhase.reduce((sum, year) => sum + year.yearlyReturn, 0);
    };

    const getRetirementPhaseSpent = () => {
        return retirementPhase.reduce((sum, year) => sum + (year.yearlySpend || 0), 0);
    };

    const getRetirementPhaseReturns = () => {
        return retirementPhase.reduce((sum, year) => sum + year.yearlyReturn, 0);
    };

    const summaryItems = [
        { label: 'Total Saved', value: formatCurrency(getTotalSaved()) },
        { label: 'Total Spent', value: formatCurrency(getRetirementPhaseSpent()) },
        { label: 'Current Age', value: currentAge },
        { label: 'Investment Returns (Working)', value: formatCurrency(getWorkingPhaseReturns()) },
        { label: 'Investment Returns (Retirement)', value: formatCurrency(getRetirementPhaseReturns()) },
        { label: 'Retirement Age', value: retirementAge },
        { label: 'Working Net Total', value: formatCurrency(getTotalSaved() + getWorkingPhaseReturns()) },
        { label: 'Retirement Net Total', value: formatCurrency(getRetirementPhaseReturns() - getRetirementPhaseSpent()) },
        { label: 'Depletion Age', value: getAgeWhenBalanceReachesZero('yearEndBalance') }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Investment Summary
            </Typography>
            <Grid container spacing={2}>
                {summaryItems.map((item, index) => (
                    <Grid item xs={4} key={index}>
                        <StyledCard>
                            <CompactCardContent>
                                <SmallTypography>
                                    {item.label}
                                </SmallTypography>
                                <ValueTypography>
                                    {item.value}
                                </ValueTypography>
                            </CompactCardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SummaryTable;