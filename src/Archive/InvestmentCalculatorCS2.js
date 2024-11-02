import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const ChildSupportCalculator = () => {
    const [parent1, setParent1] = useState({ name: 'Parent 1', income: 80000, additionalChildren: 0, applicableIncome: 0, calculation: '' });
    const [parent2, setParent2] = useState({ name: 'Parent 2', income: 80000, additionalChildren: 0, applicableIncome: 0, calculation: '' });
    const [childOver13, setChildOver13] = useState(false);
    const [result, setResult] = useState(null);

    const selfSupportAmount = 28463;

    const calculateChildCost = (income, numberOfChildren, isOver13) => {
        // ... (keep the existing calculateChildCost function)
    };

    const calculateApplicableIncome = (income, additionalChildren, isOver13) => {
        // ... (keep the existing calculateApplicableIncome function)
    };

    useEffect(() => {
        const updateParent = (parent, setParent) => {
            const { applicableIncome, calculation } = calculateApplicableIncome(parent.income, parent.additionalChildren, childOver13);
            setParent(prev => ({ ...prev, applicableIncome, calculation }));
        };

        updateParent(parent1, setParent1);
        updateParent(parent2, setParent2);

        const totalApplicableIncome = parent1.applicableIncome + parent2.applicableIncome;
        const childCost = calculateChildCost(totalApplicableIncome, 1, childOver13); // Assuming 1 shared child

        const parent1IncomePercentage = parent1.applicableIncome / totalApplicableIncome;
        const parent2IncomePercentage = parent2.applicableIncome / totalApplicableIncome;

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
        const totalChildSupportIncome = parent1.applicableIncome + parent2.applicableIncome;

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
                <Label htmlFor={`name-${parentNum}`}>Name</Label>
                <Input
                    id={`name-${parentNum}`}
                    value={parent.name}
                    onChange={(e) => updateParent(parentNum, 'name', e.target.value)}
                />
            </div>
            <div>
                <Label htmlFor={`income-${parentNum}`}>Income</Label>
                <Input
                    id={`income-${parentNum}`}
                    type="number"
                    value={parent.income}
                    onChange={(e) => updateParent(parentNum, 'income', Number(e.target.value))}
                />
            </div>
            <div>
                <Label htmlFor={`additional-children-${parentNum}`}>Additional Children</Label>
                <Input
                    id={`additional-children-${parentNum}`}
                    type="number"
                    min="0"
                    max="5"
                    value={parent.additionalChildren}
                    onChange={(e) => updateParent(parentNum, 'additionalChildren', Number(e.target.value))}
                />
            </div>
            <div>Applicable Income: ${parent.applicableIncome}</div>
            <div>Calculation: {parent.calculation}</div>
        </div>
    );

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>Child Support Calculator</CardHeader>
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
                        <div className="space-y-2">
                            <h3 className="font-bold">Result:</h3>
                            <p>Total Income: ${result.totalIncome}</p>
                            <p>Total Child Support Income: ${result.totalChildSupportIncome}</p>
                            <p>Cost of the child: ${result.childCost}</p>
                            <p>Child support percentage: {result.childSupportPercentage}%</p>
                            <p>Estimated amount payable: ${result.owedAmount} per year payable by: {result.owingParent}</p>
                            <p>Total payable by {result.owingParent}: ${result.owedAmount}</p>
                            <h4 className="font-semibold mt-4">The estimated annual rate per year can be broken down further as:</h4>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Estimated amount: week</th>
                                        <th>Estimated amount: fortnight</th>
                                        <th>Estimated amount: month</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${result.weeklyAmount}</td>
                                        <td>${result.fortnightlyAmount}</td>
                                        <td>${result.monthlyAmount}</td>
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