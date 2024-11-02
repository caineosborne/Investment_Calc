import React, { useState, useMemo } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Divider, Card, CardContent, Switch, FormControlLabel
} from '@mui/material';
import { styled } from '@mui/system';

// Styled components for better formatting
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
    const [investments, setInvestments] = useState([
        { id: 1, name: 'Investment 1', balance: 0, returnRate: 7, monthlySavings: 0 }
    ]);

    // State to store the retirement goal, inflation rate, monthly retirement spend, and current age
    const [retirementGoal, setRetirementGoal] = useState(1000000);
    const [inflationRate, setInflationRate] = useState(2);
    const [monthlyRetirementSpend, setMonthlyRetirementSpend] = useState(2000);
    const [currentAge, setCurrentAge] = useState(30);

    // State for toggling columns and summary
    const [showInflationAdjusted, setShowInflationAdjusted] = useState(true);
    const [showInvestmentDetails, setShowInvestmentDetails] = useState(true);
    const [showSummary, setShowSummary] = useState(true);

    // Function to handle changes in investment inputs
    const handleInputChange = (id, field, value) => {
        setInvestments(investments.map(inv =>
            inv.id === id ? { ...inv, [field]: field === 'name' ? value : Number(value) } : inv
        ));
    };

    // Function to add a new investment
    const addInvestment = () => {
        const newId = Math.max(...investments.map(inv => inv.id)) + 1;
        setInvestments([...investments, { id: newId, name: `Investment ${newId}`, balance: 0, returnRate: 7, monthlySavings: 0 }]);
    };

    // Function to remove an investment
    const removeInvestment = (id) => {
        if (investments.length > 1) {
            setInvestments(investments.filter(inv => inv.id !== id));
        }
    };

    // Calculate investment returns over time
    const calculateReturns = useMemo(() => {
        const returns = [];
        let year = 0;
        let goalReached = false;
        let goalReachedYear = 0;
        let zeroBalanceYear = null;
        let totalContributions = investments.reduce((sum, inv) => sum + inv.balance, 0);
        let currentBalance = totalContributions;

        while (year < 100) {
            year++;
            const currentYear = {
                year,
                age: currentAge + year - 1,
                status: goalReached ? 'Retirement' : 'Working',
                investments: {}
            };
            const inflationFactor = Math.pow(1 + inflationRate / 100, year);

            // Apply compound interest to get balance before spend
            let balanceBeforeSpend = currentBalance * (1 + investments[0].returnRate / 100);
            currentYear.balanceBeforeSpend = balanceBeforeSpend;

            // Add monthly savings if not retired
            if (!goalReached) {
                let totalSavings = investments.reduce((sum, inv) => sum + inv.monthlySavings * 12, 0);
                balanceBeforeSpend += totalSavings;
                totalContributions += totalSavings;
            }

            // Apply yearly spend if retired
            if (goalReached) {
                const yearlySpend = monthlyRetirementSpend * 12 * inflationFactor;
                currentYear.yearlySpend = yearlySpend;
                currentBalance = balanceBeforeSpend - yearlySpend;

                if (currentBalance <= 0 && zeroBalanceYear === null) {
                    zeroBalanceYear = year;
                    currentYear.isZeroBalance = true;
                    currentBalance = 0;
                }
            } else {
                currentBalance = balanceBeforeSpend;
            }

            currentYear.yearEndBalance = currentBalance;
            currentYear.totalContributions = totalContributions;
            currentYear.inflationAdjustedTotal = currentBalance / inflationFactor;

            if (!goalReached && currentYear.inflationAdjustedTotal >= retirementGoal) {
                goalReached = true;
                goalReachedYear = year;
                currentYear.isGoalReached = true;
            }

            // Update investment details
            investments.forEach(inv => {
                currentYear.investments[inv.id] = currentBalance; // For simplicity, we're assigning the total balance to each investment
            });

            returns.push(currentYear);

            if (currentBalance <= 0) break;
        }

        return { returns, goalReachedYear, zeroBalanceYear };
    }, [investments, retirementGoal, inflationRate, monthlyRetirementSpend, currentAge]);

    // Format currency values for display
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    // Calculate summary statistics
    const totalInitialInvestment = investments.reduce((sum, inv) => sum + inv.balance, 0);
    const totalMonthlyContributions = investments.reduce((sum, inv) => sum + inv.monthlySavings, 0);
    const { returns, goalReachedYear, zeroBalanceYear } = calculateReturns;
    const finalAmount = returns[returns.length - 1]?.yearEndBalance || 0;
    const inflationAdjustedFinalAmount = returns[returns.length - 1]?.inflationAdjustedTotal || 0;
    const totalContributions = returns[returns.length - 1]?.totalContributions || 0;
    const totalReturns = finalAmount - totalContributions;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom align="center">Investment Calculator</Typography>

            {/* Investment inputs */}
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

            {/* Retirement goal, inflation rate, monthly retirement spend, and age inputs */}
            <StyledCard>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Retirement Goal (Today's Dollars)"
                                value={retirementGoal}
                                onChange={(e) => setRetirementGoal(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Inflation Rate (%)"
                                value={inflationRate}
                                onChange={(e) => setInflationRate(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Monthly Retirement Spend"
                                value={monthlyRetirementSpend}
                                onChange={(e) => setMonthlyRetirementSpend(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Current Age"
                                value={currentAge}
                                onChange={(e) => setCurrentAge(Number(e.target.value))}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </StyledCard>

            {/* Toggle switches for columns and summary */}
            <Box sx={{ my: 2 }}>
                <FormControlLabel
                    control={<Switch checked={showSummary} onChange={(e) => setShowSummary(e.target.checked)} />}
                    label="Show Summary"
                />
                <FormControlLabel
                    control={<Switch checked={showInvestmentDetails} onChange={(e) => setShowInvestmentDetails(e.target.checked)} />}
                    label="Show Investment Details"
                />
                <FormControlLabel
                    control={<Switch checked={showInflationAdjusted} onChange={(e) => setShowInflationAdjusted(e.target.checked)} />}
                    label="Show Inflation Adjusted Total"
                />
            </Box>

            {/* Summary section */}
            {showSummary && (
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Investment Summary</Typography>
                        <Divider />
                        <SummaryTypography>Total Initial Investment: {formatCurrency(totalInitialInvestment)}</SummaryTypography>
                        <SummaryTypography>Total Monthly Contributions: {formatCurrency(totalMonthlyContributions)}</SummaryTypography>
                        <SummaryTypography>Age at Retirement: {currentAge + goalReachedYear - 1}</SummaryTypography>
                        {zeroBalanceYear && (
                            <SummaryTypography>Age when Funds Depleted: {currentAge + zeroBalanceYear - 1}</SummaryTypography>
                        )}
                        <SummaryTypography>Final Amount (Nominal): {formatCurrency(finalAmount)}</SummaryTypography>
                        <SummaryTypography>Final Amount (Inflation Adjusted): {formatCurrency(inflationAdjustedFinalAmount)}</SummaryTypography>
                        <SummaryTypography>Total Contributions: {formatCurrency(totalContributions)}</SummaryTypography>
                        <SummaryTypography>Total Returns: {formatCurrency(totalReturns)}</SummaryTypography>
                    </CardContent>
                </StyledCard>
            )}

            {/* Results table */}
            <StyledTableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Year</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Status</TableCell>
                            {showInvestmentDetails && investments.map((inv) => (
                                <TableCell key={inv.id}>{inv.name}</TableCell>
                            ))}
                            <TableCell>Balance Before Spend</TableCell>
                            <TableCell>Yearly Spend</TableCell>
                            <TableCell>Year End Balance</TableCell>
                            {showInflationAdjusted && <TableCell>Inflation Adjusted Total</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {returns.map((row) => (
                            <TableRow
                                key={row.year}
                                sx={row.isGoalReached ? { backgroundColor: 'rgba(76, 175, 80, 0.1)' } :
                                    row.isZeroBalance ? { backgroundColor: 'rgba(244, 67, 54, 0.1)' } : {}}
                            >
                                <TableCell>{row.year}</TableCell>
                                <TableCell>{row.age}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                {showInvestmentDetails && investments.map((inv) => (
                                    <TableCell key={inv.id}>{formatCurrency(row.investments[inv.id])}</TableCell>
                                ))}
                                <TableCell>{formatCurrency(row.balanceBeforeSpend)}</TableCell>
                                <TableCell>{row.yearlySpend ? formatCurrency(row.yearlySpend) : '-'}</TableCell>
                                <TableCell>{formatCurrency(row.yearEndBalance)}</TableCell>
                                {showInflationAdjusted && <TableCell>{formatCurrency(row.inflationAdjustedTotal)}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>
        </Container>
    );
};

export default InvestmentCalculator;