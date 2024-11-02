import React from 'react';
import { TextField, Button, Grid, Card, CardContent, FormControlLabel, Switch } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const InputForm = ({
    investments,
    setInvestments,
    retirementGoal,
    setRetirementGoal,
    inflationRate,
    setInflationRate,
    monthlyRetirementSpend,
    setMonthlyRetirementSpend,
    currentAge,
    setCurrentAge,
    isCoastingEnabled,
    setIsCoastingEnabled,
    coastingYears,
    setCoastingYears
}) => {

    // console.log(investments);
    const handleInputChange = (id, field, value) => {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) return; // Ignore non-numeric inputs

        let newValue;
        switch (field) {
            case 'balance':
            case 'monthlySavings':
                newValue = Math.round(parsedValue * 100) / 100; // Round to 2 decimal places
                break;
            case 'returnRate':
                newValue = Math.min(Math.max(parsedValue, 0), 100); // Limit to 0-100%
                break;
            default:
                newValue = parsedValue;
        }

        setInvestments(investments.map(inv =>
            inv.id === id ? { ...inv, [field]: field === 'name' ? value : newValue } : inv
        ));
    };

    const addInvestment = () => {
        const newId = Math.max(...investments.map(inv => inv.id)) + 1;
        setInvestments([...investments, { id: newId, name: `Investment ${newId}`, balance: 0, returnRate: 7, monthlySavings: 0 }]);
    };

    const removeInvestment = (id) => {
        if (investments.length > 1) {
            setInvestments(investments.filter(inv => inv.id !== id));
        }
    };

    const handleGlobalInputChange = (setter, value) => {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            setter(Math.round(parsedValue * 100) / 100);
        }
    };

    return (
        <>
            {investments.map((inv) => (
                <StyledCard key={inv.id}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={2}>
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
                                    inputProps={{ step: "50000" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Return Rate (%)"
                                    value={inv.returnRate}
                                    onChange={(e) => handleInputChange(inv.id, 'returnRate', e.target.value)}
                                    inputProps={{ min: "0", max: "100", step: "0.1" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Monthly Savings"
                                    value={inv.monthlySavings}
                                    onChange={(e) => handleInputChange(inv.id, 'monthlySavings', e.target.value)}
                                    inputProps={{ step: "100" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
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

            <Button variant="contained" color="primary" onClick={addInvestment} fullWidth sx={{ mb: 2 }}>
                Add Investment
            </Button>

            <StyledCard>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Retirement Goal"
                                value={retirementGoal}
                                onChange={(e) => handleGlobalInputChange(setRetirementGoal, e.target.value)}
                                inputProps={{ step: "50000" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Inflation Rate (%)"
                                value={inflationRate}
                                onChange={(e) => handleGlobalInputChange(setInflationRate, e.target.value)}
                                inputProps={{ min: "0", max: "100", step: "0.1" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Monthly Retirement Spend"
                                value={monthlyRetirementSpend}
                                onChange={(e) => handleGlobalInputChange(setMonthlyRetirementSpend, e.target.value)}
                                inputProps={{ step: "100" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Current Age"
                                value={currentAge}
                                onChange={(e) => handleGlobalInputChange(setCurrentAge, e.target.value)}
                                inputProps={{ min: "0", max: "120", step: "1" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isCoastingEnabled}
                                        onChange={(e) => setIsCoastingEnabled(e.target.checked)}
                                    />
                                }
                                label="Enable Coasting"
                            />
                        </Grid>
                        {isCoastingEnabled && (
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Years Before Coasting"
                                    value={coastingYears}
                                    onChange={(e) => handleGlobalInputChange(setCoastingYears, e.target.value)}
                                    inputProps={{ min: "0", step: "1" }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </StyledCard>
        </>
    );
};

export default InputForm;