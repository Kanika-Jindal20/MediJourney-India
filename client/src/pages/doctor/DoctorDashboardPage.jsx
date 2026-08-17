import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { useCurrency } from '../../context/CurrencyContext';
import { Spinner, Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import {
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Globe,
  Phone,
  Plane,
  Save,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';

export const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [metrics, setMetrics] = useState({
    pendingRequests: 0,
    confirmedUpcoming: 0,
    totalCompleted: 0,
    internationalPatients: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manage single appointment action modal
  const [activeAppt, setActiveAppt] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadDoctorData = async () => {
    setLoading(true);
    setError('');
    try {
      const [metricsRes, queueRes] = await Promise.all([
        doctorService.getDoctorMetrics(),
        appointmentService.getDoctorQueue({ status: filterStatus }),
      ]);
      setMetrics(metricsRes.metrics || metrics);
      setAppointments(queueRes.appointments || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [filterStatus]);

  const handleUpdateStatus = async (newStatus) => {
    if (!activeAppt) return;
    setStatusUpdateLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await appointmentService.updateStatus(activeAppt._id, {
        status: newStatus,
        doctorNotes,
      });
      setSuccessMsg(`Case updated to '${newStatus}' successfully.`);
      loadDoctorData();
      setTimeout(() => {
        setActiveAppt(null);
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <span className="bg-blue-500/20 text-blue-300 font-semibold px-3 py-1 rounded-full text-xs border border-blue-500/30 inline-flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-blue-400" />
            Healthcare Specialist Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Doctor Consultation Workspace
          </h1>
          <p className="text-slate-400 text-xs">
            Review international patient dossiers, confirm video consultation slots & issue medical visa opinions.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/doctor/availability"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Slot Availability</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold">Pending Requests</div>
          <div className="text-2xl font-extrabold text-amber-600 font-display">
            {metrics.pendingRequests}
          </div>
          <div className="text-[11px] text-slate-500">Requires clinical review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold">Confirmed Upcoming</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">
            {metrics.confirmedUpcoming}
          </div>
          <div className="text-[11px] text-slate-500">Scheduled video consults</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold">Completed Consultations</div>
          <div className="text-2xl font-extrabold text-blue-600 font-display">
            {metrics.totalCompleted}
          </div>
          <div className="text-[11px] text-slate-500">Treatment plans finalized</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-semibold">Overseas Patients</div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {metrics.internationalPatients}
          </div>
          <div className="text-[11px] text-slate-500">UK, US, UAE, Oman & Russia</div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Consultation Queue Filter & Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Patient Consultation Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and act upon incoming international medical inquiries
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {['all', 'pending', 'confirmed', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading patient queue...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No appointments found in this status queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Origin & Language</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
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
                      <div className="text-[11px] text-slate-500">{appt.patientEmail}</div>
                      <div className="text-[10px] text-slate-400">
                        {appt.treatmentId?.name || 'General Specialist Inquiry'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{appt.patientCountry}</div>
                      <div className="text-[11px] text-slate-500">
                        Lang: {appt.preferredLanguage || 'English'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{appt.appointmentDate}</div>
                      <div className="text-[11px] text-teal-700 font-bold">{appt.timeSlot}</div>
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
                        onClick={() => {
                          setActiveAppt(appt);
                          setDoctorNotes(appt.doctorNotes || '');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs transition"
                      >
                        Review Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Dossier Modal */}
      {activeAppt && (
        <Modal
          isOpen={!!activeAppt}
          onClose={() => setActiveAppt(null)}
          title={`Clinical Review: Case #${activeAppt.appointmentRef}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {successMsg && <Alert type="success" message={successMsg} />}
            {error && <Alert type="error" message={error} />}

            {/* Patient Meta Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name</span>
                <span className="font-bold text-slate-900">{activeAppt.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Country</span>
                <span className="font-bold text-slate-900">{activeAppt.patientCountry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">WhatsApp Contact</span>
                <span className="font-bold text-slate-900">{activeAppt.patientPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Passport #</span>
                <span className="font-bold text-slate-900">{activeAppt.passportNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Patient Symptoms */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">
                Patient Medical Problem & Symptoms Description:
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                {activeAppt.symptomsDescription}
              </div>
            </div>

            {/* Uploaded Scans */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">
                Attached Medical Diagnostic Files ({activeAppt.medicalReports?.length || 0}):
              </div>
              {activeAppt.medicalReports?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAppt.medicalReports.map((file, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 truncate max-w-[180px]">
                        {file.fileName || `Scan_${i + 1}.pdf`}
                      </span>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 font-bold hover:underline text-xs"
                      >
                        Open Scan
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No external records attached.</p>
              )}
            </div>

            {/* Doctor Clinical Notes & Treatment Plan */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-800">
                Doctor Assessment & Treatment Recommendations (Sent to Patient & Visa Desk):
              </label>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter preliminary diagnosis, required surgical technique, estimated hospital stay, and medical visa recommendations..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus('rescheduled')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition"
                >
                  Propose Reschedule
                </button>

                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus('completed')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition"
                >
                  Mark Completed
                </button>

                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus('confirmed')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {statusUpdateLoading ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm Appointment</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
