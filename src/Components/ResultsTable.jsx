import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { styled } from '@mui/system';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(4),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxHeight: '500px',
    overflowY: 'auto',
}));

const StyledTable = styled(Table)(({ theme }) => ({
    minWidth: 650,
}));

const CopyButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));


const ResultsTable = ({ calculationResults, showInvestmentDetails, showInflationAdjusted, showLowerReturnScenarios }) => {
    const { returns, investments } = calculationResults;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const convertToCSV = () => {
        const headers = [
            'Year', 'Age', 'Status',
            ...(showInvestmentDetails ? investments.map(inv => inv.name) : []),
            'Opening Balance', 'Yearly Spend', 'Amount Invested', 'Year End Balance',
            ...(showLowerReturnScenarios ? ['Year End Balance (10% Lower)', 'Year End Balance (20% Lower)'] : []),
            ...(showInflationAdjusted ? ['Inflation Adjusted Total'] : []),
            ...(showInflationAdjusted && showLowerReturnScenarios ? ['Inflation Adjusted (10% Lower)', 'Inflation Adjusted (20% Lower)'] : [])
        ].join(',');

        const rows = returns.map(row => [
            row.year,
            row.age,
            row.status,
            ...(showInvestmentDetails ? investments.map(inv => (row.investments[inv.id])) : []),
            row.openingBalance, // No formatting for opening balance
            row.yearlySpend ? row.yearlySpend : '-',
            row.investmentAmount,
            row.yearEndBalance,
            ...(showLowerReturnScenarios ? [(row.yearEndBalanceLow), (row.yearEndBalanceVeryLow)] : []),
            ...(showInflationAdjusted ? [(row.inflationAdjustedTotal)] : []),
            ...(showInflationAdjusted && showLowerReturnScenarios ? [(row.inflationAdjustedTotalLow), (row.inflationAdjustedTotalVeryLow)] : [])
        ].join(','));
        return [headers, ...rows].join('\n');
    };

    const copyToClipboard = () => {
        const csvContent = convertToCSV();
        navigator.clipboard.writeText(csvContent).then(() => {
            alert('Results copied to clipboard in CSV format!');
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy results. Please try again.');
        });
    };



    return (
        <>
            <CopyButton variant="contained" color="primary" onClick={copyToClipboard}>
                Copy Results to Clipboard (CSV)
            </CopyButton>
            <StyledTableContainer component={Paper}>
                <StyledTable stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Year</TableCell>
                            <TableCell align="center">Age</TableCell>
                            <TableCell align="center">Status</TableCell>
                            {showInvestmentDetails && investments.map((inv) => (
                                <TableCell align="center" key={inv.id}>{inv.name}</TableCell>
                            ))}
                            <TableCell align="center">Opening Balance</TableCell>
                            <TableCell align="center">Yearly Spend <br /> (after pension) </TableCell>
                            <TableCell align="center">Amount Invested</TableCell>
                            <TableCell align="center">Pension Amount</TableCell>
                            <TableCell align="center">Year End Balance</TableCell>
                            {showLowerReturnScenarios && (
                                <>
                                    <TableCell align="center">Year End Balance (10% Lower)</TableCell>
                                    <TableCell align="center">Year End Balance<br />(20% Lower)</TableCell>
                                </>
                            )}
                            {showInflationAdjusted && (
                                <>
                                    <TableCell align="center">Inflation Adjusted Total</TableCell>
                                    {showLowerReturnScenarios && (
                                        <>
                                            <TableCell align="center">Inflation Adjusted (10% Lower)</TableCell>
                                            <TableCell align="center">Inflation Adjusted<br />(20% Lower)</TableCell>
                                        </>
                                    )}
                                </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {returns.map((row) => (
                            <TableRow
                                key={row.year}
                                sx={{
                                    backgroundColor: row.isGoalReached ? 'rgba(76, 175, 80, 0.1)' :
                                        row.isRisky ? 'rgba(244, 67, 54, 0.1)' :
                                            'inherit',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <TableCell align="center">{row.year}</TableCell>
                                <TableCell align="center">{row.age}</TableCell>
                                <TableCell align="center">{row.status}</TableCell>
                                {showInvestmentDetails && investments.map((inv) => (
                                    <TableCell align="center" key={inv.id}>{formatCurrency(row.investments[inv.id])}</TableCell>
                                ))}
                                <TableCell align="center">{formatCurrency(row.openingBalance)}</TableCell>
                                <TableCell align="center">{row.yearlySpend ? formatCurrency(row.yearlySpend) : '-'}</TableCell>
                                <TableCell align="center">{formatCurrency(row.investmentAmount)}</TableCell>
                                <TableCell align="center">{formatCurrency(row.pensionAmount)}</TableCell>
                                <TableCell align="center">{formatCurrency(row.yearEndBalance)}</TableCell>
                                {showLowerReturnScenarios && (
                                    <>
                                        <TableCell align="center">{formatCurrency(row.yearEndBalanceLow)}</TableCell>
                                        <TableCell align="center">{formatCurrency(row.yearEndBalanceVeryLow)}</TableCell>
                                    </>
                                )}
                                {showInflationAdjusted && (
                                    <>
                                        <TableCell align="center">{formatCurrency(row.inflationAdjustedTotal)}</TableCell>
                                        {showLowerReturnScenarios && (
                                            <>
                                                <TableCell align="center">{formatCurrency(row.inflationAdjustedTotalLow)}</TableCell>
                                                <TableCell align="center">{formatCurrency(row.inflationAdjustedTotalVeryLow)}</TableCell>
                                            </>
                                        )}
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
        </>
    );
};

export default ResultsTable;