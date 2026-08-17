import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hospitalService } from '../services/hospitalService';
import { useCurrency } from '../context/CurrencyContext';
import { BookingModal } from '../components/booking/BookingModal';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Building2,
  MapPin,
  Star,
  Plane,
  ShieldCheck,
  Stethoscope,
  Bed,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Globe2,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';

export const HospitalDetailPage = () => {
  const { slugOrId } = useParams();
  const { formatPrice } = useCurrency();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await hospitalService.getHospital(slugOrId);
        setHospital(res.hospital);
        setDoctors(res.doctors || []);
        setReviews(res.reviews || []);
      } catch (err) {
        setError(err.message || 'Hospital details not found');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading healthcare provider profile...</p>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Alert type="error" message={error || 'Healthcare provider not found'} />
        <Link to="/hospitals" className="inline-block px-5 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl">
          Back to Hospitals Directory
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
        <Link to="/hospitals" className="hover:text-teal-600">Hospitals</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{hospital.name}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-1.5 items-center">
            {hospital.accreditations?.map((acc, i) => (
              <span
                key={i}
                className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full"
              >
                {acc} Certified
              </span>
            ))}
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> JCI Gold Seal Standard
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
            {hospital.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{hospital.address}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <Plane className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{hospital.airportDistanceKm} km from {hospital.airportName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-3 py-1 rounded-xl text-xs font-bold border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{hospital.rating} / 5.0 ({hospital.reviewsCount || reviews.length} Reviews)</span>
            </div>
            <div className="text-xs text-slate-500">
              Established {hospital.establishedYear || '1995'} • {hospital.bedsCount}+ Inpatient Beds
            </div>
          </div>
        </div>

        {/* Right CTA Box */}
        <div className="bg-teal-50/70 border border-teal-200 p-6 rounded-2xl space-y-4 text-center lg:text-left">
          <div>
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              International Patient Desk
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Priority Teleconsultation & Visa Invitation
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Connect directly with department heads and receive a comprehensive cost estimate within 24 hours.
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDoctorForBooking(doctors[0] || null);
              setBookingModalOpen(true);
            }}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 transition"
          >
            Request Doctor Consultation
          </button>
        </div>
      </div>

      {/* Main Grid: Overview & Services vs Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Services, Gallery */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Hospital Photo */}
          <div className="h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-xs relative">
            <img
              src={hospital.heroImage}
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* About Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              About {hospital.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {hospital.description}
            </p>
          </div>

          {/* Dedicated International Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-teal-600" />
              Specialized Services for International Patients
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hospital.internationalServices?.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Specialties */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Centers of Clinical Excellence
            </h2>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties?.map((spec, idx) => (
                <span
                  key={idx}
                  className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-xl"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Affiliated Doctors List */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Affiliated Specialists ({doctors.length})
              </h3>
            </div>

            {doctors.length === 0 ? (
              <p className="text-xs text-slate-500">No doctors listed under this facility currently.</p>
            ) : (
              <div className="space-y-4">
                {doctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 transition bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs leading-tight">
                          <Link to={`/doctors/${doc._id}`} className="hover:text-teal-600 transition">
                            {doc.fullName}
                          </Link>
                        </div>
                        <div className="text-[11px] text-teal-700 font-medium">{doc.specialty}</div>
                        <div className="text-[10px] text-slate-500">{doc.experienceYears} Years Exp.</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Fee</span>
                        <span className="font-bold text-slate-800">
                          {formatPrice(doc.consultationFeeUSD)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDoctorForBooking(doc);
                          setBookingModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified Patient Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            International Patient Feedback
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800">{rev.patientName}</div>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {rev.patientCountry}
                  </span>
                </div>
                <div className="flex text-amber-400 text-xs">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedHospital={hospital}
        preselectedDoctor={selectedDoctorForBooking}
      />
    </div>
  );
};
