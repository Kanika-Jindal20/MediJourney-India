import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { treatmentService } from '../services/treatmentService';
import { hospitalService } from '../services/hospitalService';
import { useCurrency } from '../context/CurrencyContext';
import { BookingModal } from '../components/booking/BookingModal';
import { Spinner, Alert } from '../components/common/Alert';
import {
  Layers,
  CheckCircle2,
  TrendingDown,
  Clock,
  Sparkles,
  Plus,
  X,
  ShieldCheck,
  Building2,
  Activity,
  Plane,
  Star,
  Bed,
  MapPin,
  Globe2,
} from 'lucide-react';

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const initialTab = searchParams.get('tab') === 'hospitals' ? 'hospitals' : 'treatments';
  const [activeTab, setActiveTab] = useState(initialTab); // 'treatments' | 'hospitals'

  // Treatments comparison state
  const [allTreatments, setAllTreatments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState([]);

  // Hospitals comparison state
  const [allHospitals, setAllHospitals] = useState([]);
  const [selectedHospitals, setSelectedHospitals] = useState([]);

  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTreatmentForBooking, setSelectedTreatmentForBooking] = useState(null);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [treatRes, hospRes] = await Promise.all([
          treatmentService.getTreatments(),
          hospitalService.getHospitals(),
        ]);

        const treatments = treatRes.treatments || [];
        const hospitals = hospRes.hospitals || [];

        setAllTreatments(treatments);
        setAllHospitals(hospitals);

        // Pre-select treatments from URL or default
        const paramIds = searchParams.get('ids');
        if (activeTab === 'treatments') {
          if (paramIds) {
            const idsArr = paramIds.split(',');
            const matched = treatments.filter((t) => idsArr.includes(t.slug) || idsArr.includes(t._id));
            setSelectedTreatments(matched.length > 0 ? matched.slice(0, 3) : treatments.slice(0, 3));
          } else {
            setSelectedTreatments(treatments.slice(0, 3));
          }
        } else {
          // activeTab === 'hospitals'
          if (paramIds) {
            const idsArr = paramIds.split(',');
            const matched = hospitals.filter((h) => idsArr.includes(h.slug) || idsArr.includes(h._id));
            setSelectedHospitals(matched.length > 0 ? matched.slice(0, 3) : hospitals.slice(0, 3));
          } else {
            setSelectedHospitals(hospitals.slice(0, 3));
          }
        }
      } catch (e) {
        console.error('Error loading compare data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  const handleAddTreatment = (slug) => {
    if (selectedTreatments.length >= 3) return;
    const item = allTreatments.find((t) => t.slug === slug);
    if (item && !selectedTreatments.some((s) => s._id === item._id)) {
      setSelectedTreatments([...selectedTreatments, item]);
    }
  };

  const handleRemoveTreatment = (id) => {
    if (selectedTreatments.length <= 1) return;
    setSelectedTreatments(selectedTreatments.filter((item) => item._id !== id));
  };

  const handleAddHospital = (slug) => {
    if (selectedHospitals.length >= 3) return;
    const item = allHospitals.find((h) => h.slug === slug);
    if (item && !selectedHospitals.some((s) => s._id === item._id)) {
      setSelectedHospitals([...selectedHospitals, item]);
    }
  };

  const handleRemoveHospital = (id) => {
    if (selectedHospitals.length <= 1) return;
    setSelectedHospitals(selectedHospitals.filter((item) => item._id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" />
            Decision Intelligence & Analytics
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Dual Comparison Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Side-by-side comparative matrices for medical procedure packages and accredited quaternary hospital centers across India.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => {
            setActiveTab('treatments');
            setSearchParams({ tab: 'treatments' });
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'treatments'
              ? 'bg-white text-teal-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Compare Treatments</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('hospitals');
            setSearchParams({ tab: 'hospitals' });
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'hospitals'
              ? 'bg-white text-teal-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Compare Hospitals</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Generating comparative matrix...</p>
        </div>
      ) : activeTab === 'treatments' ? (
        /* TREATMENT COMPARISON VIEW */
        <div className="space-y-6">
          {/* Treatment Selector Chips */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Currently Comparing ({selectedTreatments.length}/3):</span>
              {selectedTreatments.map((item) => (
                <span
                  key={item._id}
                  className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {item.name}
                  {selectedTreatments.length > 1 && (
                    <button
                      onClick={() => handleRemoveTreatment(item._id)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {selectedTreatments.length < 3 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Add procedure:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddTreatment(e.target.value);
                  }}
                  defaultValue=""
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="" disabled>Select Treatment to Compare</option>
                  {allTreatments
                    .filter((t) => !selectedTreatments.some((s) => s._id === t._id))
                    .map((t) => (
                      <option key={t._id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Treatment Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-5 font-bold uppercase text-[11px] text-slate-400 w-1/4">
                      Comparison Parameter
                    </th>
                    {selectedTreatments.map((item) => (
                      <th key={item._id} className="p-5 font-extrabold text-sm text-slate-900 w-1/3">
                        <Link to={`/treatments/${item.slug}`} className="hover:text-teal-600">
                          {item.name}
                        </Link>
                        <div className="text-xs font-semibold text-teal-700 mt-0.5">
                          {item.category}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Indian Package Cost */}
                  <tr className="bg-teal-50/40">
                    <td className="p-5 font-bold text-teal-950">
                      Indian Hospital Package Price
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 font-extrabold text-base text-teal-700">
                        {formatPrice(item.costIndiaUSD)}
                      </td>
                    ))}
                  </tr>

                  {/* USA Standard Quote */}
                  <tr>
                    <td className="p-5 font-semibold text-slate-500">
                      USA Medical Center Average
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 font-semibold text-slate-500 line-through">
                        {formatPrice(item.costUSAUSD)}
                      </td>
                    ))}
                  </tr>

                  {/* UK Standard Quote */}
                  <tr>
                    <td className="p-5 font-semibold text-slate-500">
                      United Kingdom Average
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 font-semibold text-slate-500">
                        {formatPrice(item.costUKUSD)}
                      </td>
                    ))}
                  </tr>

                  {/* Estimated Savings */}
                  <tr className="bg-emerald-50/50">
                    <td className="p-5 font-bold text-emerald-950">
                      Estimated Cost Savings
                    </td>
                    {selectedTreatments.map((item) => {
                      const savings = Math.round(((item.costUSAUSD - item.costIndiaUSD) / item.costUSAUSD) * 100);
                      return (
                        <td key={item._id} className="p-5 font-bold text-emerald-700 text-sm flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" /> ~{savings}% Lower in India
                        </td>
                      );
                    })}
                  </tr>

                  {/* Inpatient Hospital Stay */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Inpatient Hospital Stay
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 font-medium">
                        {item.avgStayDays} Days (Private Suite with Attendant Bed)
                      </td>
                    ))}
                  </tr>

                  {/* Recovery Time in India */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Recovery Timeline in India
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 font-medium">
                        {item.avgRecoveryDays} Days before Flight Clearance
                      </td>
                    ))}
                  </tr>

                  {/* Clinical Success Rate */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Clinical Success Rate
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 font-bold text-slate-900">
                        {item.successRate || '98.4%'}
                      </td>
                    ))}
                  </tr>

                  {/* Key Inclusions */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Key Package Inclusions
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5 space-y-1">
                        {item.inclusions?.map((inc, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>

                  {/* Action Buttons */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Action
                    </td>
                    {selectedTreatments.map((item) => (
                      <td key={item._id} className="p-5">
                        <button
                          onClick={() => {
                            setSelectedTreatmentForBooking(item);
                            setBookingModalOpen(true);
                          }}
                          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                        >
                          Request Quote
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* HOSPITAL COMPARISON VIEW */
        <div className="space-y-6">
          {/* Hospital Selector Chips */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Currently Comparing ({selectedHospitals.length}/3):</span>
              {selectedHospitals.map((hosp) => (
                <span
                  key={hosp._id}
                  className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {hosp.name}
                  {selectedHospitals.length > 1 && (
                    <button
                      onClick={() => handleRemoveHospital(hosp._id)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {selectedHospitals.length < 3 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Add hospital:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddHospital(e.target.value);
                  }}
                  defaultValue=""
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="" disabled>Select Hospital to Compare</option>
                  {allHospitals
                    .filter((h) => !selectedHospitals.some((s) => s._id === h._id))
                    .map((h) => (
                      <option key={h._id} value={h.slug}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Hospital Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-5 font-bold uppercase text-[11px] text-slate-400 w-1/4">
                      Hospital Parameter
                    </th>
                    {selectedHospitals.map((hosp) => (
                      <th key={hosp._id} className="p-5 font-extrabold text-sm text-slate-900 w-1/3">
                        <Link to={`/hospitals/${hosp.slug}`} className="hover:text-teal-600">
                          {hosp.name}
                        </Link>
                        <div className="text-xs font-semibold text-slate-500 mt-0.5">
                          {hosp.city}, {hosp.state}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Rating & Reviews */}
                  <tr className="bg-amber-50/30">
                    <td className="p-5 font-bold text-amber-950">
                      Quality Rating & Reviews
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5 font-bold text-amber-800 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>{hosp.rating} / 5.0 ({hosp.reviewsCount || 45}+ Overseas Reviews)</span>
                      </td>
                    ))}
                  </tr>

                  {/* Accreditations */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Quality Accreditations
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5">
                        <div className="flex flex-wrap gap-1">
                          {hosp.accreditations?.map((acc, idx) => (
                            <span
                              key={idx}
                              className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300"
                            >
                              {acc} Certified
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Airport Proximity */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Airport Distance & Transit
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5 font-medium">
                        <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                          <Plane className="w-4 h-4 text-teal-600" />
                          <span>{hosp.airportDistanceKm} km from {hosp.airportName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">~25-45 minutes transit via express expressway</div>
                      </td>
                    ))}
                  </tr>

                  {/* Inpatient Bed Capacity */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Infrastructure & Bed Capacity
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-teal-600" />
                          <span>{hosp.bedsCount}+ Quaternary Inpatient Beds</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* International Services */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Dedicated International Amenities
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5 space-y-1">
                        {hosp.internationalServices?.map((srv, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{srv}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>

                  {/* Specialties */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Key Clinical Specialties
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5">
                        <div className="flex flex-wrap gap-1">
                          {hosp.specialties?.map((spec, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Action Buttons */}
                  <tr>
                    <td className="p-5 font-bold text-slate-800">
                      Action
                    </td>
                    {selectedHospitals.map((hosp) => (
                      <td key={hosp._id} className="p-5">
                        <button
                          onClick={() => {
                            setSelectedHospitalForBooking(hosp);
                            setBookingModalOpen(true);
                          }}
                          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                        >
                          Book at {hosp.name.split(' ')[0]}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedTreatment={selectedTreatmentForBooking}
        preselectedHospital={selectedHospitalForBooking}
      />
    </div>
  );
};
