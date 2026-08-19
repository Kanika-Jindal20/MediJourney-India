import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Video,
  Filter,
  Eye,
  Download,
  Printer,
  Copy,
  ExternalLink,
  ShieldCheck,
  Edit3,
  CalendarDays,
  Sparkles,
  MapPin,
  Award,
  RefreshCw,
  XCircle,
  FileCheck,
} from 'lucide-react';

export const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [metrics, setMetrics] = useState({
    pendingRequests: 0,
    confirmedUpcoming: 0,
    totalCompleted: 0,
    internationalPatients: 0,
    todayAppointments: 0,
    rescheduledRequests: 0,
  });

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active appointment dossier modal & tabs
  const [activeAppt, setActiveAppt] = useState(null);
  const [modalTab, setModalTab] = useState('dossier'); // 'dossier', 'assessment', 'visa', 'teleconsult'
  const [doctorNotes, setDoctorNotes] = useState('');
  const [treatmentPlanSummary, setTreatmentPlanSummary] = useState('');
  const [recommendedStayDays, setRecommendedStayDays] = useState('7');
  const [recoveryDays, setRecoveryDays] = useState('14');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTimeSlot, setProposedTimeSlot] = useState('11:30 AM');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [copiedRoomLink, setCopiedRoomLink] = useState(false);

  // Edit Profile Modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    consultationFeeUSD: 40,
    bio: '',
    languagesSpoken: 'English, Hindi',
    isAvailable: true,
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Load Doctor Data & Metrics
  const loadDoctorData = async () => {
    setLoading(true);
    setError('');
    try {
      const [metricsRes, queueRes] = await Promise.all([
        doctorService.getDoctorMetrics(),
        appointmentService.getDoctorQueue({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          consultationType: filterType !== 'all' ? filterType : undefined,
          dateRange: filterDateRange !== 'all' ? filterDateRange : undefined,
          search: searchTerm.trim() || undefined,
        }),
      ]);

      if (metricsRes.doctor) {
        setDoctorProfile(metricsRes.doctor);
        setProfileForm({
          consultationFeeUSD: metricsRes.doctor.consultationFeeUSD || 40,
          bio: metricsRes.doctor.bio || '',
          languagesSpoken: Array.isArray(metricsRes.doctor.languagesSpoken)
            ? metricsRes.doctor.languagesSpoken.join(', ')
            : 'English',
          isAvailable: metricsRes.doctor.isAvailable !== false,
        });
      }

      setMetrics(metricsRes.metrics || metrics);
      setAppointments(queueRes.appointments || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctor workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [filterStatus, filterType, filterDateRange]);

  // Handle Search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDoctorData();
  };

  // Open Dossier Modal
  const handleOpenDossier = (appt) => {
    setActiveAppt(appt);
    setModalTab('dossier');
    setDoctorNotes(appt.doctorNotes || '');
    setTreatmentPlanSummary(appt.treatmentPlanSummary || '');
    setProposedDate(appt.proposedDate || appt.appointmentDate || '');
    setProposedTimeSlot(appt.proposedTimeSlot || '11:30 AM');
    setRescheduleReason('');
    setSuccessMsg('');
    setError('');
  };

  // Update Status Action
  const handleUpdateStatus = async (newStatus) => {
    if (!activeAppt) return;
    setStatusUpdateLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        status: newStatus,
        doctorNotes,
        treatmentPlanSummary: treatmentPlanSummary || (
          newStatus === 'confirmed'
            ? `Recommended stay: ${recommendedStayDays} days. Expected recovery: ${recoveryDays} days. Clinical plan finalized.`
            : ''
        ),
      };

      if (newStatus === 'rescheduled') {
        payload.proposedDate = proposedDate;
        payload.proposedTimeSlot = proposedTimeSlot;
        if (rescheduleReason) {
          payload.doctorNotes = doctorNotes
            ? `${doctorNotes}\n\n[Reschedule Request]: ${rescheduleReason}`
            : `[Reschedule Request]: ${rescheduleReason}`;
        }
      }

      await appointmentService.updateStatus(activeAppt._id, payload);
      setSuccessMsg(`Case #${activeAppt.appointmentRef} updated to '${newStatus.toUpperCase()}' successfully.`);
      
      await loadDoctorData();
      setTimeout(() => {
        setActiveAppt(null);
        setSuccessMsg('');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to update consultation status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Save Doctor Profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!doctorProfile) return;
    setProfileSaving(true);
    setError('');
    try {
      const updated = await doctorService.updateDoctor(doctorProfile._id, {
        consultationFeeUSD: Number(profileForm.consultationFeeUSD),
        bio: profileForm.bio,
        languagesSpoken: profileForm.languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean),
        isAvailable: Boolean(profileForm.isAvailable),
      });
      setDoctorProfile(updated.doctor || { ...doctorProfile, ...profileForm });
      setSuccessMsg('Specialist profile updated successfully.');
      setEditProfileOpen(false);
      loadDoctorData();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Filtered Appointments client-side backup
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const ref = (appt.appointmentRef || '').toLowerCase();
        const name = (appt.patientName || '').toLowerCase();
        const email = (appt.patientEmail || '').toLowerCase();
        const country = (appt.patientCountry || '').toLowerCase();
        const treatment = (appt.treatmentId?.name || '').toLowerCase();
        if (!ref.includes(term) && !name.includes(term) && !email.includes(term) && !country.includes(term) && !treatment.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, searchTerm]);

  // Today's Appointments list
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.appointmentDate === todayStr && a.status !== 'cancelled'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Specialist Header Profile Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={
                  doctorProfile?.avatarUrl ||
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
                }
                alt="Doctor Avatar"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  doctorProfile?.isAvailable !== false ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={doctorProfile?.isAvailable !== false ? 'Accepting Patients' : 'Consultations Paused'}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 font-semibold px-2.5 py-0.5 rounded-full text-[11px] border border-teal-500/30 inline-flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  {doctorProfile?.specialty || 'Super-Specialist Surgeon'}
                </span>
                {doctorProfile?.hospitalId && (
                  <span className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-700">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {doctorProfile.hospitalId.name} ({doctorProfile.hospitalId.city})
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
                {doctorProfile?.fullName || user?.fullName || 'Dr. Naresh Trehan'}
                <ShieldCheck className="w-5 h-5 text-teal-400 inline" />
              </h1>

              <p className="text-slate-400 text-xs line-clamp-1 max-w-xl">
                {doctorProfile?.qualifications || 'MBBS, MS, MCh, Diplomate American Board'} •{' '}
                <span className="text-teal-300 font-medium">
                  {doctorProfile?.experienceYears || 20}+ Years Exp
                </span>{' '}
                • {doctorProfile?.surgeriesCount?.toLocaleString() || '4,500'}+ Surgeries
              </p>
            </div>
          </div>

          {/* Quick Doctor Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/80 text-xs flex items-center gap-2">
              <span className="text-slate-400">Consultation Fee:</span>
              <span className="font-bold text-teal-400">
                {formatPrice(doctorProfile?.consultationFeeUSD || 40)}
              </span>
            </div>

            <button
              onClick={() => setEditProfileOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-300" />
              <span>Edit Profile</span>
            </button>

            <Link
              to="/doctor/availability"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/30 transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Manage Slots</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real-Time KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Pending Review</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-display">
            {metrics.pendingRequests}
          </div>
          <div className="text-[11px] text-slate-400">Requires clinical plan</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Confirmed Consults</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">
            {metrics.confirmedUpcoming}
          </div>
          <div className="text-[11px] text-slate-400">Video & in-person</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Today's Schedule</span>
            <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-display">
            {metrics.todayAppointments}
          </div>
          <div className="text-[11px] text-slate-400">Sessions scheduled today</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Completed Cases</span>
            <FileCheck className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 font-display">
            {metrics.totalCompleted}
          </div>
          <div className="text-[11px] text-slate-400">Treatment finalized</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 col-span-2 md:col-span-1 hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Overseas Patients</span>
            <Globe className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {metrics.internationalPatients}
          </div>
          <div className="text-[11px] text-slate-400">UK, US, UAE, EU & CIS</div>
        </div>
      </div>

      {/* 3. Today's Consultations Alert Card (if any today) */}
      {todayAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 border border-teal-700/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-teal-500/30 text-teal-200 rounded text-[11px] font-bold uppercase tracking-wider">
                Live Today
              </span>
              <span className="text-xs text-slate-300">
                You have {todayAppointments.length} international teleconsultation(s) scheduled for today.
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              Next: {todayAppointments[0].patientName} ({todayAppointments[0].patientCountry}) at{' '}
              <span className="text-teal-300">{todayAppointments[0].timeSlot}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenDossier(todayAppointments[0])}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition"
            >
              <Video className="w-4 h-4" />
              <span>Launch Teleconsultation</span>
            </button>
          </div>
        </div>
      )}

      {error && <Alert type="error" message={error} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      {/* 4. Consultation Queue Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Patient Consultation Queue</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {filteredAppointments.length} inquiries
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review diagnostic scans, confirm teleconsultation slots, and formulate treatment plans.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, Ref #, country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none w-56 sm:w-64"
              />
            </div>
            <button
              type="button"
              onClick={loadDoctorData}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Filter Badges & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Cases' },
              { id: 'pending', label: 'Pending Review' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'rescheduled', label: 'Rescheduled' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters: Type & Date */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Consultation Modes</option>
              <option value="teleconsultation">Online Video Consult</option>
              <option value="in_person">In-Person Hospital Visit</option>
            </select>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Scheduled Today</option>
              <option value="upcoming">Upcoming Dates</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        {loading ? (
          <div className="text-center py-16">
            <Spinner size="lg" className="mx-auto text-teal-600" />
            <p className="text-xs text-slate-500 mt-2">Loading patient dossier queue...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No patient consultation inquiries match your filter criteria.</p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
                setFilterDateRange('all');
                setSearchTerm('');
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Patient Profile</th>
                  <th className="py-3 px-4">Requested Procedure</th>
                  <th className="py-3 px-4">Date & Mode</th>
                  <th className="py-3 px-4">Logistics</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Clinical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/80 transition">
                    {/* Ref Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                      {appt.appointmentRef}
                    </td>

                    {/* Patient Profile */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{appt.patientName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{appt.patientCountry}</div>
                      <div className="text-[10px] text-slate-400">
                        {appt.preferredLanguage ? `Lang: ${appt.preferredLanguage}` : 'English'}
                      </div>
                    </td>

                    {/* Procedure */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate">
                        {appt.treatmentId?.name || doctorProfile?.specialty || 'General Specialist Inquiry'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {appt.medicalReports?.length > 0 ? (
                          <span className="text-teal-700 font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {appt.medicalReports.length} Diagnostic Report(s)
                          </span>
                        ) : (
                          'No scans attached'
                        )}
                      </div>
                    </td>

                    {/* Date & Mode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{appt.appointmentDate}</div>
                      <div className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appt.timeSlot}
                      </div>
                      <span className="inline-block text-[10px] text-slate-500 font-medium capitalize">
                        {appt.consultationType === 'in_person' ? '🏥 Hospital Visit' : '💻 Video Call'}
                      </span>
                    </td>

                    {/* Logistics Flags */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-[10px]">
                        {appt.visaAssistanceRequired && (
                          <span className="inline-flex items-center gap-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <Plane className="w-3 h-3" /> Visa Letter Req.
                          </span>
                        )}
                        {appt.airportPickupRequired && (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            🚖 Airport Pickup
                          </span>
                        )}
                        {!appt.visaAssistanceRequired && !appt.airportPickupRequired && (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
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

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDossier(appt)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Case</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Comprehensive Clinical Review & Dossier Modal */}
      {activeAppt && (
        <Modal
          isOpen={!!activeAppt}
          onClose={() => setActiveAppt(null)}
          title={`Clinical Review & Workspace: Case #${activeAppt.appointmentRef}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-5">
            {successMsg && <Alert type="success" message={successMsg} />}
            {error && <Alert type="error" message={error} />}

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
              <button
                onClick={() => setModalTab('dossier')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'dossier'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Patient Dossier & Scans</span>
              </button>

              <button
                onClick={() => setModalTab('assessment')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'assessment'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>2. Assessment & Treatment Plan</span>
              </button>

              <button
                onClick={() => setModalTab('visa')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'visa'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>3. Visa & Travel Logistics</span>
              </button>

              <button
                onClick={() => setModalTab('teleconsult')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'teleconsult'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>4. Video Consult & Schedule</span>
              </button>
            </div>

            {/* TAB 1: PATIENT DOSSIER & SCANS */}
            {modalTab === 'dossier' && (
              <div className="space-y-4 text-xs">
                {/* Patient Summary Matrix */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                    <span className="font-bold text-slate-900">{activeAppt.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Origin Country</span>
                    <span className="font-bold text-slate-900">{activeAppt.patientCountry}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp / Phone</span>
                    <span className="font-bold text-slate-900">{activeAppt.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Passport #</span>
                    <span className="font-bold text-slate-900">{activeAppt.passportNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Language</span>
                    <span className="font-bold text-slate-900">{activeAppt.preferredLanguage || 'English'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Mode</span>
                    <span className="font-bold text-teal-700 capitalize">
                      {activeAppt.consultationType === 'in_person' ? 'In-Person Hospital Visit' : 'Video Teleconsultation'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Date</span>
                    <span className="font-bold text-slate-900">{activeAppt.appointmentDate} ({activeAppt.timeSlot})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Case Status</span>
                    <span className="font-bold text-amber-700 capitalize">{activeAppt.status}</span>
                  </div>
                </div>

                {/* Patient Symptoms */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Patient Medical Condition & Symptoms Description:
                  </label>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                    {activeAppt.symptomsDescription}
                  </div>
                </div>

                {/* Uploaded Diagnostic Scans */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Attached Diagnostic Files & Medical Records ({activeAppt.medicalReports?.length || 0}):
                    </span>
                  </div>

                  {activeAppt.medicalReports?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeAppt.medicalReports.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-teal-400 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate text-xs">
                                {file.fileName || `Medical_Scan_${idx + 1}.pdf`}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {file.category || 'Diagnostic Report'}
                              </div>
                            </div>
                          </div>

                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-bold text-xs flex items-center gap-1 transition shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-center">
                      No external radiology scans or PDF reports attached with this inquiry.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ASSESSMENT & TREATMENT PLAN */}
            {modalTab === 'assessment' && (
              <div className="space-y-4 text-xs">
                {/* Doctor Clinical Assessment Notes */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Clinical Diagnosis & Surgeon Findings:
                  </label>
                  <textarea
                    rows={4}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter clinical assessment, surgical evaluation, imaging findings, and pre-consultation remarks..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    These clinical notes will be accessible to the patient and embedded into their medical summary.
                  </p>
                </div>

                {/* Treatment Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      Recommended In-Hospital Stay (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={recommendedStayDays}
                      onChange={(e) => setRecommendedStayDays(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      Estimated Post-Op Recovery in India (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={recoveryDays}
                      onChange={(e) => setRecoveryDays(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preliminary Treatment Plan Summary */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Preliminary Surgical Technique & Treatment Protocol:
                  </label>
                  <textarea
                    rows={3}
                    value={treatmentPlanSummary}
                    onChange={(e) => setTreatmentPlanSummary(e.target.value)}
                    placeholder="e.g. Off-Pump Beating Heart CABG; 3D Robotic Knee Replacement with Mako system; Full Mouth All-on-4 with Immediate Zirconia Loading..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MEDICAL VISA & TRAVEL LOGISTICS */}
            {modalTab === 'visa' && (
              <div className="space-y-4 text-xs">
                {/* Official Visa Invitation Preview Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-3 font-serif">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-sans">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-600" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {activeAppt.hospitalId?.name || 'Accredited Indian Medical Institution'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          NABH & JCI Accredited International Patient Service Desk
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-slate-200 px-2 py-0.5 rounded">
                      VISA-INV-{activeAppt.appointmentRef}
                    </span>
                  </div>

                  <div className="text-slate-800 leading-relaxed text-xs space-y-2">
                    <p className="font-semibold font-sans text-[11px] text-slate-600">
                      To: The Consular Officer, Embassy / High Commission of India in {activeAppt.patientCountry}
                    </p>
                    <p>
                      <strong>Subject:</strong> Official Medical Visa (MED) Invitation Letter for Specialized Treatment of{' '}
                      <strong>{activeAppt.patientName}</strong> (Passport: {activeAppt.passportNumber || 'PROVIDED_ON_FILE'}).
                    </p>
                    <p className="text-[11px] text-slate-600">
                      This is to confirm that patient <strong>{activeAppt.patientName}</strong> has been clinically evaluated by{' '}
                      <strong>{doctorProfile?.fullName || 'Senior Consultant'}</strong> for{' '}
                      <strong>{activeAppt.treatmentId?.name || doctorProfile?.specialty || 'Specialized Procedure'}</strong>.
                      Treatment is scheduled commencing on <strong>{activeAppt.appointmentDate}</strong>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-sans text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Consultant Signature:</span>
                      <span className="font-bold text-slate-900">{doctorProfile?.fullName}</span>
                    </div>
                    <a
                      href={`/api/appointments/${activeAppt._id}/visa-letter`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Visa Letter JSON / PDF</span>
                    </a>
                  </div>
                </div>

                {/* Airport Transfer Status */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-teal-600" />
                    <span>Flight & Airport Chauffeur Logistics:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Airport Pick-up</span>
                      <span className="font-bold">
                        {activeAppt.airportPickupRequired ? '✅ Requested' : 'Not required'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Flight / Airline</span>
                      <span className="font-bold">
                        {activeAppt.flightNumber ? `${activeAppt.airline} ${activeAppt.flightNumber}` : 'Pending booking'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Accompanying Attendants</span>
                      <span className="font-bold">{activeAppt.attendantsCount || 0} Attendant(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TELECONSULTATION & RESCHEDULING */}
            {modalTab === 'teleconsult' && (
              <div className="space-y-4 text-xs">
                {/* Teleconsultation Meeting Link Generator */}
                <div className="bg-teal-50/80 p-4 rounded-2xl border border-teal-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-teal-950 flex items-center gap-2">
                      <Video className="w-4 h-4 text-teal-700" />
                      <span>Dedicated Encrypted Video Room</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-200/70 px-2 py-0.5 rounded">
                      WebRTC Telehealth HD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://meet.medijourney.in/room/${activeAppt.appointmentRef}`}
                      className="w-full bg-white border border-teal-300 rounded-xl p-2.5 text-xs text-slate-700 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://meet.medijourney.in/room/${activeAppt.appointmentRef}`
                        );
                        setCopiedRoomLink(true);
                        setTimeout(() => setCopiedRoomLink(false), 2000);
                      }}
                      className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition"
                    >
                      {copiedRoomLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedRoomLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={`https://meet.jit.si/medijourney-${activeAppt.appointmentRef}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow transition"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Video Consultation Room Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Reschedule Proposal Section */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Propose Alternative Date or Time Slot:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        New Consultation Date:
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        New Time Slot:
                      </label>
                      <select
                        value={proposedTimeSlot}
                        onChange={(e) => setProposedTimeSlot(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="10:00 AM">10:00 AM IST</option>
                        <option value="11:30 AM">11:30 AM IST</option>
                        <option value="02:00 PM">02:00 PM IST</option>
                        <option value="03:30 PM">03:30 PM IST</option>
                        <option value="05:00 PM">05:00 PM IST</option>
                        <option value="06:30 PM">06:30 PM IST</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reason for Rescheduling (Sent to Patient):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prior emergency surgery scheduled; proposing alternate slot..."
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close Window
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus('rescheduled')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Propose Reschedule</span>
                </button>

                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus('completed')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>

                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus('confirmed')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-1.5"
                >
                  {statusUpdateLoading ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm Appointment & Visa</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Edit Doctor Profile Modal */}
      {editProfileOpen && (
        <Modal
          isOpen={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          title="Edit Specialist Credentials & Consultation Settings"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Online Consultation Fee (USD) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={profileForm.consultationFeeUSD}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, consultationFeeUSD: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Converted dynamically to patient's local currency (GBP, EUR, AED, USD, etc.).
              </span>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Languages Spoken (comma separated) *
              </label>
              <input
                type="text"
                required
                placeholder="English, Hindi, Arabic, Russian, French"
                value={profileForm.languagesSpoken}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, languagesSpoken: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Doctor Professional Bio & Clinical Philosophy *
              </label>
              <textarea
                rows={4}
                required
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isAvailableCheck"
                checked={profileForm.isAvailable}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, isAvailable: e.target.checked })
                }
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor="isAvailableCheck" className="font-semibold text-slate-800">
                Accepting new international patient consultation inquiries
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                {profileSaving && <Spinner size="sm" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
