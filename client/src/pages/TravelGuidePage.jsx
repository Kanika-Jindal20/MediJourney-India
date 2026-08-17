import React, { useState, useEffect } from 'react';
import { travelService } from '../services/travelService';
import { useCurrency } from '../context/CurrencyContext';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Plane,
  FileCheck,
  Building2,
  PhoneCall,
  DollarSign,
  Globe,
  ExternalLink,
  ShieldCheck,
  Compass,
  CreditCard,
} from 'lucide-react';

export const TravelGuidePage = () => {
  const { currency, setCurrency, exchangeRates } = useCurrency();
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Currency Converter Calculator state
  const [calcAmount, setCalcAmount] = useState(2500);
  const [calcCurrency, setCalcCurrency] = useState('USD');

  useEffect(() => {
    const loadGuide = async () => {
      setLoading(true);
      try {
        const res = await travelService.getTravelGuidelines();
        setGuideData(res);
      } catch (err) {
        console.error('Error loading travel guidelines:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGuide();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading travel and visa logistics guide...</p>
      </div>
    );
  }

  const { visaInfo, cityGuides, currencyRates } = guideData || {};

  // Conversion helper
  const inrAmount = calcAmount * (currencyRates?.rates?.INR || 83.5) / (currencyRates?.rates?.[calcCurrency] || 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Plane className="w-4 h-4 text-teal-400" />
            Travel & Logistics Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Indian Medical Visa & Travel Guide
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Everything you need to plan your medical travel to India: fast-track e-Medical Visa applications, hospital invitation letters, airport pick-up, local SIM cards, and city accommodation.
          </p>
        </div>
      </div>

      {/* 1. INDIAN E-MEDICAL VISA GUIDELINES */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              Visa Regulations
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">
              Indian e-Medical Visa (MED) & Attendant Visa (MED-X)
            </h2>
          </div>
          <a
            href="https://indianvisaonline.gov.in/evisa/tvoa.html"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            <span>Official Government Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visaInfo?.categories?.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  {cat.name}
                </h3>
                <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-200">
                  {cat.validity}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {cat.eligibility}
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Mandatory Documents:</div>
                <ul className="space-y-1 text-slate-600">
                  {cat.documentsRequired?.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
                <span>Entry Allowance: <strong>{cat.entries}</strong></span>
                <span>Processing: <strong>{cat.processingTime || '72-96 Hours'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. VISA STEP-BY-STEP PROCESS */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-xl font-bold text-slate-900 font-display">
          How to Obtain Your Indian Medical Visa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visaInfo?.stepByStepProcess?.map((step) => (
            <div key={step.step} className="space-y-2 text-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {step.step}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
              <p className="text-slate-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CURRENCY ESTIMATOR */}
      <section className="bg-gradient-to-r from-teal-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-teal-500/20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <span className="text-teal-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> Live Currency Converter
          </span>
          <h3 className="text-2xl font-bold font-display">
            Plan Your Medical Expense Budget in INR
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            All major Indian hospitals accept international wire transfers, Visa, Mastercard, AMEX, and foreign currency payments with zero surcharges.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Your Currency & Amount</label>
              <div className="flex gap-2">
                <select
                  value={calcCurrency}
                  onChange={(e) => setCalcCurrency(e.target.value)}
                  className="bg-slate-900 text-white border border-slate-700 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (Dirham)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="SAR">SAR (Riyal)</option>
                </select>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Equivalent in Indian Rupees (INR)</label>
              <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 font-bold text-teal-300 text-base">
                ₹{Math.round(inrAmount).toLocaleString()} INR
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            * Benchmark conversion rate: 1 USD ≈ ₹83.5 INR. Hospital billing accounts accept multi-currency remittances.
          </div>
        </div>
      </section>

      {/* 4. CITY LOGISTICS & ACCOMMODATION GUIDES */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            City Destinations
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">
            Key Medical Tourism Hubs & Local Logistics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cityGuides?.map((city, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">{city.city}</h3>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    ~${city.nearbyStayAvgUSD}/night stay
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{city.overview}</p>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Plane className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{city.airport}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{city.weather}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Emergency: {city.emergencyHelpline}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Renowned For
                </span>
                <div className="flex flex-wrap gap-1">
                  {city.popularSpecialties?.map((spec, i) => (
                    <span
                      key={i}
                      className="bg-teal-50 text-teal-800 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
