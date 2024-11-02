import React, { useState, useMemo } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Divider, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/system';

// Styled components for better formatting
// These create new components based on MUI components but with custom styles
const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const SummaryTypography = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(1, 0),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(4),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

// The main component for the Investment Calculator
const InvestmentCalculator = () => {
    // State to store the list of investments
    // useState is a React Hook that lets you add state to functional components
    const [investments, setInvestments] = useState([
        { id: 1, name: 'Investment 1', balance: 0, returnRate: 7, monthlySavings: 0 }
    ]);

    // State to store the retirement goal and inflation rate
    const [retirementGoal, setRetirementGoal] = useState(1000000);
    const [inflationRate, setInflationRate] = useState(2);

    // Function to handle changes in investment inputs
    const handleInputChange = (id, field, value) => {
        // setInvestments updates the state of investments
        // We use map to create a new array, which is important for React's state management
        setInvestments(investments.map(inv =>
            // If the investment's id matches the id we're updating...
            inv.id === id
                // Create a new object with all properties of the original investment (using the spread operator ...)
                // Then override the specified field with the new value
                ? { ...inv, [field]: field === 'name' ? value : Number(value) }
                // If it's not the investment we're updating, return it unchanged
                : inv
        ));
    };

    // Function to add a new investment
    const addInvestment = () => {
        // Find the highest current id and add 1 to create a unique id
        const newId = Math.max(...investments.map(inv => inv.id)) + 1;
        // Create a new array with all existing investments plus the new one
        setInvestments([...investments, { id: newId, name: `Investment ${newId}`, balance: 0, returnRate: 7, monthlySavings: 0 }]);
    };

    // Function to remove an investment
    const removeInvestment = (id) => {
        // Only remove if there's more than one investment
        if (investments.length > 1) {
            // Filter out the investment with the matching id
            setInvestments(investments.filter(inv => inv.id !== id));
        }
    };

    // Calculate investment returns over time
    // useMemo is used to memoize the calculation, so it only recalculates when its dependencies change
    const calculateReturns = useMemo(() => {
        const returns = [];
        let year = 0;
        let totalBalance = 0;
        let goalReached = false;
        let yearsAfterGoal = 0;

        //reduce an array to a single value - using the call back function 
        let totalContributions = investments.reduce((sum, inv) => sum + inv.balance, 0);
        const inflationAdjustedGoal = retirementGoal;

        while (year < 100 && yearsAfterGoal < 5) { // Limit to 100 years and 5 years after goal
            year++;
            const yearReturn = { year };
            totalBalance = 0;
            let yearlyContributions = 0;

            investments.forEach((inv, index) => {
                const { balance, returnRate, monthlySavings } = inv;
                const previousBalance = year === 1 ? balance : returns[year - 2][`investment${index + 1}`];
                const yearlyReturn = previousBalance * (1 + returnRate / 100) +
                    monthlySavings * 12 * (1 + returnRate / 200); // Assume savings are invested mid-year
                yearReturn[`investment${index + 1}`] = yearlyReturn;
                totalBalance += yearlyReturn;
                yearlyContributions += monthlySavings * 12;
            });

            totalContributions += yearlyContributions;
            yearReturn.total = totalBalance;
            yearReturn.totalContributions = totalContributions;
            yearReturn.inflationAdjustedTotal = totalBalance / Math.pow(1 + inflationRate / 100, year);
            returns.push(yearReturn);

            if (yearReturn.inflationAdjustedTotal >= inflationAdjustedGoal) {
                if (!goalReached) {
                    goalReached = true;
                    yearReturn.isGoalReached = true;
                }
                yearsAfterGoal++;
            }
        }

        return returns;
    }, [investments, retirementGoal, inflationRate]);

    // Find the year when the retirement goal is reached
    const yearsToRetirement = calculateReturns.findIndex(year => year.isGoalReached) + 1;

    // Format currency values for display
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    // Calculate summary statistics
    const totalInitialInvestment = investments.reduce((sum, inv) => sum + inv.balance, 0);
    const totalMonthlyContributions = investments.reduce((sum, inv) => sum + inv.monthlySavings, 0);
    const finalAmount = calculateReturns[yearsToRetirement - 1]?.total || 0;
    const inflationAdjustedFinalAmount = calculateReturns[yearsToRetirement - 1]?.inflationAdjustedTotal || 0;
    const totalContributions = calculateReturns[yearsToRetirement - 1]?.totalContributions || 0;
    const totalReturns = finalAmount - totalContributions;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom align="center">Investment Calculator</Typography>

            {/* Investment inputs */}
            {/* We use map to create a set of inputs for each investment */}
            {investments.map((inv) => (
                <StyledCard key={inv.id}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Investment Name"
                                    value={inv.name}
                                    onChange={(e) => handleInputChange(inv.id, 'name', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Current Balance"
                                    value={inv.balance}
                                    onChange={(e) => handleInputChange(inv.id, 'balance', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Return Rate (%)"
                                    value={inv.returnRate}
                                    onChange={(e) => handleInputChange(inv.id, 'returnRate', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Monthly Savings"
                                    value={inv.monthlySavings}
                                    onChange={(e) => handleInputChange(inv.id, 'monthlySavings', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => removeInvestment(inv.id)}
                                    disabled={investments.length === 1}
                                    fullWidth
                                >
                                    Remove
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>
            ))}

            <Button variant="contained" color="primary" onClick={addInvestment} fullWidth>
                Add Investment
            </Button>

            {/* Retirement goal and inflation rate inputs */}
            <StyledCard>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Retirement Goal (Today's Dollars)"
                                value={retirementGoal}
                                onChange={(e) => setRetirementGoal(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Inflation Rate (%)"
                                value={inflationRate}
                                onChange={(e) => setInflationRate(Number(e.target.value))}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </StyledCard>

            {/* Summary section */}
            <StyledCard>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Investment Summary</Typography>
                    <Divider />
                    <SummaryTypography>Total Initial Investment: {formatCurrency(totalInitialInvestment)}</SummaryTypography>
                    <SummaryTypography>Total Monthly Contributions: {formatCurrency(totalMonthlyContributions)}</SummaryTypography>
                    <SummaryTypography>Years to Retirement: {yearsToRetirement}</SummaryTypography>
                    <SummaryTypography>Final Amount (Nominal): {formatCurrency(finalAmount)}</SummaryTypography>
                    <SummaryTypography>Final Amount (Inflation Adjusted): {formatCurrency(inflationAdjustedFinalAmount)}</SummaryTypography>
                    <SummaryTypography>Total Contributions: {formatCurrency(totalContributions)}</SummaryTypography>
                    <SummaryTypography>Total Returns: {formatCurrency(totalReturns)}</SummaryTypography>
                </CardContent>
            </StyledCard>

            {/* Results table */}
            <StyledTableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Year</TableCell>
                            {investments.map((inv) => (
                                <TableCell key={inv.id}>{inv.name}</TableCell>
                            ))}
                            <TableCell>Total</TableCell>
                            <TableCell>Inflation Adjusted Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {calculateReturns.map((row) => (
                            <TableRow
                                key={row.year}
                                sx={row.isGoalReached ? { backgroundColor: 'rgba(76, 175, 80, 0.1)' } : {}}
                            >
                                <TableCell>{row.year}</TableCell>
                                {investments.map((inv, index) => (
                                    <TableCell key={inv.id}>
                                        {formatCurrency(row[`investment${index + 1}`])}
                                    </TableCell>
                                ))}
                                <TableCell>{formatCurrency(row.total)}</TableCell>
                                <TableCell>{formatCurrency(row.inflationAdjustedTotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>
        </Container>
    );
};

export default InvestmentCalculator;