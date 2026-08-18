import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalService } from '../services/hospitalService';
import { doctorService } from '../services/doctorService';
import { treatmentService } from '../services/treatmentService';
import { useCurrency } from '../context/CurrencyContext';
import { BookingModal } from '../components/booking/BookingModal';
import {
  Search,
  Building2,
  Stethoscope,
  Activity,
  ShieldCheck,
  Plane,
  HeartPulse,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Star,
  Globe,
  Award,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Cosmetic & Plastic Surgery',
    icon: '✨',
    slug: 'rhinoplasty-facial-surgery',
    desc: 'Rhinoplasty, Facelift, Liposuction & Body Contouring',
    savings: '75-85%',
  },
  {
    name: 'Dental Treatments',
    icon: '🦷',
    slug: 'all-on-4-dental-implants',
    desc: 'All-on-4 Implants, Zirconia Crowns & Smile Design',
    savings: '80-88%',
  },
  {
    name: 'Fertility & IVF Care',
    icon: '👶',
    slug: 'ivf-icsi-fertility-treatment',
    desc: 'IVF, ICSI, PGT-A Genetic Testing & Embryo Banking',
    savings: '70-85%',
  },
  {
    name: 'Hair Restoration',
    icon: '💇‍♂️',
    slug: 'hair-transplant-fue-dht',
    desc: 'Patented DHT & Ultra-Dense FUE (3,500+ Grafts)',
    savings: '80-90%',
  },
  {
    name: 'Cardiology & Heart Surgery',
    icon: '❤️',
    slug: 'cabg-coronary-artery-bypass',
    desc: 'Beating Heart CABG, Valve Repair & Robotic Cardiology',
    savings: '90-95%',
  },
  {
    name: 'Orthopedics & Joint Replacement',
    icon: '🦴',
    slug: 'robotic-total-knee-replacement',
    desc: 'Robotic Knee & Hip Arthroplasty (Mako Systems)',
    savings: '85-90%',
  },
  {
    name: 'Oncology & Cancer Care',
    icon: '🎗️',
    slug: 'cyberknife-proton-radiosurgery',
    desc: 'CyberKnife Radiosurgery & Proton Beam Therapy',
    savings: '80-90%',
  },
  {
    name: 'Ayurveda & Wellness',
    icon: '🌿',
    slug: 'kerala-panchakarma-wellness',
    desc: 'Kerala Panchakarma Detox & Post-Op Rejuvenation',
    savings: '85%',
  },
];

export const HomePage = ({ onOpenAI }) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [popularTreatments, setPopularTreatments] = useState([]);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [hospRes, docRes, treatRes] = await Promise.all([
          hospitalService.getHospitals({ isFeatured: 'true' }),
          doctorService.getDoctors({ minExp: '15' }),
          treatmentService.getTreatments({ isPopular: 'true' }),
        ]);
        setFeaturedHospitals(hospRes.hospitals?.slice(0, 4) || []);
        setTopDoctors(docRes.doctors?.slice(0, 4) || []);
        setPopularTreatments(treatRes.treatments?.slice(0, 4) || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCity !== 'All') {
      navigate(`/hospitals?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}`);
    } else {
      navigate('/hospitals');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative hero-pattern text-white pt-16 pb-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/70 to-navy-950 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-teal-500/30 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>India’s Official Medical Tourism Discovery & Booking Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              World-Class Healthcare in India at a Fraction of Global Costs
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Connect with JCI & NABH accredited hospital networks, distinguished surgeons, and receive transparent treatment packages, e-Medical Visa support, and airport pickup.
            </p>

            {/* Comprehensive Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 rounded-2xl shadow-2xl max-w-3xl mx-auto text-slate-800 flex flex-col sm:flex-row gap-2 mt-8 border border-slate-200"
            >
              <div className="flex-1 relative flex items-center pl-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search treatment (e.g. Dental Implants, IVF, Hair, Knee)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 flex items-center px-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent py-2.5 px-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none"
                >
                  <option value="All">All Medical Hubs (Pan-India)</option>
                  <option value="Delhi NCR">Delhi NCR & Gurugram</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kochi">Kochi (Kerala)</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Find Providers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-display">
                  70-90%
                </div>
                <div className="text-slate-400 text-[11px]">Cost Savings vs USA/UK</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-display">
                  500+
                </div>
                <div className="text-slate-400 text-[11px]">JCI & NABH Hospitals</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-display">
                  0 Days
                </div>
                <div className="text-slate-400 text-[11px]">Waiting Time for Surgery</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-display">
                  72 Hours
                </div>
                <div className="text-slate-400 text-[11px]">e-Medical Visa Fast Track</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP DISCOVERY WIZARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Intelligent Medical Pathway Finder
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Find Your Treatment Package & Accredited Center in 3 Clicks
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/compare?tab=treatments"
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare Procedures</span>
              </Link>
              <Link
                to="/compare?tab=hospitals"
                className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-semibold transition flex items-center gap-1 border border-teal-200"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Compare Hospitals</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">1</div>
              <h4 className="font-bold text-slate-900 text-xs">Choose Clinical Specialty</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Cardiology, Orthopedic joint replacement, IVF, Dental implants, Hair restoration, or Ayurveda.
              </p>
              <Link to="/treatments" className="text-xs font-bold text-teal-700 hover:underline block pt-1">
                Browse 30+ Procedures →
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">2</div>
              <h4 className="font-bold text-slate-900 text-xs">Select Hospital & Surgeon</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Filter by airport distance, JCI accreditation, bed count, and multi-lingual translator support.
              </p>
              <Link to="/hospitals" className="text-xs font-bold text-teal-700 hover:underline block pt-1">
                Explore 50+ Hospitals →
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">3</div>
              <h4 className="font-bold text-slate-900 text-xs">Instant Teleconsult & Visa</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Get an official hospital quotation and 60-day e-Medical Visa Invitation Letter within 24 hours.
              </p>
              <button
                onClick={() => onOpenAI && onOpenAI()}
                className="text-xs font-bold text-teal-700 hover:underline block pt-1 text-left"
              >
                Launch AI Assistant →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SPECIALTY CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              Specialized Care
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Top Medical Tourism Specialties in India
            </h2>
          </div>
          <Link
            to="/treatments"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Explore all treatments catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/treatments/${cat.slug}`}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-teal-500/80 shadow-xs hover:shadow-card-hover transition transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{cat.icon}</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Save {cat.savings}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition mb-1">
                {cat.name}
              </h3>
              <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. GLOBAL COST COMPARISON TABLE */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              Cost Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Global Price Benchmark: India vs Western Nations
            </h2>
            <p className="text-slate-400 text-xs">
              All Indian hospital packages include surgeon fees, inpatient deluxe room stay, diagnostics, and post-op follow-ups.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Medical Procedure</th>
                  <th className="py-3 px-4">USA Quote</th>
                  <th className="py-3 px-4">UK Quote</th>
                  <th className="py-3 px-4">Thailand / SG</th>
                  <th className="py-3 px-4 text-teal-400 font-bold bg-teal-950/60 rounded-t-lg">
                    India (MediJourney)
                  </th>
                  <th className="py-3 px-4">Est. Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {popularTreatments.map((t) => {
                  const savingsPct = Math.round(((t.costUSAUSD - t.costIndiaUSD) / t.costUSAUSD) * 100);
                  return (
                    <tr key={t._id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <Link to={`/treatments/${t.slug}`} className="hover:text-teal-400 transition">
                          {t.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 line-through">
                        {formatPrice(t.costUSAUSD)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {formatPrice(t.costUKUSD)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {formatPrice(t.costThailandUSD || t.costIndiaUSD * 1.6)}
                      </td>
                      <td className="py-3.5 px-4 text-teal-300 font-bold bg-teal-950/60 text-sm">
                        {formatPrice(t.costIndiaUSD)}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        {savingsPct}% Lower
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Side-by-Side Hospital Comparison Tool</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED ACCREDITED HOSPITALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              Verified Centers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              JCI & NABH Accredited Hospital Networks
            </h2>
          </div>
          <Link
            to="/hospitals"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Browse all 50+ partner hospitals <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHospitals.map((hosp) => (
            <div
              key={hosp._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-card-hover transition group flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={hosp.heroImage}
                  alt={hosp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {hosp.accreditations?.map((acc, i) => (
                    <span
                      key={i}
                      className="bg-navy-950/80 backdrop-blur-xs text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{hosp.rating}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition">
                    <Link to={`/hospitals/${hosp.slug}`}>{hosp.name}</Link>
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>{hosp.city}, {hosp.state}</span>
                    <span>•</span>
                    <span>{hosp.airportDistanceKm}km to Airport</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-teal-700 font-semibold">
                    {hosp.bedsCount}+ Bedded Quaternary
                  </span>
                  <Link
                    to={`/hospitals/${hosp.slug}`}
                    className="text-xs font-bold text-slate-800 hover:text-teal-600 flex items-center gap-0.5"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TOP SPECIALISTS & SURGEONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-teal-50/50 p-8 rounded-3xl border border-teal-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Clinical Expertise
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Internationally Trained Chief Specialists
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            View all specialist doctors <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-card transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={doc.avatarUrl}
                  alt={doc.fullName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    <Link to={`/doctors/${doc._id}`} className="hover:text-teal-600 transition">
                      {doc.fullName}
                    </Link>
                  </h3>
                  <div className="text-xs text-teal-700 font-medium mt-0.5">{doc.specialty}</div>
                  <div className="text-[11px] text-slate-500">{doc.experienceYears} Years Exp.</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {doc.qualifications}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {formatPrice(doc.consultationFeeUSD)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctorForBooking(doc);
                    setBookingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FIVE-STEP MEDICAL TOURISM JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
            Seamless Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How Your Medical Journey to India Works
          </h2>
          <p className="text-slate-600 text-xs">
            From preliminary teleconsultation to post-procedure recovery and return flight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Free Medical Review</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Upload your medical reports & MRI scans for review by top surgeons.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Video Teleconsult</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Connect 1-on-1 with the specialist to finalize surgical plan and exact quote.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-xs">e-Medical Visa Support</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Receive official hospital visa letter for quick 72-hr e-Visa authorization.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto text-sm">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Airport Chauffeur & Care</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Private airport pickup, local SIM card, currency exchange & hospital suite admission.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto text-sm">
              5
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Treatment & Safe Return</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Procedure execution, rehabilitation, fit-to-fly clearance & 1-year telemedicine.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PATIENT TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              Global Patient Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trusted by International Patients Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed italic">
                "Had All-on-4 dental implants at FMS Hyderabad. Saved over £15,000 compared to London quotes. Better equipment than Harley Street and seamless airport coordination!"
              </p>
              <div className="pt-2 border-t border-slate-700">
                <div className="font-bold text-sm text-white">Michael Davies</div>
                <div className="text-slate-400 text-xs">United Kingdom • Dental Restoration</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed italic">
                "Dr. Naresh Trehan at Medanta performed my cardiac bypass. In the US, the bill was quoted at $140k. Medanta charged under $7,000 with a luxury private suite. A true lifesaver!"
              </p>
              <div className="pt-2 border-t border-slate-700">
                <div className="font-bold text-sm text-white">David Miller</div>
                <div className="text-slate-400 text-xs">United States • Heart Surgery</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed italic">
                "After 5 failed IVF cycles in the Gulf, we visited Nova IVF Mumbai. The embryology lab is world class. We are now blessed with healthy twin boys! Unmatched care."
              </p>
              <div className="pt-2 border-t border-slate-700">
                <div className="font-bold text-sm text-white">Kareem & Fatima Al-Sayed</div>
                <div className="text-slate-400 text-xs">Oman • Fertility & IVF</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDoctor={selectedDoctorForBooking}
      />
    </div>
  );
};
