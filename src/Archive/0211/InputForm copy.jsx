import React from 'react';
import { TextField, Button, Grid, Card, CardContent, FormControlLabel, Switch, Typography, Collapse } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2), // Reduced from 3
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Lighter shadow
}));

const CompactCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(1), // Reduced padding
    '&:last-child': {
        paddingBottom: theme.spacing(1),
    },
}));



const InputForm = ({
    investments,
    setInvestments,
    retirementGoal,
    setRetirementGoal,
    retirementAge,
    setRetirementAge,
    useAgeForRetirement,
    setUseAgeForRetirement,
    inflationRate,
    setInflationRate,
    monthlyRetirementSpend,
    setMonthlyRetirementSpend,
    currentAge,
    setCurrentAge,
    isCoastingEnabled,
    setIsCoastingEnabled,
    coastingYears,
    setCoastingYears,
    monthlyPensionAmount,
    setMonthlyPensionAmount,
    pensionStartAge,
    setPensionStartAge
}) => {
    const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
    const [showInflationInput, setShowInflationInput] = React.useState(false);
    const [showPensionInput, setShowPensionInput] = React.useState(false);

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
            {/* Main age and spending info - only show once */}
            <StyledCard>
                <CompactCardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Current Age"
                                value={currentAge}
                                onChange={(e) => handleGlobalInputChange(setCurrentAge, e.target.value)}
                                inputProps={{ min: "0", max: "120", step: "1" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label={useAgeForRetirement ? "Retirement Age" : "Retirement Goal ($)"}
                                value={useAgeForRetirement ? retirementAge : retirementGoal}
                                onChange={(e) => {
                                    if (useAgeForRetirement) {
                                        handleGlobalInputChange(setRetirementAge, e.target.value);
                                    } else {
                                        handleGlobalInputChange(setRetirementGoal, e.target.value);
                                    }
                                }}
                                inputProps={useAgeForRetirement ?
                                    { min: "0", max: "120", step: "1" } :
                                    { min: "0", step: "50000" }
                                }
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Monthly Retirement Spend"
                                value={monthlyRetirementSpend}
                                onChange={(e) => handleGlobalInputChange(setMonthlyRetirementSpend, e.target.value)}
                                inputProps={{ step: "100" }}
                            />
                        </Grid>
                    </Grid>
                </CompactCardContent>
            </StyledCard>

            {/* Investment inputs */}
            {investments.map((inv) => (
                <StyledCard key={inv.id}>
                    <CompactCardContent>
                        <Grid container spacing={2}>
                            {investments.length > 1 && (
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Investment Name"
                                        value={inv.name}
                                        onChange={(e) => handleInputChange(inv.id, 'name', e.target.value)}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={investments.length > 1 ? 3 : 4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Current Balance"
                                    value={inv.balance}
                                    onChange={(e) => handleInputChange(inv.id, 'balance', e.target.value)}
                                    inputProps={{ step: "50000" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={investments.length > 1 ? 2 : 4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Return Rate (%)"
                                    value={inv.returnRate}
                                    onChange={(e) => handleInputChange(inv.id, 'returnRate', e.target.value)}
                                    inputProps={{ min: "0", max: "100", step: "0.1" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={investments.length > 1 ? 2 : 4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Monthly Savings"
                                    value={inv.monthlySavings}
                                    onChange={(e) => handleInputChange(inv.id, 'monthlySavings', e.target.value)}
                                    inputProps={{ step: "100" }}
                                />
                            </Grid>
                            {investments.length > 1 && (
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => removeInvestment(inv.id)}
                                        disabled={investments.length === 1}
                                        fullWidth
                                        size="small"
                                    >
                                        Remove
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </CompactCardContent>
                </StyledCard>
            ))}

            <Button
                variant="contained"
                color="primary"
                onClick={addInvestment}
                fullWidth
                size="small"
                sx={{ mb: 1 }} // Reduced margin
            >
                Add Investment
            </Button>

            <Button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                sx={{ mb: 1 }} // Reduced margin
                variant="text"
                size="small"
            >
                {showAdvancedOptions ? '▼ Hide Advanced Options' : '▶ Show Advanced Options'}
            </Button>

            <Collapse in={showAdvancedOptions}>
                <StyledCard>
                    <CompactCardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={useAgeForRetirement}
                                            onChange={(e) => {
                                                setUseAgeForRetirement(e.target.checked);
                                                // Reset the value when toggling to avoid confusion
                                                if (e.target.checked) {
                                                    setRetirementAge(65); // Default retirement age
                                                } else {
                                                    setRetirementGoal(1800000); // Default retirement goal
                                                }
                                            }}
                                        />
                                    }
                                    label={`Retire at: ${useAgeForRetirement ? 'Age' : 'Amount'}`}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={showInflationInput}
                                            onChange={(e) => setShowInflationInput(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="body2">Custom Inflation Rate</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={isCoastingEnabled}
                                            onChange={(e) => setIsCoastingEnabled(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="body2">Enable Coasting</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={showPensionInput}
                                            onChange={(e) => setShowPensionInput(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="body2">Include Pension</Typography>}
                                />
                            </Grid>

                            {showInflationInput && (
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Inflation Rate (%)"
                                        value={inflationRate}
                                        onChange={(e) => handleGlobalInputChange(setInflationRate, e.target.value)}
                                        inputProps={{ min: "0", max: "100", step: "0.1" }}
                                    />
                                </Grid>
                            )}
                            {isCoastingEnabled && (
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Years Before Coasting"
                                        value={coastingYears}
                                        onChange={(e) => handleGlobalInputChange(setCoastingYears, e.target.value)}
                                        inputProps={{ min: "0", step: "1" }}
                                    />
                                </Grid>
                            )}
                            {showPensionInput && (
                                <>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Monthly Pension Amount"
                                            value={monthlyPensionAmount}
                                            onChange={(e) => handleGlobalInputChange(setMonthlyPensionAmount, e.target.value)}
                                            inputProps={{ min: "0", step: "100" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Pension Start Age"
                                            value={pensionStartAge}
                                            onChange={(e) => handleGlobalInputChange(setPensionStartAge, e.target.value)}
                                            inputProps={{ min: "0", max: "120", step: "1" }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </CompactCardContent>
                </StyledCard>
            </Collapse>
        </>
    );
};

export default InputForm;