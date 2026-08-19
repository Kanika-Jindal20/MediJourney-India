import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { hospitalService } from '../services/hospitalService';
import { BookingModal } from '../components/booking/BookingModal';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Building2,
  Search,
  MapPin,
  Star,
  Plane,
  ShieldCheck,
  Filter,
  ChevronRight,
  Sparkles,
  Bed,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Check,
} from 'lucide-react';

const CITIES = ['All', 'Delhi NCR', 'Mumbai', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kochi'];
const SPECIALTIES = [
  'All',
  'Cardiology & Heart Surgery',
  'Orthopedics & Joint Replacement',
  'Cosmetic & Plastic Surgery',
  'Dental Treatments',
  'Fertility & IVF Care',
  'Hair Restoration',
  'Oncology & Cancer Care',
  'Ayurveda & Wellness',
];
const ACCREDITATIONS = ['All', 'JCI', 'NABH', 'NABL', 'ISO 9001'];
const FACILITIES = [
  { id: 'All', label: 'All Services' },
  { id: 'Airport', label: '✈️ Airport Chauffeur' },
  { id: 'Lounge', label: '🛋️ International Lounge' },
  { id: 'Translators', label: '🌐 Multi-Lingual Interpreters' },
  { id: 'Robotic', label: '🤖 Robotic Surgery Suite' },
  { id: 'Halal', label: '🥗 Halal / Custom Diet' },
];

export const HospitalsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All');
  const [accreditation, setAccreditation] = useState('All');
  const [facility, setFacility] = useState('All');
  const [minRating, setMinRating] = useState('0');
  const [sortBy, setSortBy] = useState('rating');

  // Hospital Comparison State
  const [compareHospitals, setCompareHospitals] = useState([]);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);

  // Live stats derived from fetched hospitals
  const avgRating =
    hospitals.length > 0
      ? (hospitals.reduce((sum, h) => sum + (h.rating || 0), 0) / hospitals.length).toFixed(1)
      : null;
  const uniqueCities = [...new Set(hospitals.map((h) => h.city))].length;


  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (city !== 'All') params.city = city;
      if (specialty !== 'All') params.specialty = specialty;
      if (accreditation !== 'All') params.accreditation = accreditation;
      if (facility !== 'All') params.facility = facility;
      if (minRating !== '0') params.minRating = minRating;
      if (sortBy) params.sortBy = sortBy;

      const res = await hospitalService.getHospitals(params);
      setHospitals(res.hospitals || []);
    } catch (err) {
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [city, specialty, accreditation, facility, minRating, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const toggleCompare = (hospital) => {
    if (compareHospitals.some((h) => h._id === hospital._id)) {
      setCompareHospitals(compareHospitals.filter((h) => h._id !== hospital._id));
    } else {
      if (compareHospitals.length >= 3) {
        alert('You can compare up to 3 hospitals simultaneously.');
        return;
      }
      setCompareHospitals([...compareHospitals, hospital]);
    }
  };

  const handleLaunchComparison = () => {
    const slugs = compareHospitals.map((h) => h.slug).join(',');
    navigate(`/compare?tab=hospitals&ids=${slugs}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Accredited Centers Only (JCI & NABH Verified)
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Accredited Hospitals & Quaternary Centers in India
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Discover premier quaternary medical institutions featuring international patient concierge lounges, English & multilingual medical teams (Arabic, Russian, French), and cutting-edge robotic surgical suites.
          </p>
          <div className="pt-1">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 underline underline-offset-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Explore our Discovery Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Facility Quick Filter Pills */}
      {/* Live Stats Strip */}
      {!loading && hospitals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Hospitals Listed', value: hospitals.length, icon: '🏥' },
            { label: 'Indian Cities', value: uniqueCities, icon: '🗺️' },
            { label: 'Avg Patient Rating', value: avgRating ? `${avgRating} ★` : '4.9 ★', icon: '⭐' },
            { label: 'Accreditation Standards', value: 'JCI · NABH · ISO', icon: '🛡️' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs"
            >
              <span className="text-xl">{stat.icon}</span>
              <div>
                <p className="font-extrabold text-slate-900 text-lg leading-tight">{stat.value}</p>
                <p className="text-[11px] text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facility Quick Filter Pills */}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FACILITIES.map((fac) => (
          <button
            key={fac.id}
            onClick={() => setFacility(fac.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              facility === fac.id
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {fac.label}
          </button>
        ))}
      </div>

      {/* Floating Comparison Drawer (when items selected) */}
      {compareHospitals.length > 0 && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 sticky top-20 z-30 border border-teal-500/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-teal-400" />
            <div className="text-xs">
              <span className="font-bold">Comparing ({compareHospitals.length}/3 Hospitals):</span>{' '}
              <span className="text-teal-200">
                {compareHospitals.map((h) => h.name).join(' • ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareHospitals([])}
              className="text-xs text-slate-300 hover:text-white px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleLaunchComparison}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>View Side-by-Side Comparison</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar + Hospital List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" /> Filter Directory
              </span>
              <button
                onClick={() => {
                  setSearch('');
                  setCity('All');
                  setSpecialty('All');
                  setAccreditation('All');
                  setFacility('All');
                  setMinRating('0');
                  setSortBy('rating');
                }}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" /> Sort Results
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="airportDistanceKm">✈️ Closest to International Airport</option>
                <option value="bedsCount">🛏️ Largest Bed Capacity</option>
                <option value="name">🔤 Hospital Name (A to Z)</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Medical Hub (City)
              </label>
              <div className="space-y-1">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      city === c
                        ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c === 'All' ? 'All Indian Cities' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Clinical Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Accreditation Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Accreditation
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ACCREDITATIONS.map((acc) => (
                  <button
                    key={acc}
                    onClick={() => setAccreditation(acc)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      accreditation === acc
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">4.5 Stars & Above</option>
                <option value="4.8">4.8 Stars & Above</option>
                <option value="4.9">4.9 Stars & Above</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Content Area: Search Bar + Hospital Cards */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search hospital by name, specialty, service or landmark..."
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

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{hospitals.length}</strong> accredited healthcare institutions
            </span>
            <span className="hidden sm:inline">Verified by Ministry of Health & Family Welfare Standards</span>
          </div>

          {error && <Alert type="error" message={error} />}

          {loading ? (
            <div className="text-center py-20">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading accredited hospitals...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No matching hospitals found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search query or selecting a broader city or specialty filter.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setCity('All');
                  setSpecialty('All');
                  setFacility('All');
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hospitals.map((hosp) => {
                const isComparing = compareHospitals.some((h) => h._id === hosp._id);
                return (
                  <div
                    key={hosp._id}
                    className={`bg-white rounded-2xl overflow-hidden border transition group flex flex-col justify-between ${
                      isComparing
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200 shadow-xs hover:shadow-card-hover'
                    }`}
                  >
                    <div>
                      {/* Hero image with overlay badges */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={hosp.heroImage}
                          alt={hosp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          {hosp.accreditations?.map((acc, i) => (
                            <span
                              key={i}
                              className="bg-navy-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30"
                            >
                              {acc}
                            </span>
                          ))}
                        </div>

                        {/* Compare Toggle Pill */}
                        <div className="absolute top-3 right-16">
                          <button
                            onClick={() => toggleCompare(hosp)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-md transition shadow-xs ${
                              isComparing
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-900/80 text-slate-200 hover:bg-slate-900'
                            }`}
                          >
                            {isComparing ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 text-white">
                          <div className="text-xs font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-400" />
                            <span>{hosp.city}, {hosp.state}</span>
                          </div>
                        </div>

                        {/* Top Rated ribbon */}
                        {hosp.rating >= 4.9 && (
                          <div className="absolute bottom-3 right-3">
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                              🏆 Top Rated
                            </span>
                          </div>
                        )}


                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{hosp.rating}</span>
                        </div>
                      </div>

                      {/* Details Body */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition">
                            <Link to={`/hospitals/${hosp.slug}`}>{hosp.name}</Link>
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {hosp.description}
                          </p>
                        </div>

                        {/* Key specs */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Plane className="w-3.5 h-3.5 text-teal-600" />
                            <span>{hosp.airportDistanceKm} km to Int'l Airport</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-teal-600" />
                            <span>{hosp.bedsCount}+ Inpatient Beds</span>
                          </div>
                        </div>

                        {/* International Services Chips */}
                        {hosp.internationalServices?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {hosp.internationalServices.slice(0, 2).map((srv, idx) => (
                              <span
                                key={idx}
                                className="bg-teal-50 text-teal-800 text-[10px] px-2 py-0.5 rounded font-medium border border-teal-100 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-teal-600" />
                                {srv}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Specialties tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {hosp.specialties?.slice(0, 3).map((spec, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                          {hosp.specialties?.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                              +{hosp.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom CTA */}
                    <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <Link
                        to={`/hospitals/${hosp.slug}`}
                        className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition"
                      >
                        View Profile
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedHospitalForBooking(hosp);
                          setBookingModalOpen(true);
                        }}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Book Consultation
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedHospital={selectedHospitalForBooking}
      />
    </div>
  );
};
