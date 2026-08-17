import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { useCurrency } from '../context/CurrencyContext';
import { BookingModal } from '../components/booking/BookingModal';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Stethoscope,
  Search,
  Building2,
  Star,
  Award,
  Globe,
  Filter,
  CheckCircle2,
  Calendar,
  ChevronRight,
} from 'lucide-react';

const SPECIALTIES = [
  'All',
  'Cardiology & Heart Surgery',
  'Orthopedics & Joint Replacement',
  'Cosmetic & Plastic Surgery',
  'Dental Treatments',
  'Fertility & IVF Care',
  'Hair Restoration',
  'Oncology & Cancer Care',
];

const LANGUAGES = ['All', 'English', 'Arabic', 'Russian', 'French', 'Hindi'];

export const DoctorsPage = () => {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All');
  const [language, setLanguage] = useState('All');
  const [minExp, setMinExp] = useState('0');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (specialty !== 'All') params.specialty = specialty;
      if (language !== 'All') params.language = language;
      if (minExp !== '0') params.minExp = minExp;

      const res = await doctorService.getDoctors(params);
      setDoctors(res.doctors || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctors catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialty, language, minExp]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-400" />
            Board-Certified Medical Specialists
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Find Top Specialists & Chief Surgeons
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Consult directly with internationally trained specialists across India’s premier multi-super specialty institutes. Multi-lingual consultations in English, Arabic, Russian & French.
          </p>
        </div>
      </div>

      {/* Main Layout: Filters + Doctors List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" /> Filters
              </span>
              <button
                onClick={() => {
                  setSearch('');
                  setSpecialty('All');
                  setLanguage('All');
                  setMinExp('0');
                }}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Specialty Field
              </label>
              <div className="space-y-1">
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSpecialty(spec)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      specialty === spec
                        ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Spoken */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Language Spoken
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'All' ? 'All Languages' : lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Years of Clinical Experience
              </label>
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">All Experience Levels</option>
                <option value="15">15+ Years (Senior Specialists)</option>
                <option value="20">20+ Years (Department Chairmen)</option>
                <option value="30">30+ Years (Pioneers)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
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
                placeholder="Search specialist by name, procedure, or hospital..."
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
              Showing <strong className="text-slate-800">{doctors.length}</strong> verified specialist physicians
            </span>
          </div>

          {error && <Alert type="error" message={error} />}

          {loading ? (
            <div className="text-center py-20">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading medical specialists...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No doctors matched your criteria</h3>
              <button
                onClick={() => {
                  setSearch('');
                  setSpecialty('All');
                  setLanguage('All');
                  setMinExp('0');
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-card-hover transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">
                            <Link to={`/doctors/${doc._id}`} className="hover:text-teal-600 transition">
                              {doc.fullName}
                            </Link>
                          </h3>
                        </div>

                        <div className="text-xs font-semibold text-teal-700">
                          {doc.specialty}
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{doc.hospitalId?.name || 'Accredited Hospital'} ({doc.hospitalId?.city})</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </div>

                    {/* Meta badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Experience</span>
                        <span className="font-semibold">{doc.experienceYears} Years • {doc.surgeriesCount?.toLocaleString()}+ Surgeries</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Languages</span>
                        <span className="font-semibold">{doc.languagesSpoken?.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatPrice(doc.consultationFeeUSD)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/doctors/${doc._id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedDoctorForBooking(doc);
                          setBookingModalOpen(true);
                        }}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDoctor={selectedDoctorForBooking}
      />
    </div>
  );
};
