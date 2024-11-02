import React, { useEffect } from 'react';
import InvestmentCalculator from './Components/InvestmentCalculator';

function App() {
  useEffect(() => {
    document.title = 'Retirement Calculator';
  }, []);

  return (
    <div className="App">
      <InvestmentCalculator />
    </div>
  );
}

export default App;