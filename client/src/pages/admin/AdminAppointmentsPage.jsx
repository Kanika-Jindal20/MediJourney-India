import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { Modal } from '../../components/common/Modal';
import { Spinner, Alert } from '../../components/common/Alert';
import {
  CalendarCheck,
  Search,
  ArrowLeft,
  Building2,
  Stethoscope,
  User,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';

export const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Selected item modal
  const [selectedAppt, setSelectedAppt] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getAdminAppointments({
        status,
        search,
      });
      setAppointments(res.appointments || []);
    } catch (e) {
      setError(e.message || 'Failed to load master appointments ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAppointments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Master Inquiries & Consultation Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full platform audit of international patient requests, doctor confirmations, and visa desk statuses.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Ref #, patient name, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1.5 text-xs">
          {['all', 'pending', 'confirmed', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition ${
                status === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <Spinner size="lg" className="mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Patient Name & Country</th>
                  <th className="py-3.5 px-4">Doctor & Hospital</th>
                  <th className="py-3.5 px-4">Slot Date</th>
                  <th className="py-3.5 px-4">Visa Desk</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {appt.appointmentRef}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{appt.patientName}</div>
                      <div className="text-slate-500 text-[11px]">{appt.patientCountry} • {appt.patientEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{appt.doctorId?.fullName}</div>
                      <div className="text-slate-400 text-[11px]">{appt.hospitalId?.name} ({appt.hospitalId?.city})</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{appt.appointmentDate}</div>
                      <div className="text-[10px] text-teal-700 font-bold">{appt.timeSlot}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          appt.visaAssistanceRequired
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {appt.visaAssistanceRequired ? 'e-Visa Required' : 'Standard'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          appt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedAppt(appt)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedAppt && (
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title={`Inquiry Dossier: ${selectedAppt.appointmentRef}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name</span>
                <span className="font-bold text-slate-900">{selectedAppt.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email</span>
                <span className="font-bold text-slate-900">{selectedAppt.patientEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Country</span>
                <span className="font-bold text-slate-900">{selectedAppt.patientCountry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone</span>
                <span className="font-bold text-slate-900">{selectedAppt.patientPhone}</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-800 mb-1">Medical Description:</div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 whitespace-pre-line">
                {selectedAppt.symptomsDescription}
              </div>
            </div>

            {selectedAppt.doctorNotes && (
              <div>
                <div className="font-bold text-teal-800 mb-1">Doctor Assessment Notes:</div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                  {selectedAppt.doctorNotes}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
