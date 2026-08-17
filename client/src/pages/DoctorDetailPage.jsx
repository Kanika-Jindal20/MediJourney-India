import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { useCurrency } from '../context/CurrencyContext';
import { BookingModal } from '../components/booking/BookingModal';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Stethoscope,
  Building2,
  Star,
  Award,
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export const DoctorDetailPage = () => {
  const { id } = useParams();
  const { formatPrice } = useCurrency();

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await doctorService.getDoctor(id);
        setDoctor(res.doctor);
        setSlots(res.slots || []);
        setReviews(res.reviews || []);
      } catch (err) {
        setError(err.message || 'Doctor profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading specialist doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Alert type="error" message={error || 'Doctor not found'} />
        <Link to="/doctors" className="inline-block px-5 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl">
          Back to Doctors Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex text-xs text-slate-500 gap-1.5 items-center">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link to="/doctors" className="hover:text-teal-600">Doctors</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{doctor.fullName}</span>
      </nav>

      {/* Main Grid: Doctor Profile vs Booking Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctor Bio, Stats, Subspecialties */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <img
              src={doctor.avatarUrl}
              alt={doctor.fullName}
              className="w-32 h-32 rounded-3xl object-cover border-2 border-teal-500/20 shadow-md shrink-0"
            />
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {doctor.specialty}
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {doctor.experienceYears} Years Experience
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {doctor.fullName}
              </h1>

              <div className="text-xs font-semibold text-slate-600">
                {doctor.title}
              </div>

              <div className="text-xs text-teal-800 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                <Link to={`/hospitals/${doctor.hospitalId?.slug || doctor.hospitalId?._id}`} className="underline hover:text-teal-900">
                  {doctor.hospitalId?.name || 'Accredited Hospital'} ({doctor.hospitalId?.city})
                </Link>
              </div>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500 justify-center sm:justify-start">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-800">{doctor.surgeriesCount?.toLocaleString()}+</span> Surgeries
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="font-bold text-slate-800">{doctor.rating}</span> ({doctor.reviewsCount} Reviews)
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Biography */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Professional Biography & Medical Qualifications
            </h2>
            <div className="text-xs font-bold text-teal-700 bg-teal-50 p-3 rounded-xl border border-teal-200">
              Qualifications: {doctor.qualifications}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {doctor.bio}
            </p>

            {doctor.subSpecialties?.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Key Sub-Specialties & Procedures
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {doctor.subSpecialties.map((sub, i) => (
                    <span
                      key={i}
                      className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-lg font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Consultation Booking Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6 sticky top-24">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Consultation Fee
              </span>
              <div className="text-3xl font-extrabold text-slate-900 font-display mt-0.5">
                {formatPrice(doctor.consultationFeeUSD)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Includes pre-appointment record review and 30-min live video consultation.
              </div>
            </div>

            {/* Next Available Slots Preview */}
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                Upcoming Open Slots
              </span>
              {slots.length > 0 ? (
                <div className="space-y-1.5">
                  {slots.slice(0, 4).map((slot) => (
                    <div
                      key={slot._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-700">{slot.slotDate}</span>
                      <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {slot.startTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                  Slots dynamically allocated upon request submission.
                </div>
              )}
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-teal-600/20 transition"
            >
              Request Consultation with {doctor.fullName}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDoctor={doctor}
      />
    </div>
  );
};
