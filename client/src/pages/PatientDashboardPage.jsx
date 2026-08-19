import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { authService } from '../services/authService';
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
  Copy,
  ClipboardCheck,
  Pencil,
  Save,
  BarChart3,
  NotebookText,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  HelpCircle,
  MessageSquare,
  Phone,
  ListTodo,
  Info,
  Sparkles,
  Filter,
  CreditCard,
  AlertTriangle,
  HeartPulse,
  Compass,
  MapPin,
  RotateCcw,
  FileDown,
  Layers,
  CheckCircle,
} from 'lucide-react';

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'visa', text: 'Apply for Indian e-Medical Visa (MED) with official hospital invitation letter', category: 'Visa & Travel' },
  { id: 'flight', text: 'Book return flight tickets and submit arrival itinerary for airport pickup', category: 'Visa & Travel' },
  { id: 'records', text: 'Pack physical copies of past MRI/CT scans, blood test reports & doctor prescriptions', category: 'Medical Prep' },
  { id: 'meds', text: 'Carry a 30-day supply of ongoing personal medications in original labeled packaging', category: 'Medical Prep' },
  { id: 'hotel', text: 'Confirm companion accommodation / guest-house reservation near the medical facility', category: 'Stay & Logistics' },
  { id: 'currency', text: 'Notify home bank for international cards & carry initial INR cash for local expenses', category: 'Financial' },
  { id: 'sim', text: 'Arrange international roaming or pre-order India tourist eSIM / local connectivity', category: 'Communication' },
  { id: 'emergency', text: 'Save hospital international patient coordinator & 24/7 hotline numbers in phone', category: 'Safety' },
];

export const PatientDashboardPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lookup for guest users by email or ref
  const [lookupEmail, setLookupEmail] = useState(user?.email || '');
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Search, filter & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Active dossier navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logistics' | 'records' | 'prep' | 'support'

  // Document upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Diagnostic Scan (MRI/CT/X-Ray)');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Visa letter modal state
  const [visaModalOpen, setVisaModalOpen] = useState(false);
  const [visaLetterData, setVisaLetterData] = useState(null);
  const [loadingVisaLetter, setLoadingVisaLetter] = useState(false);

  // Case dossier print summary modal
  const [dossierPrintModalOpen, setDossierPrintModalOpen] = useState(false);

  // Emergency SOS Modal
  const [sosModalOpen, setSosModalOpen] = useState(false);

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

  // Profile edit panel state
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    country: user?.country || '',
    passportNumber: user?.passportNumber || '',
    preferredLanguage: user?.preferredLanguage || 'English',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Clipboard copy state for appointment ref
  const [copiedRef, setCopiedRef] = useState(false);

  // Interactive Checklist State (stored per case)
  const [checklist, setChecklist] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Doctor Questions Scratchpad State (stored per case)
  const [doctorQuestions, setDoctorQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');

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

  // Load checklist and doctor questions from localStorage when selectedAppt changes
  useEffect(() => {
    if (!selectedAppt?._id && !selectedAppt?.appointmentRef) {
      setChecklist([]);
      setDoctorQuestions([]);
      return;
    }
    const key = selectedAppt.appointmentRef || selectedAppt._id;
    
    // Checklist loader
    try {
      const savedChecklist = localStorage.getItem(`medijourney_checklist_${key}`);
      if (savedChecklist) {
        setChecklist(JSON.parse(savedChecklist));
      } else {
        setChecklist(DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item, completed: false })));
      }
    } catch (e) {
      setChecklist(DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item, completed: false })));
    }

    // Questions loader
    try {
      const savedQuestions = localStorage.getItem(`medijourney_questions_${key}`);
      if (savedQuestions) {
        setDoctorQuestions(JSON.parse(savedQuestions));
      } else {
        setDoctorQuestions([
          { id: '1', text: 'What is the projected hospital stay and recovery timeline?', completed: false },
          { id: '2', text: 'Are there any pre-procedure dietary or medication restrictions?', completed: false },
          { id: '3', text: 'Will follow-up virtual consultations be available once I return home?', completed: false },
        ]);
      }
    } catch (e) {
      setDoctorQuestions([]);
    }
  }, [selectedAppt?._id, selectedAppt?.appointmentRef]);

  // Save checklist to localStorage
  const saveChecklist = (newList) => {
    setChecklist(newList);
    const key = selectedAppt?.appointmentRef || selectedAppt?._id;
    if (key) {
      try {
        localStorage.setItem(`medijourney_checklist_${key}`, JSON.stringify(newList));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Save doctor questions to localStorage
  const saveDoctorQuestions = (newQuestions) => {
    setDoctorQuestions(newQuestions);
    const key = selectedAppt?.appointmentRef || selectedAppt?._id;
    if (key) {
      try {
        localStorage.setItem(`medijourney_questions_${key}`, JSON.stringify(newQuestions));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleChecklistItem = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveChecklist(updated);
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistText.trim(),
      category: 'Custom Prep',
      completed: false,
    };
    saveChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id) => {
    const updated = checklist.filter((item) => item.id !== id);
    saveChecklist(updated);
  };

  const handleResetChecklist = () => {
    if (window.confirm('Reset checklist back to default items?')) {
      const reset = DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item, completed: false }));
      saveChecklist(reset);
    }
  };

  const handleToggleQuestion = (id) => {
    const updated = doctorQuestions.map((q) =>
      q.id === id ? { ...q, completed: !q.completed } : q
    );
    saveDoctorQuestions(updated);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: Date.now().toString(),
      text: newQuestionText.trim(),
      completed: false,
    };
    saveDoctorQuestions([...doctorQuestions, newQ]);
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (id) => {
    const updated = doctorQuestions.filter((q) => q.id !== id);
    saveDoctorQuestions(updated);
  };

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

  // Save patient profile (name, phone, country, passport, language)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await authService.updateProfile(profileForm);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setProfileSuccess('');
        setProfilePanelOpen(false);
      }, 2000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Copy appointment reference to clipboard
  const handleCopyRef = (ref) => {
    navigator.clipboard.writeText(ref).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
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

  const getWhatsAppLink = (appt) => {
    if (!appt) return 'https://wa.me/';
    const ref = appt.appointmentRef || 'General Inquiry';
    const doc = appt.doctorId?.fullName || 'Specialist';
    const hosp = appt.hospitalId?.name || 'Hospital';
    const message = encodeURIComponent(
      `Hello MediJourney International Patient Desk, I am reaching out regarding Case Ref: ${ref} (Doctor: ${doc}, Hospital: ${hosp}). I would like assistance with my upcoming medical journey.`
    );
    return `https://wa.me/919876543210?text=${message}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Completed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Rescheduled
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
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
          </span>
        );
    }
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        // Status filter
        if (statusFilter !== 'all' && appt.status !== statusFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchRef = appt.appointmentRef?.toLowerCase().includes(q);
          const matchDoc = appt.doctorId?.fullName?.toLowerCase().includes(q);
          const matchHosp = appt.hospitalId?.name?.toLowerCase().includes(q);
          const matchCity = appt.hospitalId?.city?.toLowerCase().includes(q);
          const matchType = appt.consultationType?.toLowerCase().includes(q);
          return matchRef || matchDoc || matchHosp || matchCity || matchType;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'date') {
          return (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
        }
        return 0;
      });
  }, [appointments, statusFilter, searchQuery, sortBy]);

  // Calculate checklist completion percentage
  const checklistProgress = useMemo(() => {
    if (!checklist.length) return 0;
    const completed = checklist.filter((item) => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  }, [checklist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 font-semibold px-2.5 py-0.5 rounded text-xs border border-teal-500/30">
              International Patient Portal
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-700">
              India Medical Travel Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome, {user?.fullName || 'International Traveler'}
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl">
            Manage your medical consultation requests, track hospital confirmations, access medical visa letters, coordinate airport pickup, and prepare your travel checklist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Quick SOS / Help Desk Trigger */}
          <button
            onClick={() => setSosModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            24/7 Care &amp; SOS
          </button>

          {/* Edit Profile Button (only for logged-in patients) */}
          {user && (
            <button
              onClick={() => {
                setProfilePanelOpen(!profilePanelOpen);
                setProfileForm({
                  fullName: user?.fullName || '',
                  phone: user?.phone || '',
                  country: user?.country || '',
                  passportNumber: user?.passportNumber || '',
                  preferredLanguage: user?.preferredLanguage || 'English',
                });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl text-xs font-semibold transition"
            >
              <Pencil className="w-3.5 h-3.5 text-teal-300" />
              Edit Profile
            </button>
          )}

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
      </div>

      {/* Stats Summary Bar */}
      {appointments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Requests',
              value: appointments.length,
              icon: <BarChart3 className="w-4 h-4 text-slate-500" />,
              bg: 'bg-white',
              text: 'text-slate-800',
            },
            {
              label: 'Confirmed',
              value: appointments.filter((a) => a.status === 'confirmed').length,
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
              bg: 'bg-emerald-50',
              text: 'text-emerald-800',
            },
            {
              label: 'Pending Review',
              value: appointments.filter((a) => a.status === 'pending').length,
              icon: <Clock className="w-4 h-4 text-amber-500" />,
              bg: 'bg-amber-50',
              text: 'text-amber-800',
            },
            {
              label: 'Completed',
              value: appointments.filter((a) => a.status === 'completed').length,
              icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
              bg: 'bg-blue-50',
              text: 'text-blue-800',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs`}
            >
              <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                {stat.icon}
              </div>
              <div>
                <div className={`text-xl font-extrabold font-display ${stat.text}`}>{stat.value}</div>
                <div className="text-[11px] text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible Profile Edit Panel */}
      {profilePanelOpen && user && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <User className="w-4 h-4 text-teal-600" />
              Edit My Profile
            </div>
            <button
              onClick={() => setProfilePanelOpen(false)}
              className="text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {profileSuccess && <Alert type="success" message={profileSuccess} />}
          {profileError && <Alert type="error" message={profileError} />}

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                placeholder="+1 212 555 0100"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Country of Residence</label>
              <input
                type="text"
                placeholder="e.g. United Kingdom"
                value={profileForm.country}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passport Number</label>
              <input
                type="text"
                placeholder="e.g. A1234567"
                value={profileForm.passportNumber}
                onChange={(e) => setProfileForm({ ...profileForm, passportNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preferred Language</label>
              <select
                value={profileForm.preferredLanguage}
                onChange={(e) => setProfileForm({ ...profileForm, preferredLanguage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {['English', 'Arabic', 'French', 'Russian', 'German', 'Spanish', 'Mandarin', 'Hindi', 'Swahili'].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                {savingProfile ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {/* Main Grid: Appointments Queue vs Appointment Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: List of Requests with Search & Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>My Inquiries &amp; Bookings</span>
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              {filteredAppointments.length} of {appointments.length}
            </span>
          </div>

          {/* Search and Filter Toolbar */}
          {appointments.length > 0 && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5 shadow-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor, hospital, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                {['all', 'confirmed', 'pending', 'rescheduled', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                      statusFilter === status
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>

              {/* Sorting Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Filter className="w-3 h-3 text-slate-400" /> Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-0 font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Latest Booking</option>
                  <option value="oldest">Oldest Booking</option>
                  <option value="date">Appointment Date</option>
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <Spinner size="md" className="mx-auto" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 text-xs text-slate-500">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-700 text-sm">No consultation requests yet</p>
                <p>You haven't booked any consultations. Browse our accredited specialists and get started.</p>
              </div>
              <a
                href="/doctors"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Browse Specialists
              </a>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 text-xs text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-700">No requests match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-teal-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredAppointments.map((appt) => (
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-2xl font-mono font-extrabold text-teal-700">
                      {selectedAppt.appointmentRef}
                    </h3>
                    <button
                      onClick={() => handleCopyRef(selectedAppt.appointmentRef)}
                      title="Copy reference to clipboard"
                      className="p-1.5 text-slate-400 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 rounded-lg border border-slate-200 transition"
                    >
                      {copiedRef ? (
                        <ClipboardCheck className="w-3.5 h-3.5 text-teal-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(selectedAppt.status)}

                  {/* Print Summary Slip Button */}
                  <button
                    onClick={() => setDossierPrintModalOpen(true)}
                    title="Print Case Summary Slip"
                    className="p-2 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-xl transition border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Case Slip</span>
                  </button>

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
                      <span>Visa Letter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Interactive Navigation Tabs */}
              <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs">
                {[
                  { id: 'overview', label: 'Consultation Overview', icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: 'logistics', label: 'Flight & Visa Logistics', icon: <Plane className="w-3.5 h-3.5" /> },
                  {
                    id: 'records',
                    label: `Medical Scans (${selectedAppt.medicalReports?.length || 0})`,
                    icon: <ShieldCheck className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'prep',
                    label: `Trip Checklist & Q&A (${checklistProgress}%)`,
                    icon: <ListTodo className="w-3.5 h-3.5" />,
                  },
                  { id: 'support', label: 'Hospital Desk & Help', icon: <PhoneCall className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 pb-3 px-3 font-semibold border-b-2 whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'border-teal-600 text-teal-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: OVERVIEW & CLINICAL DETAILS */}
              {/* ========================================================================= */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Visual Milestone Progress Tracker */}
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
                        Specialist Proposed an Alternate Date &amp; Slot
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
                          Decline &amp; Cancel
                        </button>
                      </div>
                    </div>
                  )}

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
                        Airport: {selectedAppt.hospitalId?.airportName || 'International Airport'}
                      </div>
                    </div>
                  </div>

                  {/* Date, Time & Mode */}
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

                  {/* Patient Submitted Symptoms */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-800">
                      Medical Inquiry &amp; Condition Description:
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedAppt.symptomsDescription || 'No detailed symptoms provided.'}
                    </div>
                  </div>

                  {/* Doctor Clinical Notes (if available) */}
                  {selectedAppt.doctorNotes && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-teal-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        Doctor’s Preliminary Assessment &amp; Treatment Recommendation:
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium leading-relaxed whitespace-pre-line">
                        {selectedAppt.doctorNotes}
                      </div>
                    </div>
                  )}

                  {/* Treatment Plan Summary (if doctor wrote one) */}
                  {selectedAppt.treatmentPlanSummary && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <NotebookText className="w-4 h-4 text-blue-600" />
                        Proposed Treatment Plan Summary:
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 font-medium leading-relaxed whitespace-pre-line">
                        {selectedAppt.treatmentPlanSummary}
                      </div>
                    </div>
                  )}

                  {/* Financial Overview Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-teal-600" />
                        Case Financial &amp; Service Inclusions
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        Transparent Pricing
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-slate-400 text-[10px]">Consultation Fee</span>
                        <div className="text-sm font-bold text-slate-900">
                          {formatPrice(selectedAppt.doctorId?.consultationFeeUSD || 50)}
                        </div>
                        <span className="text-[10px] text-slate-500">Payable at hospital/online</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-slate-400 text-[10px]">Airport Chauffeur Transfer</span>
                        <div className="text-sm font-bold text-emerald-700">
                          COMPLIMENTARY
                        </div>
                        <span className="text-[10px] text-slate-500">Provided by hospital</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-slate-400 text-[10px]">Language Interpreter &amp; Desk</span>
                        <div className="text-sm font-bold text-emerald-700">
                          INCLUDED
                        </div>
                        <span className="text-[10px] text-slate-500">Dedicated case manager</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: FLIGHT & VISA LOGISTICS */}
              {/* ========================================================================= */}
              {activeTab === 'logistics' && (
                <div className="space-y-6">
                  {/* Medical Visa Section */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <FileBadge className="w-4 h-4 text-teal-600" />
                          Indian e-Medical Visa (MED / MED-X)
                        </div>
                        <p className="text-slate-500">
                          {selectedAppt.visaAssistanceRequired
                            ? 'Your visa assistance request is linked to this hospital dossier.'
                            : 'No visa invitation letter was requested during booking.'}
                        </p>
                      </div>

                      {selectedAppt.visaAssistanceRequired && (
                        <button
                          onClick={handleOpenVisaLetter}
                          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>View Official Invitation Letter</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Visa Type</span>
                        <span className="font-bold text-slate-800">e-Medical (MED)</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Attendant Visa</span>
                        <span className="font-bold text-slate-800">e-Medical Attendant (MED-X)</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Processing Time</span>
                        <span className="font-bold text-slate-800">48 - 72 Hours Online</span>
                      </div>
                    </div>
                  </div>

                  {/* AIRPORT ARRIVAL & FLIGHT LOGISTICS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Plane className="w-4 h-4 text-teal-600" />
                        Complimentary Airport Pick-Up &amp; Arrival Logistics
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
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Arrival Date &amp; Time</label>
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
                              onChange={(e) => setFlightFormData({ ...flightFormData, attendantsCount: Number(e.target.value) })}
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
                            <span>Confirm Dedicated Hospital Airport Chauffeur &amp; Translator</span>
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
                          <span className="text-slate-400 block text-[10px]">Airline &amp; Flight</span>
                          <span className="font-bold text-slate-900">
                            {selectedAppt.airline ? `${selectedAppt.airline} (${selectedAppt.flightNumber})` : 'Not provided yet'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Arrival Schedule</span>
                          <span className="font-bold text-slate-900">
                            {selectedAppt.arrivalDateTime || 'Pending itinerary'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Airport Destination</span>
                          <span className="font-bold text-slate-900">
                            {selectedAppt.hospitalId?.airportName || 'Delhi / Mumbai (India)'}
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
              )}

              {/* ========================================================================= */}
              {/* TAB 3: MEDICAL RECORDS & SCANS */}
              {/* ========================================================================= */}
              {activeTab === 'records' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Attached Medical Scans &amp; Diagnostic Reports ({selectedAppt.medicalReports?.length || 0})
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> HIPAA / DISHA Encrypted
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
                          <option value="Pathology &amp; Blood Tests">Pathology &amp; Blood Tests</option>
                          <option value="Clinical Summary &amp; Prescription">Clinical Summary &amp; Prescription</option>
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
              )}

              {/* ========================================================================= */}
              {/* TAB 4: INTERACTIVE TRAVEL CHECKLIST & DOCTOR Q&A SCRATCHPAD */}
              {/* ========================================================================= */}
              {activeTab === 'prep' && (
                <div className="space-y-6">
                  {/* Checklist Header & Progress Bar */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <ListTodo className="w-4 h-4 text-teal-600" />
                          India Medical Travel Preparation Checklist
                        </h4>
                        <p className="text-xs text-slate-500">
                          Track your essential pre-departure documents, visas, medications, and accommodations.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full">
                          {checklistProgress}% Completed
                        </span>
                        <button
                          onClick={handleResetChecklist}
                          title="Reset Checklist"
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${checklistProgress}%` }}
                      />
                    </div>

                    {/* Checklist Items List */}
                    <div className="space-y-2 pt-2">
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer text-xs ${
                            item.completed
                              ? 'bg-emerald-50/70 border-emerald-200 text-slate-600 line-through'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              className="mt-0.5 text-teal-600 shrink-0 focus:outline-none"
                            >
                              {item.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <div>
                              <span className="font-medium leading-relaxed">{item.text}</span>
                              {item.category && (
                                <span className="block text-[10px] text-slate-400 no-underline font-normal">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChecklistItem(item.id);
                            }}
                            className="text-slate-300 hover:text-rose-500 p-1 shrink-0 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Item */}
                    <form onSubmit={handleAddChecklistItem} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add a custom preparation task (e.g. buy wheelchair luggage)..."
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>
                  </div>

                  {/* Doctor Questions Scratchpad */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-teal-600" />
                          Questions for My Consultation with Dr. {selectedAppt.doctorId?.fullName?.split(' ')[0] || 'Specialist'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Jot down notes and questions so you don't forget to ask during your consultation.
                        </p>
                      </div>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                        {doctorQuestions.length} Questions
                      </span>
                    </div>

                    <div className="space-y-2">
                      {doctorQuestions.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => handleToggleQuestion(q.id)}
                          className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer text-xs ${
                            q.completed
                              ? 'bg-blue-50/70 border-blue-200 text-slate-500 line-through'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button type="button" className="mt-0.5 text-blue-600 shrink-0">
                              {q.completed ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <span className="font-medium">{q.text}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(q.id);
                            }}
                            className="text-slate-300 hover:text-rose-500 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddQuestion} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type a question for the doctor (e.g. Can I resume gentle exercise after 2 weeks?)..."
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: 24/7 SUPPORT & HOSPITAL DESK */}
              {/* ========================================================================= */}
              {activeTab === 'support' && (
                <div className="space-y-5 text-xs">
                  <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-teal-300 font-bold">
                      <PhoneCall className="w-4 h-4" />
                      Dedicated International Patient Coordination Desk
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Our international patient navigators are available 24/7 to assist with appointment rescheduling, airport chauffeur rendezvous, currency exchange, translator arrangements, and hospital admissions.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <a
                        href={getWhatsAppLink(selectedAppt)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat via WhatsApp (Case #{selectedAppt.appointmentRef})</span>
                      </a>

                      <a
                        href="tel:+919876543210"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call +91 98765 43210</span>
                      </a>
                    </div>
                  </div>

                  {/* Local India Emergency Numbers Card */}
                  <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-3">
                    <div className="font-bold text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Emergency &amp; Helpline Numbers in India
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-800">
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Medical Ambulance</span>
                        <span className="font-bold text-base text-rose-700">108 / 112</span>
                        <span className="text-[10px] text-slate-500 block">Toll-free 24/7</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Tourist Infoline</span>
                        <span className="font-bold text-base text-teal-700">1363</span>
                        <span className="text-[10px] text-slate-500 block">Ministry of Tourism (12 languages)</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Police Emergency</span>
                        <span className="font-bold text-base text-slate-900">100 / 112</span>
                        <span className="text-[10px] text-slate-500 block">National Emergency</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
      {/* 8. OFFICIAL HOSPITAL MEDICAL VISA (MED) INVITATION LETTER MODAL */}
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
                <span>Issued for: <strong>Indian e-Medical Visa (MED &amp; MED-X)</strong></span>
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
                <div className="text-slate-600">Consular &amp; Visa Division</div>
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

      {/* ========================================================================= */}
      {/* 9. CASE SUMMARY DOSSIER PRINT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={dossierPrintModalOpen}
        onClose={() => setDossierPrintModalOpen(false)}
        title="Patient Medical Travel Summary Slip"
        maxWidth="max-w-3xl"
      >
        {selectedAppt && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-600">
                Official intake and immigration summary slip for <strong>{selectedAppt.appointmentRef}</strong>
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier Slip</span>
              </button>
            </div>

            <div className="p-6 bg-white border-2 border-slate-300 rounded-2xl space-y-5 text-xs text-slate-900">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-teal-800 font-display">MediJourney India - Medical Travel Dossier</h3>
                  <p className="text-slate-500 text-[11px]">Accredited Cross-Border Healthcare &amp; Patient Facilitation</p>
                </div>
                <div className="text-right font-mono font-bold text-sm text-slate-800">
                  REF: {selectedAppt.appointmentRef}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Patient Information</span>
                  <div className="font-bold">{selectedAppt.patientName}</div>
                  <div>Email: {selectedAppt.patientEmail}</div>
                  <div>Phone: {selectedAppt.patientPhone || user?.phone || 'N/A'}</div>
                  <div>Country: {user?.country || 'International Traveler'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Consultation Schedule</span>
                  <div className="font-bold">{selectedAppt.appointmentDate} at {selectedAppt.timeSlot}</div>
                  <div>Mode: <span className="capitalize font-semibold">{selectedAppt.consultationType}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700 capitalize">{selectedAppt.status}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Specialist &amp; Hospital</span>
                  <div className="font-bold">{selectedAppt.doctorId?.fullName}</div>
                  <div>{selectedAppt.doctorId?.specialty}</div>
                  <div className="font-medium text-teal-800">{selectedAppt.hospitalId?.name}</div>
                  <div>{selectedAppt.hospitalId?.city}, India</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Arrival &amp; Airport Transfer</span>
                  <div>Flight: {selectedAppt.airline ? `${selectedAppt.airline} (${selectedAppt.flightNumber})` : 'Pending'}</div>
                  <div>Arrival: {selectedAppt.arrivalDateTime || 'To be updated'}</div>
                  <div>Airport Pickup: {selectedAppt.airportPickupRequired ? 'Confirmed (Hospital Chauffeur)' : 'Self Arranged'}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Medical Condition Note</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed text-slate-700">
                  {selectedAppt.symptomsDescription || 'Consultation request placed.'}
                </p>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex justify-between items-center border-t border-slate-100">
                <span>Verified by MediJourney India International Patient Desk</span>
                <span>Support: +91 98765 43210</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 10. EMERGENCY 24/7 SOS & CARE DESK MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        title="24/7 International Patient Assistance &amp; Emergency SOS"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Immediate India Medical Emergency
            </div>
            <p className="text-rose-800 leading-relaxed">
              If you or your companion are experiencing an acute medical emergency, call India's national medical dispatch immediately:
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="tel:108"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 108 (Ambulance)</span>
              </a>
              <a
                href="tel:112"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 112 (National SOS)</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
            <div className="font-bold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Dedicated Case Coordinator
            </div>
            <p className="text-teal-800 leading-relaxed">
              Connect directly with our international desk for fast support with flight delays, visa queries, or hospital admissions:
            </p>
            <a
              href={getWhatsAppLink(selectedAppt)}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
