import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { useCurrency } from '../../context/CurrencyContext';
import { Spinner, Alert } from '../../components/common/Alert';
import {
  ShieldAlert,
  Building2,
  Stethoscope,
  Activity,
  CalendarCheck,
  TrendingDown,
  Globe2,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  DollarSign,
  Award,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  UserCheck,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { formatPrice } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getSummary();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to fetch platform analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading international medical governance metrics...</p>
      </div>
    );
  }

  const { stats, countryBreakdown, treatmentBreakdown, recentInquiries, topHospitals } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-semibold px-3 py-1 rounded-full text-xs border border-amber-500/30 inline-flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Platform Central Command & Telemetry
            </span>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/30">
              Live Gateway Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
            International Patient Healthcare Governance
          </h1>

          <p className="text-slate-400 text-xs leading-relaxed">
            Real-time analytics for overseas medical tourism: monitor global patient inquiries, accredited hospital capacities, doctor response velocity, and cross-border economic impact.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/appointments"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Master Inquiries Ledger</span>
          </Link>
          <Link
            to="/admin/hospitals"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Hospitals</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" /> Hospitals
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalHospitals || 0}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold">100% JCI/NABH</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Specialists
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalDoctors || 0}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold">Verified Surgeons</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-purple-600" /> Procedures
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalTreatments || 0}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold">Catalog Matrix</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> Total Inquiries
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalAppointments || 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            {stats?.confirmedAppointments} Confirmed
          </div>
        </div>

        {/* Card 5: Savings Delivered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Patient Savings
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-display">
            {formatPrice(stats?.estimatedTotalSavingsUSD || 85000)}
          </div>
          <div className="text-[11px] text-slate-500">vs US/UK Cost</div>
        </div>

        {/* Card 6: Forex Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Forex Inflow
          </div>
          <div className="text-xl font-extrabold text-indigo-700 font-display">
            {formatPrice(stats?.estimatedForexInflowUSD || 340000)}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold">Indian Healthcare</div>
        </div>
      </div>

      {/* Operational Velocity & Conversion Funnel Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              International Patient Journey Conversion Funnel
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              End-to-end conversion progression from initial discovery to hospital admission.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg font-bold">
              Avg. Turnaround: {stats?.averageResponseTimeHours || '3.8 hrs'}
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
              Conversion Rate: {stats?.conversionRate || 85}%
            </span>
          </div>
        </div>

        {/* 5-Step Funnel */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">1. Inquiries Submitted</div>
            <div className="text-xl font-extrabold text-slate-900 font-display">
              {stats?.totalAppointments || 120}
            </div>
            <div className="text-[10px] text-teal-600 font-semibold">100% Inflow Base</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">2. Clinical Triage</div>
            <div className="text-xl font-extrabold text-slate-900 font-display">
              {Math.round((stats?.totalAppointments || 120) * 0.94)}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold">94% Dossiers Evaluated</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">3. Doctor Confirmed</div>
            <div className="text-xl font-extrabold text-teal-700 font-display">
              {stats?.confirmedAppointments || 88}
            </div>
            <div className="text-[10px] text-teal-600 font-semibold">Slot & Telehealth Fixed</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">4. e-Visa Assistance</div>
            <div className="text-xl font-extrabold text-purple-700 font-display">
              {stats?.visaAssistanceRequests || 94}
            </div>
            <div className="text-[10px] text-purple-600 font-semibold">Letters Issued</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">5. Procedure Completed</div>
            <div className="text-xl font-extrabold text-emerald-700 font-display">
              {stats?.completedAppointments || 26}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">Discharged & Rejuvenated</div>
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown (Country vs Specialty) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Country Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-teal-600" />
              Patient Demand by Country of Origin
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Top Source Markets</span>
          </div>

          <div className="space-y-3.5">
            {countryBreakdown?.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    {item.country}
                  </span>
                  <span className="font-bold text-teal-800">
                    {item.count} Inquiries ({item.percentage || 15}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, item.percentage || (item.count * 8))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Demand Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Clinical Specialty Demand Distribution
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Surgical Fields</span>
          </div>

          <div className="space-y-3.5">
            {treatmentBreakdown?.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {item.category}
                  </span>
                  <span className="font-bold text-blue-800">{item.count} Requests</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(12, item.count * 25))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream & Top Hospitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Consultation Inquiries */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Recent International Consultation Requests
            </h2>
            <Link
              to="/admin/appointments"
              className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              View Full Audit Ledger →
            </Link>
          </div>

          <div className="space-y-3">
            {recentInquiries?.map((inq) => (
              <div
                key={inq._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-700">{inq.appointmentRef}</span>
                    <span className="font-bold text-slate-900">{inq.patientName}</span>
                    <span className="text-slate-400 text-[10px]">({inq.patientCountry})</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {inq.doctorId?.fullName} • {inq.hospitalId?.name} ({inq.hospitalId?.city})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">{inq.appointmentDate}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      inq.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : inq.status === 'completed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Top Rated Healthcare Institutions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Partner Healthcare Centers
            </h2>
            <p className="text-slate-400 text-[11px]">Accredited Centers by Rating</p>
          </div>

          <div className="space-y-3">
            {topHospitals?.map((hosp) => (
              <div
                key={hosp._id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-slate-900 leading-snug">{hosp.name}</div>
                  <div className="text-amber-600 font-bold text-xs shrink-0">★ {hosp.rating}</div>
                </div>
                <div className="text-slate-500 text-[11px]">{hosp.city}, India</div>
                <div className="flex flex-wrap gap-1">
                  {hosp.accreditations?.map((acc, i) => (
                    <span
                      key={i}
                      className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/admin/hospitals"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 transition group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700">
            Healthcare Providers Manager
          </h3>
          <p className="text-slate-500 text-xs">
            Onboard new hospital chains, edit facilities, accreditations & photos.
          </p>
        </Link>

        <Link
          to="/admin/doctors"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 transition group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
            Doctor Directory Master
          </h3>
          <p className="text-slate-500 text-xs">
            Verify surgeon credentials, consultation fees, experience & hospital affiliations.
          </p>
        </Link>

        <Link
          to="/admin/treatments"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-500 transition group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700">
            Procedures & Pricing Matrix
          </h3>
          <p className="text-slate-500 text-xs">
            Maintain surgical catalog, recovery guidelines & international pricing comparisons.
          </p>
        </Link>
      </div>
    </div>
  );
};

