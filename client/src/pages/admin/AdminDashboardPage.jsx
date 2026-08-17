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
        <p className="text-xs text-slate-500 mt-3">Loading administrator control metrics...</p>
      </div>
    );
  }

  const { stats, countryBreakdown, treatmentBreakdown } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <span className="bg-amber-500/20 text-amber-300 font-semibold px-3 py-1 rounded-full text-xs border border-amber-500/30 inline-flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Platform Central Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Administrator Governance Dashboard
          </h1>
          <p className="text-slate-400 text-xs">
            Manage accredited hospitals, medical specialists, procedure pricing, and monitor global patient inflow.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/appointments"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Master Inquiries Ledger</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" /> Accredited Hospitals
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalHospitals || 0}
          </div>
          <Link to="/admin/hospitals" className="text-[11px] text-teal-700 font-semibold hover:underline">
            Manage Hospitals →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Medical Specialists
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalDoctors || 0}
          </div>
          <Link to="/admin/doctors" className="text-[11px] text-blue-700 font-semibold hover:underline">
            Manage Doctors →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-purple-600" /> Procedures & Costs
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalTreatments || 0}
          </div>
          <Link to="/admin/treatments" className="text-[11px] text-purple-700 font-semibold hover:underline">
            Pricing Catalog →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> Total Inquiries
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {stats?.totalAppointments || 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            {stats?.confirmedAppointments} Confirmed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Total Savings Delivered
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">
            {formatPrice(stats?.estimatedTotalSavingsUSD || 75000)}
          </div>
          <div className="text-[11px] text-slate-500">vs Western Hospital Bills</div>
        </div>
      </div>

      {/* Analytics Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Country Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-teal-600" />
            Patient Inflow by Country of Origin
          </h2>

          <div className="space-y-3">
            {countryBreakdown?.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{item.country}</span>
                  <span className="font-bold text-teal-700">{item.count} Inquiries</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.count * 30)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Demand Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Specialty Demand Breakdown
          </h2>

          <div className="space-y-3">
            {treatmentBreakdown?.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{item.category}</span>
                  <span className="font-bold text-blue-700">{item.count} Requests</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.count * 30)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
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
            Onboard new hospital chains, manage accreditations, photos and medical facilities.
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
            Verify medical specialist licenses, qualifications, consultation fees & hospital links.
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
            Maintain procedure steps, recovery guidelines & comparative international price data.
          </p>
        </Link>
      </div>
    </div>
  );
};
