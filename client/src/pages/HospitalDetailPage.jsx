import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Activity,
  Layers,
  Sparkles,
  Info,
  Clock,
  TrendingDown,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export const HospitalDetailPage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Tab: 'overview' | 'treatments' | 'services' | 'doctors' | 'facilities' | 'reviews'
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
        setTreatments(res.treatments || []);
        if (res.hospital?.heroImage) {
          setSelectedPhoto(res.hospital.heroImage);
        }
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

  const allGalleryImages = [hospital.heroImage, ...(hospital.galleryImages || [])].filter(Boolean);

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
              <ShieldCheck className="w-3.5 h-3.5" /> JCI / NABH Verified Quality
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

          <div className="flex flex-wrap items-center gap-4 pt-2">
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
        <div className="bg-gradient-to-br from-teal-900 to-navy-950 text-white p-6 rounded-3xl space-y-4 text-center lg:text-left shadow-xl border border-teal-500/30">
          <div>
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
              International Patient Concierge
            </span>
            <div className="text-base font-bold text-white mt-1">
              Priority Consultation & Visa Desk
            </div>
            <div className="text-xs text-slate-300 mt-1 leading-relaxed">
              Direct access to department heads, rapid quotation within 24 hours, and official hospital e-Visa invitation letters.
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedDoctorForBooking(doctors[0] || null);
                setBookingModalOpen(true);
              }}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 rounded-xl font-bold text-xs shadow-md transition"
            >
              Request Consultation & Treatment Plan
            </button>

            <Link
              to={`/compare?tab=hospitals&ids=${hospital.slug}`}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-white/15"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare with Other Hospitals</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Photo Gallery & Highlight Lightbox */}
      <div className="space-y-3">
        <div className="h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
          <img
            src={selectedPhoto || hospital.heroImage}
            alt={hospital.name}
            className="w-full h-full object-cover transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 text-white text-xs font-semibold bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-teal-400" />
            <span>{hospital.name} • Certified Medical Campus</span>
          </div>
        </div>

        {allGalleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {allGalleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhoto(img)}
                className={`h-20 w-28 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                  selectedPhoto === img ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Campus preview" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Tabs Header */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none pb-2">
          {[
            { id: 'overview', label: 'Overview & Highlights', icon: Info },
            { id: 'treatments', label: `Available Treatments (${treatments.length})`, icon: Activity },
            { id: 'services', label: 'International Patient Care', icon: Globe2 },
            { id: 'doctors', label: `Specialists (${doctors.length})`, icon: Stethoscope },
            { id: 'facilities', label: 'Technology & Suites', icon: Building2 },
            { id: 'reviews', label: `Patient Reviews (${reviews.length})`, icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  About {hospital.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {hospital.description}
                </p>
              </div>

              {/* Centers of Excellence */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600" />
                  Centers of Clinical Excellence
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hospital.specialties?.map((spec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center gap-2 text-xs font-semibold text-teal-900"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Logistics Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-teal-600" />
                  Travel & Airport Logistics
                </h3>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Primary Airport</span>
                    <span className="font-bold text-slate-900">{hospital.airportName}</span>
                    <div className="text-[11px] text-teal-700 font-semibold">{hospital.airportDistanceKm} km (~25-40 min transit)</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Location & City</span>
                    <span className="font-bold text-slate-900">{hospital.city}, {hospital.state}</span>
                    <div className="text-[11px] text-slate-500">{hospital.address}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-100 space-y-1 text-teal-950">
                    <span className="font-bold block">International Desk Support:</span>
                    <p className="text-[11px] text-slate-600">
                      Complimentary private sedan pickup, guest lounge access, and local 4G SIM card upon landing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AVAILABLE TREATMENTS */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Key Treatment Packages Available at {hospital.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Transparent international packages including surgeon charges, inpatient luxury room stay, diagnostics, and post-op care.
              </p>
            </div>

            {treatments.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                Please contact the international coordinator for specialized procedure quotes.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {treatments.map((t) => {
                  const savingsPct = Math.round(((t.costUSAUSD - t.costIndiaUSD) / t.costUSAUSD) * 100);
                  return (
                    <div
                      key={t._id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-card transition flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                          {t.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          <Link to={`/treatments/${t.slug}`} className="hover:text-teal-700">
                            {t.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{t.shortSummary}</p>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">India Package</span>
                            <span className="font-bold text-teal-700 text-sm">{formatPrice(t.costIndiaUSD)}</span>
                          </div>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            Save ~{savingsPct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <Link to={`/treatments/${t.slug}`} className="font-bold text-teal-700 hover:underline">
                          View Procedure Guide
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedDoctorForBooking(doctors[0] || null);
                            setBookingModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-xl font-bold shadow-xs hover:bg-teal-700"
                        >
                          Book Package
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERNATIONAL SERVICES */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-teal-600" />
                Comprehensive International Patient Care
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dedicated infrastructure crafted specifically to make traveling to India for surgery as comfortable and transparent as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospital.internationalServices?.map((service, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs text-slate-800 font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">{service}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Complimentary for all admitted international patients.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SPECIALISTS */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Affiliated Senior Consultants & Chief Surgeons ({doctors.length})
            </h2>

            {doctors.length === 0 ? (
              <p className="text-xs text-slate-500">No doctors listed under this facility currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 transition shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight">
                          <Link to={`/doctors/${doc._id}`} className="hover:text-teal-600 transition">
                            {doc.fullName}
                          </Link>
                        </div>
                        <div className="text-xs text-teal-700 font-medium">{doc.specialty}</div>
                        <div className="text-[11px] text-slate-500">{doc.experienceYears} Years Experience</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{doc.bio}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                        <span className="font-bold text-slate-800">{formatPrice(doc.consultationFeeUSD)}</span>
                      </div>

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
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FACILITIES & TECHNOLOGY */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Advanced Clinical Infrastructure & Surgical Equipment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(hospital.facilities || ['Robotic Surgery Unit', 'Hybrid Cath Lab', 'Intraoperative MRI', 'High-Flexion Operating Theaters']).map((fac, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3"
                >
                  <Building2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{fac}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Complies with international patient safety and sterile infection control standards.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              Verified Overseas Patient Feedback ({reviews.length})
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
      </div>

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
