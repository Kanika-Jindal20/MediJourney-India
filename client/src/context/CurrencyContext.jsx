import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

const EXCHANGE_RATES = {
  USD: { rate: 1.0, symbol: '$', name: 'US Dollar (USD)' },
  EUR: { rate: 0.92, symbol: '€', name: 'Euro (EUR)' },
  GBP: { rate: 0.79, symbol: '£', name: 'British Pound (GBP)' },
  AED: { rate: 3.67, symbol: 'AED ', name: 'UAE Dirham (AED)' },
  CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar (CAD)' },
  AUD: { rate: 1.52, symbol: 'A$', name: 'Australian Dollar (AUD)' },
  SAR: { rate: 3.75, symbol: 'SAR ', name: 'Saudi Riyal (SAR)' },
  INR: { rate: 83.5, symbol: '₹', name: 'Indian Rupee (INR)' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  const formatPrice = (amountInUSD) => {
    if (amountInUSD === undefined || amountInUSD === null) return 'N/A';
    const curr = EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD;
    const converted = amountInUSD * curr.rate;
    return `${curr.symbol}${converted.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        exchangeRates: EXCHANGE_RATES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
