import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

const ChildSupportCalculator = () => {
    const [parent1, setParent1] = useState({ name: 'Parent 1', income: 150000, additionalChildren: 0, applicableIncome: 0, calculation: '' });
    const [parent2, setParent2] = useState({ name: 'Parent 2', income: 80000, additionalChildren: 0, applicableIncome: 0, calculation: '' });
    const [childOver13, setChildOver13] = useState(false);
    const [result, setResult] = useState(null);

    const selfSupportAmount = 28463;

    const calculateChildCost = (income, numberOfChildren, isOver13) => {
        if (numberOfChildren === 0) return 0;
        const incomeBrackets = isOver13 ? [
            { max: 41106, rates: [0.1746, 0.2466, 0.2772] },
            { max: 82212, rates: [0.1539, 0.2361, 0.2667], base: [7177, 10137, 11395] },
            { max: 123318, rates: [0.1231, 0.2051, 0.2565], base: [13462, 19887, 22411] },
            { max: 164424, rates: [0.1026, 0.1846, 0.2462], base: [18565, 28287, 32951] },
            { max: 205530, rates: [0.0718, 0.1026, 0.1846], base: [22786, 35874, 43073] },
            { max: Infinity, rates: [0, 0, 0], base: [25739, 40099, 50654] }
        ] : [
            { max: 41106, rates: [0.17, 0.24, 0.27] },
            { max: 82212, rates: [0.15, 0.23, 0.26], base: [6988, 9865, 11099] },
            { max: 123318, rates: [0.12, 0.20, 0.25], base: [13120, 19358, 21828] },
            { max: 164424, rates: [0.10, 0.18, 0.24], base: [18078, 27550, 32085] },
            { max: 205530, rates: [0.07, 0.10, 0.18], base: [22190, 34936, 41947] },
            { max: Infinity, rates: [0, 0, 0], base: [25073, 39050, 49320] }
        ];

        const bracket = incomeBrackets.find(b => income <= b.max);
        const index = Math.min(numberOfChildren - 1, 2);

        if (bracket.base) {
            const baseAmount = bracket.base[index];
            const additionalAmount = Math.max(0, income - incomeBrackets[incomeBrackets.indexOf(bracket) - 1].max);
            return Math.round(baseAmount + additionalAmount * bracket.rates[index]);
        } else {
            return Math.round(income * bracket.rates[index]);
        }
    };

    const calculateApplicableIncome = (income, additionalChildren, isOver13) => {
        const baseIncome = Math.max(0, income - selfSupportAmount);
        const deduction = calculateChildCost(baseIncome, additionalChildren, isOver13);
        const applicableIncome = Math.max(0, baseIncome - deduction);
        const calculation = `$${Math.round(income)} - $${selfSupportAmount} - $${Math.round(deduction)}`;
        return { applicableIncome: Math.round(applicableIncome), calculation };
    };

    useEffect(() => {
        const updateParent = (parent, setParent) => {
            const { applicableIncome, calculation } = calculateApplicableIncome(parent.income, parent.additionalChildren, childOver13);
            setParent(prev => ({ ...prev, applicableIncome, calculation }));
        };

        updateParent(parent1, setParent1);
        updateParent(parent2, setParent2);

        const totalChildSupportIncome = parent1.applicableIncome + parent2.applicableIncome;
        const childCost = calculateChildCost(totalChildSupportIncome, 1, childOver13); // Assuming 1 shared child

        const parent1IncomePercentage = parent1.applicableIncome / totalChildSupportIncome;
        const parent2IncomePercentage = parent2.applicableIncome / totalChildSupportIncome;

        const careCost = 0.5; // Assuming 50/50 care

        const parent1Difference = parent1IncomePercentage - careCost;
        const parent2Difference = parent2IncomePercentage - careCost;

        let owingParent, owedAmount, childSupportPercentage;
        if (parent1Difference > 0) {
            owingParent = parent1.name;
            owedAmount = Math.round(parent1Difference * childCost);
            childSupportPercentage = parent1Difference * 100;
        } else if (parent2Difference > 0) {
            owingParent = parent2.name;
            owedAmount = Math.round(parent2Difference * childCost);
            childSupportPercentage = parent2Difference * 100;
        } else {
            owingParent = "Neither";
            owedAmount = 0;
            childSupportPercentage = 0;
        }

        const totalIncome = parent1.income + parent2.income;

        const weeklyAmount = Math.round(owedAmount / 52);
        const fortnightlyAmount = Math.round(owedAmount / 26);
        const monthlyAmount = Math.round(owedAmount / 12);

        setResult({
            owingParent,
            owedAmount,
            childCost: Math.round(childCost),
            totalIncome,
            totalChildSupportIncome,
            childSupportPercentage: childSupportPercentage.toFixed(2),
            weeklyAmount,
            fortnightlyAmount,
            monthlyAmount
        });
    }, [parent1.income, parent1.additionalChildren, parent2.income, parent2.additionalChildren, childOver13]);

    const updateParent = (parentNumber, field, value) => {
        const setParent = parentNumber === 1 ? setParent1 : setParent2;
        setParent(prev => ({ ...prev, [field]: value }));
    };

    const ParentInput = ({ parentNum, parent, updateParent }) => (
        <div className="space-y-4">
            <div>
                <Label htmlFor={`income-${parentNum}`}>Income: ${parent.income}</Label>
                <Slider
                    id={`income-${parentNum}`}
                    min={0}
                    max={250000}
                    step={1000}
                    value={[parent.income]}
                    onValueChange={([value]) => updateParent(parentNum, 'income', value)}
                />
            </div>
            <div>
                <Label htmlFor={`additional-children-${parentNum}`}>Additional Children: {parent.additionalChildren}</Label>
                <Slider
                    id={`additional-children-${parentNum}`}
                    min={0}
                    max={5}
                    step={1}
                    value={[parent.additionalChildren]}
                    onValueChange={([value]) => updateParent(parentNum, 'additionalChildren', value)}
                />
            </div>
            <div>Applicable Income: ${parent.applicableIncome}</div>
            <div>Calculation: {parent.calculation}</div>
        </div>
    );

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <h2 className="text-2xl font-bold">Child Support Calculator</h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <ParentInput parentNum={1} parent={parent1} updateParent={updateParent} />
                    <ParentInput parentNum={2} parent={parent2} updateParent={updateParent} />
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="child-age-toggle"
                            checked={childOver13}
                            onCheckedChange={setChildOver13}
                        />
                        <Label htmlFor="child-age-toggle">Child is 13 or over</Label>
                    </div>
                    {result && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Result:</h3>
                            <p>Total Income: ${result.totalIncome}</p>
                            <p>Total Child Support Income: ${result.totalChildSupportIncome}</p>
                            <p>Cost of the child: ${result.childCost}</p>
                            <p>Child support percentage: {result.childSupportPercentage}%</p>
                            <p>Estimated amount payable: ${result.owedAmount} per year payable by: {result.owingParent}</p>
                            <p>Total payable by {result.owingParent}: ${result.owedAmount}</p>
                            <h4 className="text-lg font-semibold">The estimated annual rate per year can be broken down further as:</h4>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-2">Estimated amount: week</th>
                                        <th className="border p-2">Estimated amount: fortnight</th>
                                        <th className="border p-2">Estimated amount: month</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border p-2">${result.weeklyAmount}</td>
                                        <td className="border p-2">${result.fortnightlyAmount}</td>
                                        <td className="border p-2">${result.monthlyAmount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ChildSupportCalculator;