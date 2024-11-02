import React, { useState, useMemo } from 'react';
import { Container, Typography, Box, FormControlLabel, Switch } from '@mui/material';
import InputForm from './InputForm';
import SummaryTable from './SummaryTable';
import ResultsTable from './ResultsTable';
import InvestmentGraph from './InvestmentGraph';

// to do - 1 set up pension - earning $x per year until death
// to do - fix up the summary logic table
// add in split logic - to determine if funds will deplete before 65

const InvestmentCalculator = () => {
    const [investments, setInvestments] = useState([
        { id: 1, name: 'Investment 1', balance: 600000, returnRate: 7, monthlySavings: 4000 },
        // { id: 2, name: 'Investment 2', balance: 200000, returnRate: 7, monthlySavings: 0 }
    ]);


    //create the hooks for react

    const [retirementGoal, setRetirementGoal] = useState(1800000);
    const [inflationRate, setInflationRate] = useState(2);
    const [monthlyRetirementSpend, setMonthlyRetirementSpend] = useState(1000);
    const [currentAge, setCurrentAge] = useState(30);
    const [isCoastingEnabled, setIsCoastingEnabled] = useState(false);
    const [coastingYears, setCoastingYears] = useState(0);

    const [showSummary, setShowSummary] = useState(false);
    const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);
    const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);
    const [showLowerReturnScenarios, setShowLowerReturnScenarios] = useState(false);
    const [showResultsTable, setShowResultsTable] = useState(true);
    const [showGraph, setShowGraph] = useState(true);


    //main function - which calculates the return 
    const calculationResults = useMemo(() => {
        const investmentsCopy = JSON.parse(JSON.stringify(investments));

        const aggregatedResults = [];
        let goalReached = false;
        let totalBalance = investmentsCopy.reduce((sum, inv) => sum + inv.balance, 0);
        let totalBalanceLow = totalBalance;
        let totalBalanceVeryLow = totalBalance;
        let totalContributions = totalBalance;

        //iterate year by year 

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
            };

            const inflationFactor = Math.pow(1 + inflationRate / 100, year + 1);
            let yearlyReturn = 0;
            let yearlyReturnLow = 0;
            let yearlyReturnVeryLow = 0;
            let monthlySavings = 0;

            // Calculate returns and apply savings for each investment
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

            currentYear.investmentAmount = yearlyReturn + monthlySavings;

            if (goalReached) {
                currentYear.yearlySpend = monthlyRetirementSpend * 12 * inflationFactor;

                // Deduct spend from investments in order
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

            if (!goalReached && currentYear.inflationAdjustedTotal >= retirementGoal) {
                goalReached = true;
                currentYear.isGoalReached = true;
            }

            currentYear.isRisky = totalBalance <= 0 || totalBalanceLow <= 0 || totalBalanceVeryLow <= 0;
            currentYear.totalContributions = totalContributions + (monthlySavings * (year + 1));

            // Update investment balances for next year
            investmentsCopy.forEach((inv) => {
                inv.balance = currentYear.investments[inv.id];
            });

            aggregatedResults.push(currentYear);

            if (totalBalance <= 0 && totalBalanceLow <= 0 && totalBalanceVeryLow <= 0) break;

            // if (age > 100) break;
        }

        return {
            returns: aggregatedResults,
            totalInitialInvestment: investments.reduce((sum, inv) => sum + inv.balance, 0),
            totalMonthlyContributions: investments.reduce((sum, inv) => sum + inv.monthlySavings, 0),
            finalYear: aggregatedResults[aggregatedResults.length - 1],
            investments: investmentsCopy,
            goalReachedYear: aggregatedResults.findIndex(year => year.isGoalReached) + 1,
        };
    }, [investments, retirementGoal, inflationRate, monthlyRetirementSpend, currentAge, isCoastingEnabled, coastingYears]);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom align="center">Investment Calculator</Typography>

            <InputForm
                investments={investments}
                setInvestments={setInvestments}
                retirementGoal={retirementGoal}
                setRetirementGoal={setRetirementGoal}
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
            />

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
                <FormControlLabel
                    control={<Switch checked={showLowerReturnScenarios} onChange={(e) => setShowLowerReturnScenarios(e.target.checked)} />}
                    label="Show Lower Return Scenarios"
                />
                <FormControlLabel
                    control={<Switch checked={showResultsTable} onChange={(e) => setShowResultsTable(e.target.checked)} />}
                    label="Show Results Table"
                />
                <FormControlLabel
                    control={<Switch checked={showGraph} onChange={(e) => setShowGraph(e.target.checked)} />}
                    label="Show Graph"
                />
            </Box>

            {showSummary && (
                <SummaryTable calculationResults={calculationResults} />
            )}



            {showResultsTable && (
                <ResultsTable
                    calculationResults={calculationResults}
                    showInvestmentDetails={showInvestmentDetails}
                    showInflationAdjusted={showInflationAdjusted}
                    showLowerReturnScenarios={showLowerReturnScenarios}
                    currentAge={currentAge}

                />
            )}

            {showGraph && (
                <InvestmentGraph
                    data={calculationResults.returns}
                    isCoastingEnabled={isCoastingEnabled}
                    coastingStartYear={coastingYears + currentAge}
                    goalReachedYear={calculationResults.goalReachedYear + currentAge - 1}
                />
            )}
        </Container>
    );
};

export default InvestmentCalculator;