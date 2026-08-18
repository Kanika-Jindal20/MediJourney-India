import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { useCurrency } from '../context/CurrencyContext';
import { Spinner, Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
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
  Download,
  CalendarPlus,
  Printer,
  Tag,
  PlaneTakeoff,
  ExternalLink,
  X,
  FileBadge,
  Check,
  PhoneCall,
  Mail,
  Globe,
  Share2,
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

  // Document upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Diagnostic Scan (MRI/CT/X-Ray)');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Visa letter modal state
  const [visaModalOpen, setVisaModalOpen] = useState(false);
  const [visaLetterData, setVisaLetterData] = useState(null);
  const [loadingVisaLetter, setLoadingVisaLetter] = useState(false);

  // Flight logistics editing state
  const [editingFlight, setEditingFlight] = useState(false);
  const [flightFormData, setFlightFormData] = useState({
    airline: '',
    flightNumber: '',
    arrivalDateTime: '',
    pickupTerminal: '',
    attendantsCount: 0,
    airportPickupRequired: true,
  });
  const [savingFlight, setSavingFlight] = useState(false);
  const [flightSuccess, setFlightSuccess] = useState('');

  // Status update (patient cancel / accept reschedule)
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async (emailToUse = lookupEmail) => {
    if (!emailToUse && !user) return;
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getPatientAppointments(emailToUse || user?.email);
      const appts = res.appointments || [];
      setAppointments(appts);
      if (appts.length > 0) {
        // Keep currently selected or select the first
        const current = appts.find((a) => a._id === selectedAppt?._id) || appts[0];
        setSelectedAppt(current);
        setFlightFormData({
          airline: current.airline || '',
          flightNumber: current.flightNumber || '',
          arrivalDateTime: current.arrivalDateTime || '',
          pickupTerminal: current.pickupTerminal || '',
          attendantsCount: current.attendantsCount || 0,
          airportPickupRequired: current.airportPickupRequired ?? true,
        });
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

  const handleSelectAppointment = (appt) => {
    setSelectedAppt(appt);
    setFlightFormData({
      airline: appt.airline || '',
      flightNumber: appt.flightNumber || '',
      arrivalDateTime: appt.arrivalDateTime || '',
      pickupTerminal: appt.pickupTerminal || '',
      attendantsCount: appt.attendantsCount || 0,
      airportPickupRequired: appt.airportPickupRequired ?? true,
    });
    setEditingFlight(false);
    setUploadSuccess('');
    setFlightSuccess('');
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    fetchAppointments(lookupEmail);
  };

  // Upload additional medical document
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedAppt) return;
    setUploadLoading(true);
    setUploadSuccess('');
    setError('');
    try {
      const res = await appointmentService.uploadDocument(
        selectedAppt._id,
        uploadFile,
        uploadCategory
      );
      setUploadSuccess('Medical document uploaded successfully.');
      setUploadFile(null);
      // Update selected appointment in local list
      setSelectedAppt((prev) => ({
        ...prev,
        medicalReports: res.medicalReports,
      }));
      setAppointments((prev) =>
        prev.map((a) => (a._id === selectedAppt._id ? { ...a, medicalReports: res.medicalReports } : a))
      );
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  // Fetch & Open Visa Letter Modal
  const handleOpenVisaLetter = async () => {
    if (!selectedAppt) return;
    setVisaModalOpen(true);
    setLoadingVisaLetter(true);
    try {
      const res = await appointmentService.getVisaLetter(selectedAppt.appointmentRef);
      setVisaLetterData(res.visaLetter);
    } catch (err) {
      console.error('Error fetching visa letter:', err);
    } finally {
      setLoadingVisaLetter(false);
    }
  };

  // Save Flight Logistics
  const handleSaveFlightLogistics = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setSavingFlight(true);
    setFlightSuccess('');
    try {
      const res = await appointmentService.updateFlightLogistics(
        selectedAppt._id,
        flightFormData
      );
      setFlightSuccess('Airport arrival details saved successfully!');
      setSelectedAppt(res.appointment);
      setAppointments((prev) =>
        prev.map((a) => (a._id === selectedAppt._id ? res.appointment : a))
      );
      setEditingFlight(false);
      setTimeout(() => setFlightSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update flight arrival details');
    } finally {
      setSavingFlight(false);
    }
  };

  // Patient accepts rescheduled slot
  const handleAcceptReschedule = async () => {
    if (!selectedAppt) return;
    setActionLoading(true);
    try {
      await appointmentService.updateStatus(selectedAppt._id, {
        status: 'confirmed',
        appointmentDate: selectedAppt.proposedDate || selectedAppt.appointmentDate,
        timeSlot: selectedAppt.proposedTimeSlot || selectedAppt.timeSlot,
      });
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to accept reschedule');
    } finally {
      setActionLoading(false);
    }
  };

  // Patient requests cancellation
  const handleCancelAppointment = async () => {
    if (!selectedAppt || !window.confirm('Are you sure you want to cancel this consultation request?')) return;
    setActionLoading(true);
    try {
      await appointmentService.updateStatus(selectedAppt._id, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Calendar sync helper
  const handleDownloadICS = (appt) => {
    if (!appt) return;
    const startDateClean = (appt.appointmentDate || '').replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MediJourney India//Consultation Reminder//EN',
      'BEGIN:VEVENT',
      `SUMMARY:MediJourney India: Consultation with ${appt.doctorId?.fullName || 'Specialist'}`,
      `DESCRIPTION:Case Ref: ${appt.appointmentRef}\\nHospital: ${appt.hospitalId?.name || 'Hospital'}\\nMode: ${appt.consultationType}\\nPatient: ${appt.patientName}`,
      `LOCATION:${appt.hospitalId?.name || 'Accredited Hospital'}, ${appt.hospitalId?.city || 'India'}`,
      `DTSTART:${startDateClean}T053000Z`,
      `DTEND:${startDateClean}T063000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Consultation_${appt.appointmentRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleCalendarUrl = (appt) => {
    if (!appt) return '#';
    const startDateClean = (appt.appointmentDate || '').replace(/-/g, '');
    const title = encodeURIComponent(`MediJourney India Consultation with ${appt.doctorId?.fullName || 'Specialist'}`);
    const details = encodeURIComponent(
      `Booking Reference: ${appt.appointmentRef}\nHospital: ${appt.hospitalId?.name}\nConsultation Mode: ${appt.consultationType}\nDoctor Notes: ${appt.doctorNotes || 'Case accepted for consultation'}`
    );
    const location = encodeURIComponent(`${appt.hospitalId?.name || 'Hospital'}, ${appt.hospitalId?.city || 'India'}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateClean}T100000Z/${startDateClean}T110000Z&details=${details}&location=${location}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by Specialist
          </span>
        );
      case 'completed':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Treatment Completed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Rescheduled Slot Proposed
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
            Manage your medical consultation requests, track hospital confirmations, access medical visa letters & coordinate airport pickup.
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
                  onClick={() => handleSelectAppointment(appt)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                    selectedAppt?._id === appt._id
                      ? 'bg-teal-50/70 border-teal-500 shadow-xs ring-1 ring-teal-500'
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
              {/* 1. Dossier Header & Fast Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Case Reference Number
                  </span>
                  <h3 className="text-2xl font-mono font-extrabold text-teal-700 mt-0.5">
                    {selectedAppt.appointmentRef}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(selectedAppt.status)}

                  {/* Calendar Sync Button */}
                  <a
                    href={getGoogleCalendarUrl(selectedAppt)}
                    target="_blank"
                    rel="noreferrer"
                    title="Add to Google Calendar"
                    className="p-2 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-xl transition border border-slate-200"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDownloadICS(selectedAppt)}
                    title="Download .ICS Event"
                    className="p-2 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-xl transition border border-slate-200"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Visa Letter Action Button */}
                  {selectedAppt.visaAssistanceRequired && (
                    <button
                      onClick={handleOpenVisaLetter}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Visa Invitation Letter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Visual Milestone Progress Tracker */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Medical Journey Milestone Progress
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Step 1 */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. Request Placed</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Case registered with hospital</p>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-1 ${
                      ['confirmed', 'completed', 'rescheduled'].includes(selectedAppt.status)
                        ? 'bg-white border-emerald-300'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      {['confirmed', 'completed', 'rescheduled'].includes(selectedAppt.status) ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2. Clinical Review
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> 2. Doctor Review
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Specialist assessment</p>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-1 ${
                      selectedAppt.visaAssistanceRequired
                        ? selectedAppt.status === 'confirmed'
                          ? 'bg-white border-teal-300'
                          : 'bg-slate-50 border-slate-200'
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800">
                      <Plane className="w-3.5 h-3.5 text-teal-600" />
                      <span>3. Visa Letter</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {selectedAppt.visaAssistanceRequired
                        ? selectedAppt.status === 'confirmed'
                          ? 'Hospital Letter Ready'
                          : 'Awaiting Confirmation'
                        : 'Not Requested'}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-1 ${
                      selectedAppt.status === 'completed'
                        ? 'bg-white border-blue-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>4. Consultation</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {selectedAppt.status === 'completed' ? 'Treatment Finished' : 'Scheduled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reschedule Alert Bar (If Doctor Proposed a New Slot) */}
              {selectedAppt.status === 'rescheduled' && selectedAppt.proposedDate && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Specialist Proposed an Alternate Date & Slot
                  </div>
                  <p className="text-amber-800">
                    The doctor has reviewed your dossier and proposed to meet on:{' '}
                    <strong>
                      {selectedAppt.proposedDate} at {selectedAppt.proposedTimeSlot || selectedAppt.timeSlot}
                    </strong>
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleAcceptReschedule}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      {actionLoading ? 'Updating...' : 'Accept New Proposed Slot'}
                    </button>
                    <button
                      onClick={handleCancelAppointment}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs"
                    >
                      Decline & Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Doctor & Hospital Details */}
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

              {/* 4. Date, Time & Mode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-teal-50/50 p-4 rounded-2xl border border-teal-100 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date (IST)</span>
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

              {/* 5. Patient Submitted Symptoms */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">
                  Medical Inquiry & Condition Description:
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedAppt.symptomsDescription}
                </div>
              </div>

              {/* 6. Doctor Clinical Notes (if available) */}
              {selectedAppt.doctorNotes && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Doctor’s Preliminary Assessment & Treatment Recommendation:
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium leading-relaxed whitespace-pre-line">
                    {selectedAppt.doctorNotes}
                  </div>
                </div>
              )}

              {/* 7. MEDICAL RECORDS & DIAGNOSTIC REPORTS DOSSIER */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Attached Medical Scans & Diagnostic Reports ({selectedAppt.medicalReports?.length || 0})
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> HIPAA / DISHA Encrypted
                  </span>
                </div>

                {/* Report Grid */}
                {selectedAppt.medicalReports?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedAppt.medicalReports.map((report, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 overflow-hidden">
                          <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                            {report.category || 'Diagnostic Scan'}
                          </span>
                          <div className="font-bold text-slate-900 truncate" title={report.fileName}>
                            {report.fileName || `Diagnostic_Report_${i + 1}.pdf`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Uploaded {new Date(report.uploadedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>

                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">No medical files uploaded yet.</p>
                )}

                {/* Upload More Reports Dropzone */}
                <form onSubmit={handleUploadDocument} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Upload Additional Medical Scans / Pathology to Case
                  </div>

                  {uploadSuccess && <Alert type="success" message={uploadSuccess} />}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                        Report Category
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="Diagnostic Scan (MRI/CT/X-Ray)">Diagnostic Scan (MRI/CT/X-Ray)</option>
                        <option value="Pathology & Blood Tests">Pathology & Blood Tests</option>
                        <option value="Clinical Summary & Prescription">Clinical Summary & Prescription</option>
                        <option value="Dental OPG X-Ray">Dental OPG X-Ray</option>
                        <option value="Discharge Summary">Discharge Summary</option>
                        <option value="Other Diagnostic Scan">Other Diagnostic Scan</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Select File (PDF, JPG, PNG, DOCX, DICOM - Max 10MB)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files[0])}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={uploadLoading || !uploadFile}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition shrink-0 flex items-center gap-1.5"
                      >
                        {uploadLoading && <Spinner size="sm" />}
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* 8. AIRPORT ARRIVAL & FLIGHT LOGISTICS COORDINATOR */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Plane className="w-4 h-4 text-teal-600" />
                    Complimentary Airport Pick-Up & Arrival Logistics
                  </div>
                  <button
                    onClick={() => setEditingFlight(!editingFlight)}
                    className="text-xs text-teal-700 font-bold hover:underline"
                  >
                    {editingFlight ? 'Cancel Edit' : 'Edit Flight Details'}
                  </button>
                </div>

                {flightSuccess && <Alert type="success" message={flightSuccess} />}

                {editingFlight ? (
                  <form onSubmit={handleSaveFlightLogistics} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Airline</label>
                        <input
                          type="text"
                          placeholder="e.g. Emirates"
                          value={flightFormData.airline}
                          onChange={(e) => setFlightFormData({ ...flightFormData, airline: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Flight Number</label>
                        <input
                          type="text"
                          placeholder="e.g. EK-512"
                          value={flightFormData.flightNumber}
                          onChange={(e) => setFlightFormData({ ...flightFormData, flightNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Arrival Date & Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 2026-10-15 06:30 AM"
                          value={flightFormData.arrivalDateTime}
                          onChange={(e) => setFlightFormData({ ...flightFormData, arrivalDateTime: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Attendants Count</label>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          value={flightFormData.attendantsCount}
                          onChange={(e) => setFlightFormData({ ...flightFormData, attendantsCount: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={flightFormData.airportPickupRequired}
                          onChange={(e) =>
                            setFlightFormData({ ...flightFormData, airportPickupRequired: e.target.checked })
                          }
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Confirm Dedicated Hospital Airport Chauffeur & Translator</span>
                      </label>

                      <button
                        type="submit"
                        disabled={savingFlight}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                      >
                        {savingFlight ? 'Saving...' : 'Save Flight Logistics'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Airline & Flight</span>
                      <span className="font-bold text-slate-900">
                        {selectedAppt.airline ? `${selectedAppt.airline} (${selectedAppt.flightNumber})` : 'Not provided yet'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Arrival Schedule</span>
                      <span className="font-bold text-slate-900">
                        {selectedAppt.arrivalDateTime || 'Pending booking'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Airport Destination</span>
                      <span className="font-bold text-slate-900">
                        {selectedAppt.hospitalId?.airportName || 'Delhi (DEL)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Attendants Accompanying</span>
                      <span className="font-bold text-teal-800">
                        {selectedAppt.attendantsCount || 0} Attendant(s)
                      </span>
                    </div>
                  </div>
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

      {/* ========================================================================= */}
      {/* 9. OFFICIAL HOSPITAL MEDICAL VISA (MED) INVITATION LETTER MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={visaModalOpen}
        onClose={() => setVisaModalOpen(false)}
        title="Official Hospital Medical Visa Invitation Letter"
        maxWidth="max-w-4xl"
      >
        {loadingVisaLetter ? (
          <div className="text-center py-16">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Generating formal visa letter for embassy...</p>
          </div>
        ) : visaLetterData ? (
          <div className="space-y-6">
            {/* Top Print & Action Controls */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Issued for: <strong>Indian e-Medical Visa (MED & MED-X)</strong></span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>

            {/* Formal Letterhead Container */}
            <div className="bg-white border-2 border-slate-300 p-8 rounded-2xl space-y-6 text-slate-900 shadow-sm font-sans">
              {/* Header Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b-2 border-teal-700 gap-3">
                <div>
                  <h2 className="text-xl font-black font-display text-teal-800 tracking-tight">
                    {visaLetterData.hospital?.name}
                  </h2>
                  <p className="text-xs text-slate-600">{visaLetterData.hospital?.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {visaLetterData.hospital?.accreditations?.map((acc, i) => (
                      <span
                        key={i}
                        className="bg-teal-50 text-teal-900 border border-teal-300 text-[10px] font-black px-2 py-0.5 rounded"
                      >
                        {acc} ACCREDITED
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right text-xs space-y-0.5">
                  <div className="font-mono text-xs font-bold text-slate-700">
                    Ref: {visaLetterData.letterRef}
                  </div>
                  <div className="text-slate-500">Date: {visaLetterData.issueDate}</div>
                  <div className="text-[11px] text-teal-700 font-semibold">
                    International Patient Coordination Division
                  </div>
                </div>
              </div>

              {/* Addressed To */}
              <div className="text-xs space-y-1 text-slate-800">
                <div className="font-bold">TO:</div>
                <div className="font-semibold text-slate-900">{visaLetterData.embassyAddressedTo}</div>
                <div className="text-slate-600">Consular & Visa Division</div>
              </div>

              {/* Subject */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 uppercase text-center">
                SUBJECT: {visaLetterData.subject}
              </div>

              {/* Letter Body */}
              <div className="text-xs text-slate-800 leading-relaxed space-y-3">
                <p>Dear Visa Officer,</p>
                <p>
                  This is to certify that <strong>{visaLetterData.patient?.fullName}</strong>, citizen of{' '}
                  <strong>{visaLetterData.patient?.country}</strong> (Passport Number:{' '}
                  <span className="font-mono font-bold text-teal-800">{visaLetterData.patient?.passportNumber}</span>), has
                  consulted our department and has been accepted for specialized medical treatment at our institution in India.
                </p>
                <p>
                  The patient has been evaluated by <strong>{visaLetterData.doctor?.name}</strong> (
                  {visaLetterData.doctor?.title}, {visaLetterData.doctor?.qualifications}) for{' '}
                  <strong>{visaLetterData.treatment?.name}</strong>.
                </p>

                {/* Clinical Stay Table */}
                <div className="my-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Planned Treatment</span>
                    <span className="font-bold text-slate-900">{visaLetterData.treatment?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Recommended Stay Duration</span>
                    <span className="font-bold text-teal-800">{visaLetterData.treatment?.recommendedStay}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Confirmed Appointment Date</span>
                    <span className="font-bold text-slate-900">{visaLetterData.appointmentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Authorized Medical Attendants</span>
                    <span className="font-bold text-slate-900">{visaLetterData.patient?.attendantsCount} Attendant(s)</span>
                  </div>
                </div>

                <p>
                  We kindly request the Embassy / Consulate of India to grant the primary patient an{' '}
                  <strong>Indian e-Medical Visa (MED)</strong> and up to two accompanying family attendants an{' '}
                  <strong>e-Medical Attendant Visa (MED-X)</strong> for triple entry to ensure uninterrupted medical care.
                </p>
                <p>
                  Our International Patient Services team will provide airport pickup and all medical coordination upon arrival.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{visaLetterData.doctor?.name}</div>
                  <div className="text-slate-600">{visaLetterData.doctor?.title}</div>
                  <div className="text-slate-500">{visaLetterData.doctor?.specialty}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-teal-800">Director of International Patient Services</div>
                  <div className="text-slate-600">{visaLetterData.hospital?.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Phone: {visaLetterData.hospital?.contactPhone} | Email: {visaLetterData.hospital?.contactEmail}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
