import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { treatmentService } from '../services/treatmentService';
import { useCurrency } from '../context/CurrencyContext';
import { BookingModal } from '../components/booking/BookingModal';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingDown,
  Building2,
  Stethoscope,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plane,
  HeartHandshake,
  HelpCircle,
  Calculator,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

export const TreatmentDetailPage = () => {
  const { slug } = useParams();
  const { formatPrice } = useCurrency();

  const [treatment, setTreatment] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [topHospitals, setTopHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Package Customizer Addons
  const [roomTier, setRoomTier] = useState('standard'); // 'standard' | 'deluxe' (+350) | 'presidential' (+750)
  const [includeCompanion, setIncludeCompanion] = useState(false); // +250
  const [includeRehab, setIncludeRehab] = useState(false); // +200
  const [includePersonalInterpreter, setIncludePersonalInterpreter] = useState(false); // +150

  // Active FAQ Accordion
  const [openFaq, setOpenFaq] = useState(null);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  useEffect(() => {
    const fetchTreatment = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await treatmentService.getTreatment(slug);
        setTreatment(res.treatment);
        setRecommendedDoctors(res.recommendedDoctors || []);
        setTopHospitals(res.topHospitals || []);
      } catch (err) {
        setError(err.message || 'Treatment details not found');
      } finally {
        setLoading(false);
      }
    };
    fetchTreatment();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading clinical procedure guide...</p>
      </div>
    );
  }

  if (error || !treatment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Alert type="error" message={error || 'Treatment not found'} />
        <Link to="/treatments" className="inline-block px-5 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl">
          Back to Treatments Catalog
        </Link>
      </div>
    );
  }

  // Calculate customized package cost
  let roomAddon = 0;
  if (roomTier === 'deluxe') roomAddon = 350;
  if (roomTier === 'presidential') roomAddon = 750;

  const totalCalculatedCost =
    treatment.costIndiaUSD +
    roomAddon +
    (includeCompanion ? 250 : 0) +
    (includeRehab ? 200 : 0) +
    (includePersonalInterpreter ? 150 : 0);

  const savingsPct = Math.round(((treatment.costUSAUSD - treatment.costIndiaUSD) / treatment.costUSAUSD) * 100);

  // Global benchmark countries data
  const globalBenchmarks = [
    { country: '🇮🇳 India (MediJourney)', cost: treatment.costIndiaUSD, isIndia: true },
    { country: '🇺🇸 United States', cost: treatment.costUSAUSD },
    { country: '🇬🇧 United Kingdom', cost: treatment.costUKUSD || Math.round(treatment.costIndiaUSD * 3.8) },
    { country: '🇨🇦 Canada', cost: Math.round(treatment.costIndiaUSD * 4.2) },
    { country: '🇦🇺 Australia', cost: Math.round(treatment.costIndiaUSD * 3.9) },
    { country: '🇦🇪 UAE (Dubai)', cost: Math.round(treatment.costIndiaUSD * 2.2) },
    { country: '🇹🇭 Thailand', cost: treatment.costThailandUSD || Math.round(treatment.costIndiaUSD * 1.5) },
    { country: '🇸🇬 Singapore', cost: Math.round(treatment.costIndiaUSD * 2.8) },
  ];

  const faqs = [
    {
      q: 'How does MediJourney coordinate the hospital admission and surgeon allocation?',
      a: 'Once you book or request a quote, our clinical triage team reviews your reports with the department head and issues a detailed medical opinion, cost quotation, and e-Medical Visa Invitation Letter within 24 hours.',
    },
    {
      q: 'Is there a companion package for a family member traveling with me?',
      a: 'Yes. Most hospital suites include accommodation and meals for one accompanying family member, along with airport chauffeur transfers and local assistance.',
    },
    {
      q: 'What happens if post-operative follow-up is needed after I return home?',
      a: 'All our treatment packages include 3 complimentary teleconsultations with your chief operating surgeon over 6 months post-discharge.',
    },
    {
      q: 'Are the medical devices and surgical implants FDA / CE approved?',
      a: 'All implants, surgical consumables, and robotic platforms (da Vinci, Mako, Stryker) used in our accredited partner hospitals are 100% US-FDA or European CE certified.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex text-xs text-slate-500 gap-1.5 items-center">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link to="/treatments" className="hover:text-teal-600">Treatments</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{treatment.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-3 py-1 rounded-full">
              {treatment.category}
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Save ~{savingsPct}% vs USA
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
              Success Rate: {treatment.successRate || '98.4%'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
            {treatment.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {treatment.shortSummary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Inpatient Hospital Stay</span>
              <span className="font-bold text-slate-800">{treatment.avgStayDays} Days Inpatient</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Recovery in India</span>
              <span className="font-bold text-slate-800">{treatment.avgRecoveryDays} Days Post-Op</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px]">Visa Requirement</span>
              <span className="font-bold text-slate-800">e-Medical Visa (Triple Entry)</span>
            </div>
          </div>
        </div>

        {/* Price Card Box */}
        <div className="bg-gradient-to-br from-navy-950 to-slate-900 text-white p-6 rounded-3xl space-y-5 text-center lg:text-left shadow-xl border border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest block">
              Estimated Total Package Price
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-display mt-1">
              {formatPrice(totalCalculatedCost)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 line-through">
              USA Standard Cost: {formatPrice(treatment.costUSAUSD)}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedDoctorForBooking(recommendedDoctors[0] || null);
                setBookingModalOpen(true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl font-bold text-xs shadow-md transition"
            >
              Request Free Medical Assessment
            </button>

            <Link
              to={`/compare?tab=treatments&ids=${treatment.slug}`}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-white/15"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare with Other Procedures</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Calculator, Roadmap, FAQs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo */}
          <div className="h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
            <img
              src={treatment.heroImage}
              alt={treatment.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Interactive Medical Package Customizer */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  Interactive Treatment Package Customizer
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your preferred accommodation tier and companion add-ons for an accurate live quote.
                </p>
              </div>
            </div>

            {/* Room Tiers */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                1. Select Inpatient Room Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'standard', name: 'Private Room', price: 0, desc: 'Ensuite bath, TV, companion sofa' },
                  { id: 'deluxe', name: 'Deluxe Suite', price: 350, desc: 'Living room, kitchenette, guest bed' },
                  { id: 'presidential', name: 'Presidential Suite', price: 750, desc: 'VIP lounge, dedicated butler, chef menu' },
                ].map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setRoomTier(room.id)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      roomTier === room.id
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{room.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{room.desc}</div>
                    </div>
                    <div className="text-xs font-bold text-teal-700 mt-3">
                      {room.price === 0 ? 'Included' : `+${formatPrice(room.price)}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Services Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                2. Optional Travel & Care Add-ons
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    checked: includeCompanion,
                    toggle: () => setIncludeCompanion(!includeCompanion),
                    label: 'Companion Support Package (Meals, Hospital Guest Bed, Airport Chauffeur)',
                    cost: 250,
                  },
                  {
                    checked: includeRehab,
                    toggle: () => setIncludeRehab(!includeRehab),
                    label: 'Post-Op Physical Therapy & Rehabilitation Sessions (5 Sessions)',
                    cost: 200,
                  },
                  {
                    checked: includePersonalInterpreter,
                    toggle: () => setIncludePersonalInterpreter(!includePersonalInterpreter),
                    label: 'Dedicated 1-on-1 Multi-Lingual Personal Care Coordinator (Arabic/Russian/French)',
                    cost: 150,
                  },
                ].map((addon, idx) => (
                  <div
                    key={idx}
                    onClick={addon.toggle}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      addon.checked ? 'bg-teal-50/70 border-teal-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                          addon.checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {addon.checked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-medium text-slate-800">{addon.label}</span>
                    </div>
                    <span className="font-bold text-teal-800 whitespace-nowrap ml-2">
                      +{formatPrice(addon.cost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation Strip */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Customized Package Estimate</span>
                <span className="text-xl font-extrabold text-teal-400">{formatPrice(totalCalculatedCost)}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedDoctorForBooking(recommendedDoctors[0] || null);
                  setBookingModalOpen(true);
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
              >
                Lock In This Quote
              </button>
            </div>
          </div>

          {/* Global Cost Benchmark Matrix */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Global Price Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare typical procedural costs for {treatment.name} across premier worldwide destinations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Country / Region</th>
                    <th className="px-4 py-3">Estimated Total Cost</th>
                    <th className="px-4 py-3 text-right">Savings with MediJourney</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {globalBenchmarks.map((b, idx) => {
                    const countrySavings = b.cost > treatment.costIndiaUSD
                      ? Math.round(((b.cost - treatment.costIndiaUSD) / b.cost) * 100)
                      : 0;

                    return (
                      <tr
                        key={idx}
                        className={b.isIndia ? 'bg-teal-50/70 font-bold text-teal-950' : 'hover:bg-slate-50/50 text-slate-700'}
                      >
                        <td className="px-4 py-3 flex items-center gap-1.5">
                          {b.country}
                          {b.isIndia && (
                            <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              Best Value
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatPrice(b.cost)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {b.isIndia ? (
                            <span className="text-teal-700 font-bold">Baseline Rate</span>
                          ) : (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Save {countrySavings}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Day-by-Day Travel & Clinical Recovery Roadmap */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <Plane className="w-5 h-5 text-teal-600" />
              Day-by-Day Travel & Clinical Recovery Roadmap
            </h2>

            <div className="space-y-4">
              {[
                { day: 'Day 1', title: 'Arrival & VIP Airport Concierge', desc: 'Chauffeur airport pickup, hospital check-in, private suite orientation, and meet your international care manager.' },
                { day: 'Day 2', title: 'Pre-Operative Diagnostics & Surgeon Consultation', desc: 'Comprehensive blood panels, imaging (MRI/CT), anesthesia review, and surgical plan finalization.' },
                { day: 'Day 3', title: 'Procedure Execution & Recovery', desc: 'Procedure carried out in sterile JCI operating theater with advanced robotic guidance; post-op monitoring.' },
                { day: `Day 4 - ${treatment.avgStayDays}`, title: 'Inpatient Hospital Care', desc: 'Dedicated nursing, pain management protocol, surgeon rounds, and early mobilization.' },
                { day: `Day ${treatment.avgStayDays + 1} - ${treatment.avgRecoveryDays}`, title: 'Recuperation & Local Tourism', desc: 'Discharge to partnered luxury recovery hotel, physical therapy sessions, and leisure sightseeing.' },
                { day: `Day ${treatment.avgRecoveryDays + 1}`, title: 'Fit-to-Fly Certification & Departure', desc: 'Final clinical sign-off, medical records package, airport transfer, and scheduling follow-up teleconsultations.' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-16 px-2 py-1 rounded-xl bg-teal-600 text-white text-[11px] font-bold text-center shrink-0">
                    {step.day}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{step.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Clinical Overview & Methodology
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {treatment.description}
            </p>
          </div>

          {/* Procedure Steps */}
          {treatment.procedureSteps?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Step-by-Step Surgical Protocol
              </h2>

              <div className="space-y-4">
                {treatment.procedureSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 font-medium pt-1">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Inclusions */}
          {treatment.inclusions?.length > 0 && (
            <div className="bg-teal-50/60 rounded-3xl p-6 sm:p-8 border border-teal-200/80 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Standard Inclusions with Every Package
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treatment.inclusions.map((inc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-800 font-medium bg-white p-3 rounded-xl border border-teal-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical FAQs Accordion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              Frequently Asked Questions by Overseas Patients
            </h2>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-100/50 transition"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Top Doctors & Hospitals */}
        <div className="space-y-8">
          {/* Top Doctors */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Specialist Surgeons
            </h3>

            <div className="space-y-3">
              {recommendedDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 transition bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.fullName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        <Link to={`/doctors/${doc._id}`} className="hover:text-teal-600">
                          {doc.fullName}
                        </Link>
                      </div>
                      <div className="text-[11px] text-teal-700 font-medium">{doc.specialty}</div>
                      <div className="text-[10px] text-slate-400">{doc.experienceYears} Years Exp.</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDoctorForBooking(doc);
                      setBookingModalOpen(true);
                    }}
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Book with {doc.fullName.split(' ')[0]} {doc.fullName.split(' ')[1]}
                  </button>
                </div>
              ))}
            </div>

            {/* Top Hospitals */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Accredited Centers
              </h3>

              <div className="space-y-2">
                {topHospitals.map((hosp) => (
                  <div
                    key={hosp._id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="font-bold text-slate-900">
                      <Link to={`/hospitals/${hosp.slug}`} className="hover:text-teal-600">
                        {hosp.name}
                      </Link>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {hosp.city} • {hosp.accreditations?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedTreatment={treatment}
        preselectedDoctor={selectedDoctorForBooking}
      />
    </div>
  );
};
