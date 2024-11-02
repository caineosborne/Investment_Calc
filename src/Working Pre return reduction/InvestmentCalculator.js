import React, { useState, useMemo } from 'react';
import { Container, Typography, Box, FormControlLabel, Switch } from '@mui/material';
import InputForm from './InputForm';
import SummaryTable from './SummaryTable';
import ResultsTable from './ResultsTable';

const InvestmentCalculator = () => {
    const [investments, setInvestments] = useState([
        { id: 1, name: 'Investment 1', balance: 600000, returnRate: 7, monthlySavings: 4000 },
        { id: 2, name: 'Investment 2', balance: 200000, returnRate: 7, monthlySavings: 0 }
    ]);

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

    const calculationResults = useMemo(() => {
        // Create a deep copy of investments to avoid mutating the original state
        const investmentsCopy = JSON.parse(JSON.stringify(investments));

        const aggregatedResults = [];
        let goalReached = false;
        let totalBalance = investmentsCopy.reduce((sum, inv) => sum + inv.balance, 0);
        let totalContributions = totalBalance;

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
            };

            const inflationFactor = Math.pow(1 + inflationRate / 100, year + 1);
            let yearlyReturn = 0;
            let monthlySavings = 0;

            // Calculate returns and apply savings for each investment
            investmentsCopy.forEach((inv) => {
                const invReturn = inv.balance * (inv.returnRate / 100);
                yearlyReturn += invReturn;

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
            currentYear.yearEndBalance = totalBalance;
            currentYear.inflationAdjustedTotal = totalBalance / inflationFactor;

            if (!goalReached && currentYear.inflationAdjustedTotal >= retirementGoal) {
                goalReached = true;
                currentYear.isGoalReached = true;
            }

            currentYear.isRisky = totalBalance <= 0;

            // Update investment balances for next year
            investmentsCopy.forEach((inv) => {
                inv.balance = currentYear.investments[inv.id];
            });

            aggregatedResults.push(currentYear);

            if (totalBalance <= 0) break;
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
            </Box>

            {showSummary && (
                <SummaryTable calculationResults={calculationResults} />
            )}

            <ResultsTable
                calculationResults={calculationResults}
                showInvestmentDetails={showInvestmentDetails}
                showInflationAdjusted={showInflationAdjusted}
                showLowerReturnScenarios={showLowerReturnScenarios}
            />
        </Container>
    );
};

export default InvestmentCalculator;