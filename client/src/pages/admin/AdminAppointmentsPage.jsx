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
  Download,
  ShieldCheck,
  Plane,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Selected item modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

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

  const handleOpenDossier = (appt) => {
    setSelectedAppt(appt);
    setNewStatus(appt.status);
    setDoctorNotes(appt.doctorNotes || '');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    try {
      await appointmentService.updateStatus(selectedAppt._id, {
        status: newStatus,
        doctorNotes,
      });
      setSuccess(`Inquiry ${selectedAppt.appointmentRef} updated to "${newStatus}".`);
      setSelectedAppt(null);
      loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to update consultation status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (appointments.length === 0) return;

    const headers = [
      'Reference Code',
      'Patient Name',
      'Patient Email',
      'Patient Country',
      'Passport Number',
      'Doctor Name',
      'Doctor Specialty',
      'Hospital Name',
      'Hospital City',
      'Appointment Date',
      'Time Slot',
      'Consultation Type',
      'Visa Desk Required',
      'Status',
      'Created At',
    ];

    const rows = appointments.map((a) => [
      `"${a.appointmentRef || ''}"`,
      `"${a.patientName || ''}"`,
      `"${a.patientEmail || ''}"`,
      `"${a.patientCountry || ''}"`,
      `"${a.passportNumber || ''}"`,
      `"${a.doctorId?.fullName || ''}"`,
      `"${a.doctorId?.specialty || ''}"`,
      `"${a.hospitalId?.name || ''}"`,
      `"${a.hospitalId?.city || ''}"`,
      `"${a.appointmentDate || ''}"`,
      `"${a.timeSlot || ''}"`,
      `"${a.consultationType || ''}"`,
      `"${a.visaAssistanceRequired ? 'Yes' : 'No'}"`,
      `"${a.status || ''}"`,
      `"${new Date(a.createdAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MediJourney_Appointments_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        <button
          onClick={handleExportCSV}
          disabled={appointments.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Master Ledger (CSV)</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Master Inquiries & Consultation Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full platform audit of international patient requests, doctor confirmations, Indian e-Medical Visa statuses, and clinical notes.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Ref #, patient name, email, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {['all', 'pending', 'confirmed', 'completed', 'rescheduled', 'cancelled'].map((st) => (
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <Spinner size="lg" className="mx-auto" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-xs text-slate-500">
            <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No consultation requests matching the search/filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Patient & Country</th>
                  <th className="py-3.5 px-4">Assigned Doctor & Facility</th>
                  <th className="py-3.5 px-4">Slot Date & Mode</th>
                  <th className="py-3.5 px-4">e-Visa Desk</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Audit Dossier</th>
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
                      <div className="text-slate-500 text-[11px]">
                        {appt.patientCountry} • {appt.patientEmail}
                      </div>
                      {appt.passportNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Passport: {appt.passportNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{appt.doctorId?.fullName}</div>
                      <div className="text-slate-400 text-[11px]">
                        {appt.hospitalId?.name} ({appt.hospitalId?.city})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{appt.appointmentDate}</div>
                      <div className="text-[10px] text-teal-700 font-bold">
                        {appt.timeSlot} • <span className="capitalize">{appt.consultationType}</span>
                      </div>
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
                            : appt.status === 'rescheduled'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : appt.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDossier(appt)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dossier Review & Status Governance Modal */}
      {selectedAppt && (
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title={`Clinical Inquiry Audit: ${selectedAppt.appointmentRef}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Patient & Booking Header Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedAppt.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Country & Phone</span>
                <span className="font-bold text-slate-900">{selectedAppt.patientCountry}</span>
                <div className="text-[10px] text-slate-500">{selectedAppt.patientPhone}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Passport / ID</span>
                <span className="font-mono font-bold text-slate-800">{selectedAppt.passportNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">e-Medical Visa</span>
                <span className="font-bold text-emerald-700">
                  {selectedAppt.visaAssistanceRequired ? 'Assistance Requested' : 'Not Required'}
                </span>
              </div>
            </div>

            {/* Doctor & Facility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1">
                <div className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Assigned Specialist
                </div>
                <div className="font-bold text-slate-900">{selectedAppt.doctorId?.fullName}</div>
                <div className="text-slate-500">{selectedAppt.doctorId?.specialty}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  Healthcare Facility
                </div>
                <div className="font-bold text-slate-900">{selectedAppt.hospitalId?.name}</div>
                <div className="text-slate-500">{selectedAppt.hospitalId?.city}, India</div>
              </div>
            </div>

            {/* Patient Symptoms */}
            <div>
              <div className="font-bold text-slate-800 mb-1">Medical Symptoms / Inquiry Description:</div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedAppt.symptomsDescription}
              </div>
            </div>

            {/* Attached Medical Scans */}
            <div>
              <div className="font-bold text-slate-800 mb-1">
                Attached Medical Scans & Records ({selectedAppt.medicalReports?.length || 0}):
              </div>
              {selectedAppt.medicalReports?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAppt.medicalReports.map((report, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">
                        {report.fileName || `Diagnostic_Scan_${i + 1}.pdf`}
                      </span>
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 font-bold hover:underline"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">No diagnostic scan files attached.</p>
              )}
            </div>

            {/* Status Governance Form */}
            <form onSubmit={handleStatusUpdate} className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Administrative Case Action & Status Update:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">Case Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="pending">Pending Doctor Review</option>
                    <option value="confirmed">Confirmed / Video Consult Scheduled</option>
                    <option value="completed">Treatment Completed</option>
                    <option value="rescheduled">Rescheduled Slot Proposed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Doctor Assessment / Visa Notes
                  </label>
                  <input
                    type="text"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="e.g. Treatment approved, 5-day stay required. Visa letter issued."
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Save Case Status'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

