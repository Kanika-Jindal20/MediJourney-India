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
} from 'lucide-react';

export const TreatmentDetailPage = () => {
  const { slug } = useParams();
  const { formatPrice } = useCurrency();

  const [treatment, setTreatment] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [topHospitals, setTopHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const savingsPct = Math.round(((treatment.costUSAUSD - treatment.costIndiaUSD) / treatment.costUSAUSD) * 100);

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
              <TrendingDown className="w-3.5 h-3.5" /> Save {savingsPct}% vs USA
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
              Success Rate: {treatment.successRate || '98%'}
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
              <span className="font-bold text-slate-800">e-Medical Visa (60 Days)</span>
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
              {formatPrice(treatment.costIndiaUSD)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 line-through">
              USA Standard Quote: {formatPrice(treatment.costUSAUSD)}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDoctorForBooking(recommendedDoctors[0] || null);
              setBookingModalOpen(true);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl font-bold text-xs shadow-md transition"
          >
            Get Free Medical Quote & Review
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Steps, Inclusions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo */}
          <div className="h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
            <img
              src={treatment.heroImage}
              alt={treatment.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Detailed Guide */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Clinical Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {treatment.description}
            </p>
          </div>

          {/* Procedure Steps */}
          {treatment.procedureSteps?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Step-by-Step Treatment Protocol
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
                What's Included in the Indian Package
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
        </div>

        {/* Right Col: Top Doctors & Hospitals */}
        <div className="space-y-8">
          {/* Top Doctors */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
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
          </div>

          {/* Top Hospitals */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Accredited Centers
            </h3>

            <div className="space-y-3">
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
