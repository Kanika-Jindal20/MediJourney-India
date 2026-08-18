import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  SlidersHorizontal,
  Plus,
  Check,
  Calendar,
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

const STAY_DURATIONS = [
  { id: 'all', label: 'All Durations' },
  { id: '1-3', label: '⚡ 1 - 3 Days Inpatient' },
  { id: '4-7', label: '🏥 4 - 7 Days Stay' },
  { id: '8+', label: '🛌 8+ Days Extended' },
];

export const TreatmentsPage = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [stayDuration, setStayDuration] = useState('all');

  // Compare selection state
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const fetchTreatments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (stayDuration !== 'all') params.stayDuration = stayDuration;

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
  }, [category, sortBy, stayDuration]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTreatments();
  };

  const toggleCompare = (treatment) => {
    if (selectedForCompare.some((t) => t._id === treatment._id)) {
      setSelectedForCompare(selectedForCompare.filter((t) => t._id !== treatment._id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 treatments side-by-side.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, treatment]);
    }
  };

  const handleLaunchCompare = () => {
    const slugs = selectedForCompare.map((t) => t.slug).join(',');
    navigate(`/compare?tab=treatments&ids=${slugs}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-400" />
            Transparent Medical Procedure Packages
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Medical Treatments & Global Cost Comparisons
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Compare procedural costs in India against the United States, United Kingdom, and Europe. All packages feature certified hospital admissions, surgeon fees, luxury room accommodation, and post-op care.
          </p>
        </div>
      </div>

      {/* Floating Comparison Drawer (when items selected) */}
      {selectedForCompare.length > 0 && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 sticky top-20 z-30 border border-teal-500/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-teal-400" />
            <div className="text-xs">
              <span className="font-bold">Comparing ({selectedForCompare.length}/3 Procedures):</span>{' '}
              <span className="text-teal-200">
                {selectedForCompare.map((t) => t.name).join(' • ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-slate-300 hover:text-white px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleLaunchCompare}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>View Side-by-Side Comparison</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Category Pills & Filters */}
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

        {/* Search Bar + Sort & Duration Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center pl-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search procedure name (e.g. Rhinoplasty, Dental Implants, IVF, CABG)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
            {/* Stay Duration Filter */}
            <select
              value={stayDuration}
              onChange={(e) => setStayDuration(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {STAY_DURATIONS.map((dur) => (
                <option key={dur.id} value={dur.id}>
                  {dur.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="popular">🔥 Most Popular</option>
              <option value="costAsc">💰 Lowest Cost in India</option>
              <option value="recoveryAsc">⚡ Fastest Recovery & Stay</option>
              <option value="costDesc">💎 Premium Complex Packages</option>
              <option value="name">🔤 Procedure (A to Z)</option>
            </select>
          </div>
        </div>
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
              setStayDuration('all');
              setSortBy('popular');
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
            const isComparing = selectedForCompare.some((item) => item._id === t._id);

            return (
              <div
                key={t._id}
                className={`bg-white rounded-3xl overflow-hidden border transition group flex flex-col justify-between ${
                  isComparing
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 shadow-xs hover:shadow-card-hover'
                }`}
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

                    {/* Quick Compare Button */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleCompare(t)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md transition shadow-xs ${
                          isComparing
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-900/80 text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {isComparing ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {t.avgStayDays} Days Inpatient Stay
                      </span>
                      <span className="bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        Save ~{savingsPct}%
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
                    to={`/treatments/${t.slug}`}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold transition"
                  >
                    Customize Plan
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
