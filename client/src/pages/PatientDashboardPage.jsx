import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { useCurrency } from '../context/CurrencyContext';
import { Spinner, Alert } from '../components/common/Alert';
import {
  User,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Search,
  ShieldCheck,
  Plane,
  FileCheck,
} from 'lucide-react';

export const PatientDashboardPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lookup for guest users by email or ref
  const [lookupEmail, setLookupEmail] = useState(user?.email || '');
  const [selectedAppt, setSelectedAppt] = useState(null);

  const fetchAppointments = async (emailToUse = lookupEmail) => {
    if (!emailToUse && !user) return;
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getPatientAppointments(emailToUse || user?.email);
      setAppointments(res.appointments || []);
      if (res.appointments?.length > 0) {
        setSelectedAppt(res.appointments[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch consultation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchAppointments(user.email);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    fetchAppointments(lookupEmail);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by Doctor
          </span>
        );
      case 'completed':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Treatment Completed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Rescheduled Slot Proposed
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Doctor Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 font-semibold px-2.5 py-0.5 rounded text-xs border border-teal-500/30">
              International Patient Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome, {user?.fullName || 'International Traveler'}
          </h1>
          <p className="text-slate-400 text-xs">
            Manage your medical consultation requests, track hospital confirmations & access visa letters.
          </p>
        </div>

        {/* Email lookup form if guest */}
        {!user && (
          <form
            onSubmit={handleLookupSubmit}
            className="flex gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 text-xs"
          >
            <input
              type="email"
              placeholder="Enter your booking email..."
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="bg-transparent px-3 py-1.5 text-white focus:outline-none placeholder:text-slate-400 text-xs"
              required
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
            >
              Track
            </button>
          </form>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Main Grid: Appointments Queue vs Appointment Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: List of Requests */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center justify-between">
            <span>My Inquiries & Bookings</span>
            <span className="text-xs text-slate-500 font-normal">
              {appointments.length} Total
            </span>
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <Spinner size="md" className="mx-auto" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 text-xs text-slate-500">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No active consultation requests found for this account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                    selectedAppt?._id === appt._id
                      ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {appt.appointmentRef}
                    </span>
                    {getStatusBadge(appt.status)}
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {appt.doctorId?.fullName || 'Specialist Consultation'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {appt.hospitalId?.name} ({appt.hospitalId?.city})
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <span>{appt.appointmentDate} at {appt.timeSlot}</span>
                    <span className="capitalize font-semibold text-teal-700">
                      {appt.consultationType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Detailed Selected Request Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAppt ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Case Reference Number
                  </span>
                  <h3 className="text-xl font-mono font-extrabold text-teal-700 mt-0.5">
                    {selectedAppt.appointmentRef}
                  </h3>
                </div>
                <div>{getStatusBadge(selectedAppt.status)}</div>
              </div>

              {/* Doctor & Hospital Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    Assigned Specialist
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedAppt.doctorId?.fullName}
                  </div>
                  <div className="text-slate-600">{selectedAppt.doctorId?.specialty}</div>
                  <div className="text-[11px] text-slate-500">
                    Consultation Fee: {formatPrice(selectedAppt.doctorId?.consultationFeeUSD)}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    Healthcare Facility
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedAppt.hospitalId?.name}
                  </div>
                  <div className="text-slate-600">{selectedAppt.hospitalId?.city}, India</div>
                  <div className="text-[11px] text-slate-500">
                    Airport: {selectedAppt.hospitalId?.airportName}
                  </div>
                </div>
              </div>

              {/* Date & Mode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-teal-50/50 p-4 rounded-2xl border border-teal-100 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date</span>
                  <span className="font-bold text-slate-900">{selectedAppt.appointmentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Time Slot</span>
                  <span className="font-bold text-slate-900">{selectedAppt.timeSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation Mode</span>
                  <span className="font-bold capitalize text-teal-800">{selectedAppt.consultationType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">e-Medical Visa Desk</span>
                  <span className="font-bold text-emerald-700">
                    {selectedAppt.visaAssistanceRequired ? 'Requested' : 'Not Needed'}
                  </span>
                </div>
              </div>

              {/* Patient Submitted Symptoms */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">
                  Medical Inquiry & Condition Description:
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedAppt.symptomsDescription}
                </div>
              </div>

              {/* Doctor Clinical Notes (if available) */}
              {selectedAppt.doctorNotes && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Doctor’s Preliminary Assessment & Notes:
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium leading-relaxed whitespace-pre-line">
                    {selectedAppt.doctorNotes}
                  </div>
                </div>
              )}

              {/* Uploaded Records */}
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-800">
                  Attached Medical Scans & Documents ({selectedAppt.medicalReports?.length || 0}):
                </div>
                {selectedAppt.medicalReports?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedAppt.medicalReports.map((report, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">
                          {report.fileName || `Medical_Scan_${i + 1}.pdf`}
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
                  <p className="text-slate-400 text-xs">No medical files attached.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 text-slate-500 text-xs">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p>Select a consultation request from the left list to view full clinical details and confirmation status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
