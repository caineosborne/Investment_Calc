import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(4),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflowX: 'auto',
}));

const StyledTable = styled(Table)(({ theme }) => ({
    minWidth: 650,
}));

const ResultsTable = ({ calculationResults, showInvestmentDetails, showInflationAdjusted }) => {
    const { returns, investments } = calculationResults;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    return (
        <StyledTableContainer component={Paper}>
            <StyledTable size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell>Status</TableCell>
                        {showInvestmentDetails && investments.map((inv) => (
                            <TableCell key={inv.id}>{inv.name}</TableCell>
                        ))}
                        <TableCell>Opening Balance</TableCell>
                        <TableCell>Yearly Spend</TableCell>
                        <TableCell>Investment Amount</TableCell>
                        <TableCell>Year End Balance</TableCell>
                        {showInflationAdjusted && (
                            <TableCell>Inflation Adjusted Total</TableCell>
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
                            <TableCell>{row.year}</TableCell>
                            <TableCell>{row.age}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            {showInvestmentDetails && investments.map((inv) => (
                                <TableCell key={inv.id}>{formatCurrency(row.investments[inv.id])}</TableCell>
                            ))}
                            <TableCell>{formatCurrency(row.openingBalance)}</TableCell>
                            <TableCell>{row.yearlySpend ? formatCurrency(row.yearlySpend) : '-'}</TableCell>
                            <TableCell>{formatCurrency(row.investmentAmount)}</TableCell>
                            <TableCell>{formatCurrency(row.yearEndBalance)}</TableCell>
                            {showInflationAdjusted && (
                                <TableCell>{formatCurrency(row.inflationAdjustedTotal)}</TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </StyledTable>
        </StyledTableContainer>
    );
};

export default ResultsTable;