import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { treatmentService } from '../services/treatmentService';
import { useCurrency } from '../context/CurrencyContext';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Activity,
  Search,
  TrendingDown,
  Clock,
  CheckCircle2,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cosmetic & Plastic Surgery',
  'Dental Treatments',
  'Fertility & IVF Care',
  'Hair Restoration',
  'Cardiology & Heart Surgery',
  'Orthopedics & Joint Replacement',
  'Oncology & Cancer Care',
  'Ayurveda & Wellness',
];

export const TreatmentsPage = () => {
  const { formatPrice } = useCurrency();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchTreatments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await treatmentService.getTreatments(params);
      setTreatments(res.treatments || []);
    } catch (err) {
      setError(err.message || 'Failed to load treatments catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTreatments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-400" />
            Transparent Medical Packages
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Medical Treatments & Global Cost Comparisons
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Compare procedural costs in India against the United States, United Kingdom, and Europe. All packages feature certified hospital admissions, medications, surgeon fees, and post-op care.
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                category === cat
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs max-w-2xl"
        >
          <div className="relative flex-1 flex items-center pl-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search procedure name (e.g. Rhinoplasty, Dental Implants, IVF)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            Search
          </button>
        </form>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="text-center py-20">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading medical treatments catalog...</p>
        </div>
      ) : treatments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <Activity className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No treatments found</h3>
          <button
            onClick={() => {
              setCategory('All');
              setSearch('');
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatments.map((t) => {
            const savingsPct = Math.round(((t.costUSAUSD - t.costIndiaUSD) / t.costUSAUSD) * 100);
            return (
              <div
                key={t._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-card-hover transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={t.heroImage}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-navy-950/80 backdrop-blur-xs text-teal-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                        {t.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {t.avgStayDays} Days Inpatient Stay
                      </span>
                      <span className="bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        Save {savingsPct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition">
                      <Link to={`/treatments/${t.slug}`}>{t.name}</Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {t.shortSummary || t.description}
                    </p>

                    {/* Cost Matrix Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">USA / UK Average</span>
                        <span className="font-bold text-slate-500 line-through">
                          {formatPrice(t.costUSAUSD)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-teal-700 font-bold block">India Package</span>
                        <span className="font-extrabold text-teal-700 text-sm">
                          {formatPrice(t.costIndiaUSD)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 gap-2 mt-2">
                  <Link
                    to={`/treatments/${t.slug}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    Procedure Guide <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/compare?ids=${t.slug}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    Compare
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
