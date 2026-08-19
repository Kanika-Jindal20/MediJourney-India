import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalService } from '../services/hospitalService';
import { treatmentService } from '../services/treatmentService';
import { doctorService } from '../services/doctorService';
import { useCurrency } from '../context/CurrencyContext';
import { Spinner } from '../components/common/Alert';
import {
  Building2,
  Stethoscope,
  Activity,
  MapPin,
  Star,
  TrendingDown,
  Clock,
  CheckCircle2,
  ChevronRight,
  Globe2,
  ShieldCheck,
  Plane,
  Award,
  Sparkles,
  HeartPulse,
  Bed,
} from 'lucide-react';

const INDIA_ADVANTAGE = [
  { country: 'United States', flag: '🇺🇸', savingsPct: 80, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { country: 'United Kingdom', flag: '🇬🇧', savingsPct: 75, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { country: 'Australia',      flag: '🇦🇺', savingsPct: 70, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { country: 'UAE / Gulf',     flag: '🇦🇪', savingsPct: 60, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { country: 'Thailand',       flag: '🇹🇭', savingsPct: 30, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { country: 'Singapore',      flag: '🇸🇬', savingsPct: 55, color: 'bg-sky-100 text-sky-700 border-sky-200' },
];

const WHY_INDIA = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
    title: 'JCI & NABH Accredited',
    desc: 'Every partner hospital meets rigorous international healthcare standards.',
  },
  {
    icon: <Globe2 className="w-6 h-6 text-teal-600" />,
    title: 'Multilingual Medical Teams',
    desc: 'Doctors and coordinators fluent in Arabic, Russian, French, Spanish & English.',
  },
  {
    icon: <Plane className="w-6 h-6 text-teal-600" />,
    title: 'End-to-End Travel Support',
    desc: 'Medical visa assistance, airport chauffeur, and dedicated patient concierge.',
  },
  {
    icon: <Award className="w-6 h-6 text-teal-600" />,
    title: 'World-Class Specialists',
    desc: 'Surgeons trained at Harvard, Mayo Clinic, and top European medical centers.',
  },
];

export const DiscoveryDashboardPage = () => {
  const { formatPrice } = useCurrency();

  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [popularTreatments, setPopularTreatments] = useState([]);
  const [cities, setCities] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [featRes, treatRes, cityRes, hospRes, docRes] = await Promise.all([
          hospitalService.getFeatured(),
          treatmentService.getTreatments({ isPopular: 'true', sortBy: 'popular' }),
          hospitalService.getCities(),
          hospitalService.getHospitals(),
          doctorService.getDoctors(),
        ]);
        setFeaturedHospitals(featRes.hospitals || []);
        setPopularTreatments((treatRes.treatments || []).slice(0, 6));
        setCities((cityRes.cities || []).slice(0, 6));
        setAllHospitals(hospRes.hospitals || []);
        setAllDoctors(docRes.doctors || []);
      } catch (err) {
        console.error('Discovery Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Derive stats from fetched data
  const avgRating =
    allHospitals.length > 0
      ? (allHospitals.reduce((sum, h) => sum + (h.rating || 0), 0) / allHospitals.length).toFixed(1)
      : '4.9';

  const STATS = [
    { label: 'Accredited Hospitals', value: allHospitals.length || '15+', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Expert Specialists', value: allDoctors.length || '60+', icon: <Stethoscope className="w-5 h-5" /> },
    { label: 'Treatment Packages', value: popularTreatments.length > 0 ? '30+' : '30+', icon: <Activity className="w-5 h-5" /> },
    { label: 'Avg Patient Rating', value: `${avgRating} ★`, icon: <Star className="w-5 h-5" /> },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading Discovery Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-10 overflow-hidden shadow-2xl border border-slate-800">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Discovery Dashboard
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Explore India's Premier<br />
            <span className="text-teal-400">Medical Tourism Ecosystem</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Browse accredited quaternary hospitals, world-class specialists, and transparent treatment packages — all designed for international patients seeking world-class care at a fraction of the cost.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/hospitals"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Browse Hospitals
            </Link>
            <Link
              to="/treatments"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/20 transition flex items-center gap-2"
            >
              <Activity className="w-4 h-4" /> View Treatments
            </Link>
          </div>
        </div>

        {/* Stats row inside hero */}
        <div className="relative z-10 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm"
            >
              <div className="bg-teal-500/20 text-teal-400 p-2 rounded-xl">{stat.icon}</div>
              <div>
                <p className="font-extrabold text-xl text-white">{stat.value}</p>
                <p className="text-[11px] text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── India Cost Advantage ──────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display">
              India Cost Advantage
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Average savings compared to receiving the same treatment abroad
            </p>
          </div>
          <TrendingDown className="w-8 h-8 text-teal-600 opacity-60" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INDIA_ADVANTAGE.map((c) => (
            <div
              key={c.country}
              className={`rounded-2xl border p-4 text-center space-y-1 ${c.color}`}
            >
              <p className="text-2xl">{c.flag}</p>
              <p className="text-xs font-bold leading-tight">{c.country}</p>
              <p className="text-2xl font-extrabold">
                ~{c.savingsPct}%
              </p>
              <p className="text-[10px] font-semibold opacity-70">cheaper</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Hospitals ────────────────────────────────── */}
      {featuredHospitals.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                Featured Partner Hospitals
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                JCI & NABH accredited institutions with dedicated international patient wings
              </p>
            </div>
            <Link
              to="/hospitals"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHospitals.slice(0, 6).map((hosp) => (
              <Link
                key={hosp._id}
                to={`/hospitals/${hosp.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-card-hover transition flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={hosp.heroImage}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Accreditation badges */}
                  <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                    {hosp.accreditations?.slice(0, 2).map((acc, i) => (
                      <span
                        key={i}
                        className="bg-navy-950/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/95 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    {hosp.rating}
                  </div>

                  {/* Location */}
                  <div className="absolute bottom-3 left-3 text-white text-xs flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    {hosp.city}, {hosp.state}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition">
                    {hosp.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {hosp.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-teal-600" />
                      {hosp.airportDistanceKm} km airport
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-teal-600" />
                      {hosp.bedsCount}+ beds
                    </span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {hosp.specialties?.slice(0, 2).map((s, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {hosp.specialties?.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-semibold px-1">
                        +{hosp.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Popular Treatments ────────────────────────────────── */}
      {popularTreatments.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                Most Sought-After Procedures
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Globally trusted packages with transparent, all-inclusive pricing
              </p>
            </div>
            <Link
              to="/treatments"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              All Treatments <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularTreatments.map((t) => {
              const savingsPct =
                t.costUSAUSD > 0
                  ? Math.round(((t.costUSAUSD - t.costIndiaUSD) / t.costUSAUSD) * 100)
                  : 0;
              return (
                <Link
                  key={t._id}
                  to={`/treatments/${t.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-card-hover transition flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={t.heroImage}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-navy-950/80 backdrop-blur-sm text-teal-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                        {t.category}
                      </span>
                    </div>

                    {/* Popular badge */}
                    {t.isPopular && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          🔥 Popular
                        </span>
                      </div>
                    )}

                    {/* Savings + Stay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {t.avgStayDays} Days Stay
                      </span>
                      <span className="bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        Save ~{savingsPct}% vs USA
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition">
                      {t.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {t.shortSummary || t.description}
                    </p>

                    {/* Price row */}
                    <div className="flex items-end gap-3 pt-1">
                      <div>
                        <p className="text-[10px] text-slate-400 line-through">
                          {formatPrice(t.costUSAUSD)} in USA
                        </p>
                        <p className="font-extrabold text-teal-700 text-base">
                          {formatPrice(t.costIndiaUSD)}
                          <span className="text-[10px] font-medium text-teal-600 ml-1">in India</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Medical Hubs (Cities) ─────────────────────────────── */}
      {cities.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display">
              India's Top Medical Tourism Hubs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Each city hosts world-class quaternary care facilities with direct international flight links
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cities.map((city) => (
              <Link
                key={city.name}
                to={`/hospitals?city=${encodeURIComponent(city.name)}`}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-card-hover transition p-5 text-center space-y-2"
              >
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-teal-100 transition">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">{city.name}</p>
                <p className="text-[11px] text-teal-700 font-semibold">
                  {city.hospitalCount} {city.hospitalCount === 1 ? 'Hospital' : 'Hospitals'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">{city.airport?.split('(')[0]?.trim() || 'Intl. Airport'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Why India Section ─────────────────────────────────── */}
      <section className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-10 space-y-8 border border-teal-700/30">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30">
            <HeartPulse className="w-3.5 h-3.5" /> Why Choose India
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            The Gold Standard in Medical Tourism
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            India combines cutting-edge technology, globally trained surgeons, and compassionate care — at 20–80% less than Western countries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_INDIA.map((item, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:bg-white/10 transition"
            >
              <div className="bg-teal-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust signals row */}
        <div className="flex flex-wrap justify-center gap-6 pt-2 border-t border-white/10">
          {[
            { icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />, text: '4.9 / 5.0 Patient Satisfaction' },
            { icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />, text: 'Ministry of Health Approved Partners' },
            { icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />, text: 'Medical Visa Support Included' },
            { icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />, text: '50,000+ International Patients Served' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              {item.icon}
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Bottom ───────────────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900 font-display">
          Ready to Begin Your Medical Journey?
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Use our AI-powered assistant, compare hospitals side-by-side, or browse treatment packages — we'll guide you every step of the way.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/hospitals"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" /> Explore Hospitals
          </Link>
          <Link
            to="/treatments"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> Browse Treatments
          </Link>
          <Link
            to="/compare"
            className="px-6 py-3 border border-teal-300 text-teal-700 hover:bg-teal-50 font-bold rounded-xl text-sm transition flex items-center gap-2"
          >
            Compare Side-by-Side
          </Link>
        </div>
      </section>

    </div>
  );
};
