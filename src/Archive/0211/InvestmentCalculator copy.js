import React, { useState, useMemo, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    FormControlLabel,
    Switch,
    Grid // Added Grid import
} from '@mui/material';
import InputForm from './InputForm';
import SummaryTable from './SummaryTable';
import ResultsTable from './ResultsTable';
import InvestmentGraph from './InvestmentGraph';

const InvestmentCalculator = () => {
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);
    const [investments, setInvestments] = useState([
        { id: 1, name: 'Investment 1', balance: 600000, returnRate: 7, monthlySavings: 4000 },
    ]);

    const [retirementGoal, setRetirementGoal] = useState(1800000);
    const [retirementAge, setRetirementAge] = useState(55);
    const [useAgeForRetirement, setUseAgeForRetirement] = useState(true);
    const [inflationRate, setInflationRate] = useState(2);
    const [monthlyRetirementSpend, setMonthlyRetirementSpend] = useState(5000);
    const [currentAge, setCurrentAge] = useState(43);
    const [isCoastingEnabled, setIsCoastingEnabled] = useState(false);
    const [coastingYears, setCoastingYears] = useState(0);

    const [monthlyPensionAmount, setMonthlyPensionAmount] = useState(0);
    const [pensionStartAge, setPensionStartAge] = useState(65);


    const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);
    const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);
    const [showLowerReturnScenarios, setShowLowerReturnScenarios] = useState(false);


    const [showSummary] = useState(true);
    const [showGraph] = useState(true);
    const [showResultsTable, setShowResultsTable] = useState(false);



    const getInitialBalance = useCallback((investments) => {
        return investments.reduce((sum, inv) => sum + inv.balance, 0);
    }, []);

    const calculationResults = useMemo(() => {
        setIsCalculating(true);
        setError(null);

        try {
            const investmentsCopy = JSON.parse(JSON.stringify(investments));
            let totalBalance = getInitialBalance(investmentsCopy);
            let totalBalanceLow = totalBalance;
            let totalBalanceVeryLow = totalBalance;
            let totalContributions = totalBalance;

            const initialInflationAdjustedTotal = totalBalance;
            let goalReached = useAgeForRetirement ?
                currentAge >= retirementAge :
                initialInflationAdjustedTotal >= retirementGoal;

            const aggregatedResults = [];

            for (let year = 0; year < 60; year++) {
                const currentYear = {
                    year: year + 1,
                    age: currentAge + year + 1,
                    status: goalReached ? 'Retirement' :
                        (isCoastingEnabled && year + 1 > coastingYears ? 'Coasting' : 'Working'),
                    investments: {},
                    openingBalance: totalBalance,
                    yearlySpend: 0,
                    investmentAmount: 0,
                    yearEndBalance: 0,
                    yearEndBalanceLow: 0,
                    yearEndBalanceVeryLow: 0,
                    pensionAmount: 0,
                    yearlyReturn: 0,
                    yearlyReturnLow: 0,
                    yearlyReturnVeryLow: 0,
                };

                const inflationFactor = Math.pow(1 + inflationRate / 100, year + 1);
                let yearlyReturn = 0;
                let yearlyReturnLow = 0;
                let yearlyReturnVeryLow = 0;
                let monthlySavings = 0;

                investmentsCopy.forEach((inv) => {
                    const invReturn = inv.balance * (inv.returnRate / 100);
                    const invReturnLow = inv.balance * (inv.returnRate * 0.9 / 100);
                    const invReturnVeryLow = inv.balance * (inv.returnRate * 0.8 / 100);

                    yearlyReturn += invReturn;
                    yearlyReturnLow += invReturnLow;
                    yearlyReturnVeryLow += invReturnVeryLow;

                    if (currentYear.status === 'Working') {
                        monthlySavings += inv.monthlySavings * 12;
                    }

                    currentYear.investments[inv.id] = inv.balance + invReturn +
                        (currentYear.status === 'Working' ? inv.monthlySavings * 12 : 0);
                });

                currentYear.yearlyReturn = yearlyReturn;
                currentYear.yearlyReturnLow = yearlyReturnLow;
                currentYear.yearlyReturnVeryLow = yearlyReturnVeryLow;
                currentYear.investmentAmount = yearlyReturn + monthlySavings;

                if (currentYear.age >= pensionStartAge) {
                    currentYear.pensionAmount = monthlyPensionAmount * 12 * inflationFactor;
                }

                if (goalReached) {
                    currentYear.yearlySpend = monthlyRetirementSpend * 12 * inflationFactor;
                    currentYear.yearlySpend = Math.max(0, currentYear.yearlySpend - currentYear.pensionAmount);

                    let remainingSpend = currentYear.yearlySpend;
                    for (let i = 0; i < investmentsCopy.length && remainingSpend > 0; i++) {
                        if (currentYear.investments[investmentsCopy[i].id] >= remainingSpend) {
                            currentYear.investments[investmentsCopy[i].id] -= remainingSpend;
                            remainingSpend = 0;
                        } else {
                            remainingSpend -= currentYear.investments[investmentsCopy[i].id];
                            currentYear.investments[investmentsCopy[i].id] = 0;
                        }
                    }
                }

                totalBalance = Object.values(currentYear.investments).reduce((sum, balance) => sum + balance, 0);
                totalBalanceLow += yearlyReturnLow + monthlySavings - (goalReached ? currentYear.yearlySpend : 0);
                totalBalanceVeryLow += yearlyReturnVeryLow + monthlySavings - (goalReached ? currentYear.yearlySpend : 0);

                currentYear.yearEndBalance = totalBalance;
                currentYear.yearEndBalanceLow = Math.max(0, totalBalanceLow);
                currentYear.yearEndBalanceVeryLow = Math.max(0, totalBalanceVeryLow);
                currentYear.inflationAdjustedTotal = totalBalance / inflationFactor;
                currentYear.inflationAdjustedTotalLow = totalBalanceLow / inflationFactor;
                currentYear.inflationAdjustedTotalVeryLow = totalBalanceVeryLow / inflationFactor;

                if (year === 0 && goalReached) {
                    currentYear.isGoalReached = true;
                } else if (!goalReached) {
                    if (useAgeForRetirement) {
                        if (currentYear.age >= retirementAge) {
                            goalReached = true;
                            currentYear.isGoalReached = true;
                        }
                    } else {
                        if (currentYear.inflationAdjustedTotal >= retirementGoal) {
                            goalReached = true;
                            currentYear.isGoalReached = true;
                        }
                    }
                }

                currentYear.isRisky = totalBalance <= 0 || totalBalanceLow <= 0 || totalBalanceVeryLow <= 0;
                currentYear.totalContributions = totalContributions + (monthlySavings * (year + 1));

                investmentsCopy.forEach((inv) => {
                    inv.balance = currentYear.investments[inv.id];
                });

                aggregatedResults.push(currentYear);

                if (totalBalance <= 0 && totalBalanceLow <= 0 && totalBalanceVeryLow <= 0) break;
            }

            return {
                returns: aggregatedResults,
                totalInitialInvestment: investments.reduce((sum, inv) => sum + inv.balance, 0),
                totalMonthlyContributions: investments.reduce((sum, inv) => sum + inv.monthlySavings, 0),
                finalYear: aggregatedResults[aggregatedResults.length - 1],
                investments: investmentsCopy,
                goalReachedYear: aggregatedResults.findIndex(year => year.isGoalReached) + 1,
                currentAge,
            };
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsCalculating(false);
        }
    }, [investments, retirementGoal, retirementAge, useAgeForRetirement, inflationRate,
        monthlyRetirementSpend, currentAge, isCoastingEnabled, coastingYears,
        monthlyPensionAmount, pensionStartAge, getInitialBalance]);
    if (error) {
        return (
            <Container maxWidth="lg">
                <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="h6">Something went wrong</Typography>
                    <Typography variant="body1">{error}</Typography>
                    <Typography variant="body2">Please refresh the page to try again.</Typography>
                </Alert>
            </Container>
        );
    }


    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom align="center">
                Investment Calculator
            </Typography>


            <InputForm
                investments={investments}
                setInvestments={setInvestments}
                retirementGoal={retirementGoal}
                setRetirementGoal={setRetirementGoal}
                retirementAge={retirementAge}
                setRetirementAge={setRetirementAge}
                useAgeForRetirement={useAgeForRetirement}
                setUseAgeForRetirement={setUseAgeForRetirement}
                inflationRate={inflationRate}
                setInflationRate={setInflationRate}
                monthlyRetirementSpend={monthlyRetirementSpend}
                setMonthlyRetirementSpend={setMonthlyRetirementSpend}
                currentAge={currentAge}
                setCurrentAge={setCurrentAge}
                isCoastingEnabled={isCoastingEnabled}
                setIsCoastingEnabled={setIsCoastingEnabled}
                coastingYears={coastingYears}
                setCoastingYears={setCoastingYears}
                monthlyPensionAmount={monthlyPensionAmount}
                setMonthlyPensionAmount={setMonthlyPensionAmount}
                pensionStartAge={pensionStartAge}
                setPensionStartAge={setPensionStartAge}
            />

            {isCalculating ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>


                    <Container sx={{ height: '500px' }}>
                        {/* Graph and Summary Section */}
                        <Grid container spacing={2} sx={{ height: '600px', mb: 0 }}> {/* Reduced height and added margin bottom */}
                            {/* Summary Table - Left Side */}
                            <Grid item xs={12} md={4}>
                                {showSummary && calculationResults && (
                                    <Box sx={{ height: '75%', p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                                        <SummaryTable calculationResults={calculationResults} />
                                    </Box>
                                )}
                            </Grid>

                            {/* Graph - Right Side */}
                            <Grid item xs={12} md={8}>
                                {showGraph && calculationResults && (
                                    <Box sx={{ height: '75%', width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                                        <InvestmentGraph
                                            data={calculationResults.returns}
                                            isCoastingEnabled={isCoastingEnabled}
                                            coastingStartYear={coastingYears + currentAge}
                                            goalReachedYear={calculationResults.goalReachedYear + currentAge - 1}
                                        />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Container>

                    {/* Results Table - Full Width Below */}
                    {showResultsTable && calculationResults && (
                        <Box sx={{ mt: 3 }}> {/* Added margin top */}
                            <ResultsTable
                                calculationResults={calculationResults}
                                showInvestmentDetails={showInvestmentDetails}
                                showInflationAdjusted={showInflationAdjusted}
                                showLowerReturnScenarios={showLowerReturnScenarios}
                            />
                        </Box>
                    )}
                    <Box sx={{ my: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={showResultsTable} onChange={(e) => setShowResultsTable(e.target.checked)} />}
                            label="Show Results Table"
                            sx={{ mr: 3 }}
                        />
                        {/* show results table toggle  */}
                        {showResultsTable && (
                            <>
                                <FormControlLabel
                                    control={<Switch checked={showInvestmentDetails} onChange={(e) => setShowInvestmentDetails(e.target.checked)} />}
                                    label="Show Investment Details"
                                    sx={{ mr: 3 }}
                                />
                                <FormControlLabel
                                    control={<Switch checked={showInflationAdjusted} onChange={(e) => setShowInflationAdjusted(e.target.checked)} />}
                                    label="Show Inflation Adjusted Total"
                                    sx={{ mr: 3 }}
                                />
                                <FormControlLabel
                                    control={<Switch checked={showLowerReturnScenarios} onChange={(e) => setShowLowerReturnScenarios(e.target.checked)} />}
                                    label="Show Lower Return Scenarios"
                                />
                            </>
                        )}
                    </Box>
                </>
            )
            }
        </Container >
    );
};

export default InvestmentCalculator;