import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useCurrency } from '../../context/CurrencyContext';
import { Modal } from '../common/Modal';
import { Alert, Spinner } from '../common/Alert';
import {
  Sparkles,
  Send,
  Building2,
  Stethoscope,
  TrendingDown,
  Plane,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Wallet,
  Activity,
  Layers,
} from 'lucide-react';

export const AIAssistantWidget = ({ isOpen, onClose, onSelectDoctor, onSelectHospital }) => {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState('');
  const [preferredCity, setPreferredCity] = useState('All');
  const [budgetUSD, setBudgetUSD] = useState('any');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sampleQueries = [
    'Looking for All-on-4 dental implants with 5 days recovery',
    '3,500 grafts hair transplant in Delhi with natural hairline',
    'Affordable IVF cycle with high success rate and embryo testing',
    'Robotic knee replacement surgery cost vs USA / UK',
    'Heart bypass CABG surgery at top accredited cardiology hospital',
    'CyberKnife radiosurgery for targeted cancer treatment in Mumbai',
  ];

  const handleSearch = async (queryText = query) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getDiscoveryRecommendations({
        query: queryText,
        preferredCity,
        budgetUSD: budgetUSD !== 'any' ? Number(budgetUSD) : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'AI Assistant unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Healthcare Discovery & Clinical Assistant"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-navy-950 text-white rounded-2xl p-5 shadow-lg border border-teal-500/30">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            AI Clinical Matcher & Savings Engine
          </div>
          <h4 className="text-xl font-display font-bold">
            Describe your condition, desired treatment or budget
          </h4>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Our AI engine maps your symptoms to specialized departments, scans JCI/NABH accredited hospital facilities, calculates savings vs Western hospitals, and recommends verified specialists.
          </p>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] px-2.5 py-1 rounded-full border border-white/15 transition text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Filter Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Need robotic knee replacement or dental implants under $3,000..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={preferredCity}
              onChange={(e) => setPreferredCity(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="All">All Medical Hubs (Pan-India)</option>
              <option value="Delhi NCR">Delhi NCR & Gurugram</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kochi">Kochi (Kerala)</option>
            </select>

            <select
              value={budgetUSD}
              onChange={(e) => setBudgetUSD(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="any">Any Budget Tier</option>
              <option value="2500">Under $2,500 (Dental / Hair / Minor)</option>
              <option value="6000">$2,500 - $6,000 (Joints / IVF / Cosmetic)</option>
              <option value="12000">$6,000 - $12,000 (Cardiology / Oncology)</option>
            </select>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
              <span>Analyze & Match</span>
            </button>
          </div>
        </form>

        {error && <Alert type="error" message={error} />}

        {/* AI Output Section */}
        {result && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Category & Savings Banner */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Identified Specialty</span>
                <span className="font-bold text-slate-900 text-sm">{result.detectedCategory}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Estimated Starting Cost</span>
                <span className="font-bold text-teal-700 text-base">
                  {formatPrice(result.estimatedCostUSD)}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Estimated Cost Savings</span>
                <span className="font-bold text-emerald-700 text-base flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" /> ~{result.costSavingsPercent}% lower vs USA/UK
                </span>
              </div>
            </div>

            {/* Clinical Guidance Notes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-600" />
                Clinical Analysis & Recommendations
              </div>
              <ul className="space-y-1 text-slate-600">
                {result.guidanceNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Treatments */}
            {result.recommendedTreatments?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Matched Procedure Guides
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.recommendedTreatments.map((t) => (
                    <div
                      key={t._id}
                      className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 transition"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{t.name}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{formatPrice(t.costIndiaUSD)}</div>
                      </div>
                      <Link
                        to={`/treatments/${t.slug}`}
                        onClick={onClose}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold shrink-0 transition"
                      >
                        View Guide
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Doctors */}
            {result.recommendedDoctors?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Top Recommended Specialists for Your Case
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.recommendedDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{doc.fullName}</div>
                          <div className="text-[11px] text-slate-500">{doc.specialty}</div>
                          <div className="text-[10px] text-teal-700 font-semibold">
                            {doc.hospitalId?.name || 'Accredited Hospital'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectDoctor) onSelectDoctor(doc);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shrink-0 transition shadow-xs"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Hospitals */}
            {result.recommendedHospitals?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Matching Accredited Medical Institutions
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.recommendedHospitals.map((hosp) => (
                    <div
                      key={hosp._id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-800 text-xs leading-snug">
                        {hosp.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {hosp.city}, {hosp.state}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {hosp.accreditations?.map((acc, i) => (
                          <span
                            key={i}
                            className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-bold"
                          >
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
