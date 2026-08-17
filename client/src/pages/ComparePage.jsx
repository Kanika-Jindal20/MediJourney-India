import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { treatmentService } from '../services/treatmentService';
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
} from 'lucide-react';

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [allTreatments, setAllTreatments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTreatmentForBooking, setSelectedTreatmentForBooking] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await treatmentService.getTreatments();
        const treatments = res.treatments || [];
        setAllTreatments(treatments);

        // Pre-select items from URL query or first 3
        const paramIds = searchParams.get('ids');
        if (paramIds) {
          const idsArr = paramIds.split(',');
          const matched = treatments.filter((t) => idsArr.includes(t.slug) || idsArr.includes(t._id));
          setSelectedItems(matched.length > 0 ? matched.slice(0, 3) : treatments.slice(0, 3));
        } else {
          setSelectedItems(treatments.slice(0, 3));
        }
      } catch (e) {
        console.error('Error loading compare data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddItem = (slug) => {
    if (selectedItems.length >= 3) return;
    const item = allTreatments.find((t) => t.slug === slug);
    if (item && !selectedItems.some((s) => s._id === item._id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (id) => {
    if (selectedItems.length <= 1) return;
    setSelectedItems(selectedItems.filter((item) => item._id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" />
            Decision Intelligence
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Side-by-Side Treatment & Cost Comparison
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Compare clinical recovery timelines, package inclusions, and global benchmark costs across up to 3 medical procedures to plan your travel with complete confidence.
          </p>
        </div>
      </div>

      {/* Item selector chips */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Currently Comparing ({selectedItems.length}/3):</span>
          {selectedItems.map((item) => (
            <span
              key={item._id}
              className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5"
            >
              {item.name}
              {selectedItems.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>

        {selectedItems.length < 3 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Add procedure:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleAddItem(e.target.value);
              }}
              defaultValue=""
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="" disabled>Select Treatment to Compare</option>
              {allTreatments
                .filter((t) => !selectedItems.some((s) => s._id === t._id))
                .map((t) => (
                  <option key={t._id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Generating comparative matrix...</p>
        </div>
      ) : (
        /* Comparison Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-5 font-bold uppercase text-[11px] text-slate-400 w-1/4">
                    Comparison Parameter
                  </th>
                  {selectedItems.map((item) => (
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
                {/* 1. Indian Package Cost */}
                <tr className="bg-teal-50/40">
                  <td className="p-5 font-bold text-teal-950">
                    Indian Hospital Package Price
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5 font-extrabold text-base text-teal-700">
                      {formatPrice(item.costIndiaUSD)}
                    </td>
                  ))}
                </tr>

                {/* 2. USA Standard Quote */}
                <tr>
                  <td className="p-5 font-semibold text-slate-500">
                    USA Medical Center Average
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5 font-semibold text-slate-500 line-through">
                      {formatPrice(item.costUSAUSD)}
                    </td>
                  ))}
                </tr>

                {/* 3. UK Standard Quote */}
                <tr>
                  <td className="p-5 font-semibold text-slate-500">
                    United Kingdom (Private Hospital)
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5 font-semibold text-slate-500">
                      {formatPrice(item.costUKUSD)}
                    </td>
                  ))}
                </tr>

                {/* 4. Estimated Savings */}
                <tr className="bg-emerald-50/50">
                  <td className="p-5 font-bold text-emerald-950">
                    Estimated Cost Savings
                  </td>
                  {selectedItems.map((item) => {
                    const savings = Math.round(((item.costUSAUSD - item.costIndiaUSD) / item.costUSAUSD) * 100);
                    return (
                      <td key={item._id} className="p-5 font-bold text-emerald-700 text-sm flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" /> ~{savings}% Lower in India
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Inpatient Hospital Stay */}
                <tr>
                  <td className="p-5 font-bold text-slate-800">
                    Inpatient Hospital Stay
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5 font-medium">
                      {item.avgStayDays} Days (Private Suite with Nurse & Attendant)
                    </td>
                  ))}
                </tr>

                {/* 6. Recovery Time in India */}
                <tr>
                  <td className="p-5 font-bold text-slate-800">
                    Recovery Timeline in India
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5 font-medium">
                      {item.avgRecoveryDays} Days before Flight Clearance
                    </td>
                  ))}
                </tr>

                {/* 7. Clinical Success Rate */}
                <tr>
                  <td className="p-5 font-bold text-slate-800">
                    Clinical Success Rate
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5 font-bold text-slate-900">
                      {item.successRate || '98%'}
                    </td>
                  ))}
                </tr>

                {/* 8. Inclusions */}
                <tr>
                  <td className="p-5 font-bold text-slate-800">
                    Key Package Inclusions
                  </td>
                  {selectedItems.map((item) => (
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

                {/* 9. Action Buttons */}
                <tr>
                  <td className="p-5 font-bold text-slate-800">
                    Book Consultation
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item._id} className="p-5">
                      <button
                        onClick={() => {
                          setSelectedTreatmentForBooking(item);
                          setBookingModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                      >
                        Request Quote for {item.name.split(' ')[0]}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedTreatment={selectedTreatmentForBooking}
      />
    </div>
  );
};
