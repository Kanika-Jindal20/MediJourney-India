import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { Spinner, Alert } from '../../components/common/Alert';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Stethoscope,
  ArrowLeft,
  Video,
  Building2,
  Sparkles,
  Layers,
  Filter,
  Check,
  CalendarDays,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const DoctorAvailabilityPage = () => {
  const { user } = useAuth();

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mode: 'single' vs 'bulk'
  const [schedulerMode, setSchedulerMode] = useState('single');

  // Single Slot Form
  const [newSlot, setNewSlot] = useState({
    slotDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    slotType: 'teleconsultation',
  });

  // Bulk Slots Form
  const [bulkStartDate, setBulkStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bulkDaysCount, setBulkDaysCount] = useState(3);
  const [shiftPreset, setShiftPreset] = useState('morning'); // 'morning', 'afternoon', 'fullday'
  const [bulkSlotType, setBulkSlotType] = useState('teleconsultation');

  // Slot List Filters
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'tomorrow', 'upcoming'
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'booked'

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await doctorService.getDoctors();
        setDoctorsList(res.doctors || []);
        if (res.doctors?.length > 0) {
          // If logged in as doctor, try to match current doctor
          const matching = res.doctors.find((d) => d.userId === user?._id);
          setSelectedDoctorId(matching ? matching._id : res.doctors[0]._id);
        }
      } catch (e) {
        setError('Failed to fetch doctor accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [user]);

  const loadSlots = async (docId = selectedDoctorId) => {
    if (!docId) return;
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getDoctorSlots(docId);
      setSlots(res.slots || []);
    } catch (e) {
      setError(e.message || 'Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId) {
      loadSlots(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  // Handle Single Slot Submission
  const handleAddSingleSlot = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await doctorService.createSlot(selectedDoctorId, newSlot);
      setSuccess('Availability slot published to international booking calendar.');
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to create slot');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Bulk Slots Generation
  const handleGenerateBulkSlots = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const timeBlocks = {
        morning: [
          { startTime: '09:00 AM', endTime: '09:30 AM' },
          { startTime: '09:30 AM', endTime: '10:00 AM' },
          { startTime: '10:30 AM', endTime: '11:00 AM' },
          { startTime: '11:30 AM', endTime: '12:00 PM' },
          { startTime: '12:00 PM', endTime: '12:30 PM' },
        ],
        afternoon: [
          { startTime: '02:00 PM', endTime: '02:30 PM' },
          { startTime: '02:30 PM', endTime: '03:00 PM' },
          { startTime: '03:30 PM', endTime: '04:00 PM' },
          { startTime: '04:30 PM', endTime: '05:00 PM' },
          { startTime: '05:00 PM', endTime: '05:30 PM' },
        ],
        fullday: [
          { startTime: '10:00 AM', endTime: '10:30 AM' },
          { startTime: '11:30 AM', endTime: '12:00 PM' },
          { startTime: '02:00 PM', endTime: '02:30 PM' },
          { startTime: '03:30 PM', endTime: '04:00 PM' },
          { startTime: '05:00 PM', endTime: '05:30 PM' },
        ],
      };

      const selectedTimes = timeBlocks[shiftPreset] || timeBlocks.morning;
      const slotsToCreate = [];

      const start = new Date(bulkStartDate);
      for (let i = 0; i < Number(bulkDaysCount); i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        for (const t of selectedTimes) {
          slotsToCreate.push({
            slotDate: dateStr,
            startTime: t.startTime,
            endTime: t.endTime,
            slotType: bulkSlotType,
          });
        }
      }

      const res = await doctorService.createBulkSlots(selectedDoctorId, slotsToCreate);
      setSuccess(res.message || `Successfully published ${slotsToCreate.length} time slots!`);
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to generate bulk slots');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this availability slot?')) return;
    setError('');
    setSuccess('');
    try {
      await doctorService.deleteSlot(slotId);
      setSuccess('Slot removed successfully.');
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to remove slot');
    }
  };

  // Filter slots
  const filteredSlots = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    return slots.filter((slot) => {
      // Date filter
      if (filterDate === 'today' && slot.slotDate !== todayStr) return false;
      if (filterDate === 'tomorrow' && slot.slotDate !== tomorrowStr) return false;
      if (filterDate === 'upcoming' && slot.slotDate < todayStr) return false;

      // Type filter
      if (filterType !== 'all' && slot.slotType !== filterType) return false;

      // Status filter
      if (filterStatus === 'available' && slot.isBooked) return false;
      if (filterStatus === 'booked' && !slot.isBooked) return false;

      return true;
    });
  }, [slots, filterDate, filterType, filterStatus]);

  const activeDoc = doctorsList.find((d) => d._id === selectedDoctorId);
  const openSlotsCount = slots.filter((s) => !s.isBooked).length;
  const bookedSlotsCount = slots.filter((s) => s.isBooked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Doctor Consultation Workspace</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-400" />
            Specialist Schedule Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
            Doctor Availability & Slot Scheduler
          </h1>
          <p className="text-slate-400 text-xs max-w-xl">
            Configure real-time teleconsultation and in-person hospital slots. International patients booking via MediJourney India will see these available slots live.
          </p>
        </div>

        {/* Doctor Selector & Counters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {doctorsList.length > 1 && (
            <div className="bg-slate-800/90 p-2.5 rounded-2xl border border-slate-700 text-xs">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Active Specialist
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-teal-400 w-full"
              >
                {doctorsList.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fullName} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 text-xs flex items-center justify-around gap-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Open Slots</span>
              <span className="text-lg font-extrabold text-teal-400 font-display">{openSlotsCount}</span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Booked</span>
              <span className="text-lg font-extrabold text-emerald-400 font-display">{bookedSlotsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Main Grid: Slot Creator vs Slots Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Mode Tabs & Forms */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Publish Availability</span>
            </h2>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSchedulerMode('single')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  schedulerMode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Slot
              </button>
              <button
                type="button"
                onClick={() => setSchedulerMode('bulk')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  schedulerMode === 'bulk'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 text-teal-600" />
                <span>Bulk Shift</span>
              </button>
            </div>
          </div>

          {/* SINGLE SLOT FORM */}
          {schedulerMode === 'single' ? (
            <form onSubmit={handleAddSingleSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newSlot.slotDate}
                  onChange={(e) => setNewSlot({ ...newSlot, slotDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Type
                </label>
                <select
                  value={newSlot.slotType}
                  onChange={(e) => setNewSlot({ ...newSlot, slotType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="teleconsultation">Online Video Teleconsultation (HD)</option>
                  <option value="in_person">In-Person Hospital Clinical Visit</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-900/20 transition flex items-center justify-center gap-2"
              >
                {submitting && <Spinner size="sm" />}
                <span>Publish Slot to Live Directory</span>
              </button>
            </form>
          ) : (
            /* BULK SHIFT GENERATOR FORM */
            <form onSubmit={handleGenerateBulkSlots} className="space-y-4 text-xs">
              <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 text-slate-700 text-[11px] space-y-1">
                <div className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Batch Schedule Generator</span>
                </div>
                <p>
                  Quickly generate standard 30-minute consultation slots across consecutive days.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Starting From Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Number of Consecutive Days
                </label>
                <select
                  value={bulkDaysCount}
                  onChange={(e) => setBulkDaysCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="1">1 Day</option>
                  <option value="3">3 Days (e.g. Mon - Wed)</option>
                  <option value="5">5 Days (Full Week Mon - Fri)</option>
                  <option value="7">7 Days (Full Week Inc. Weekend)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shift Timing Preset
                </label>
                <select
                  value={shiftPreset}
                  onChange={(e) => setShiftPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="morning">Morning Shift (09:00 AM - 12:30 PM • 5 slots)</option>
                  <option value="afternoon">Afternoon Shift (02:00 PM - 05:30 PM • 5 slots)</option>
                  <option value="fullday">Standard Full Day (10:00 AM - 05:30 PM • 5 slots)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Mode
                </label>
                <select
                  value={bulkSlotType}
                  onChange={(e) => setBulkSlotType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="teleconsultation">Online Video Teleconsultation</option>
                  <option value="in_person">In-Person Hospital Visit</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-900/20 transition flex items-center justify-center gap-2"
              >
                {submitting && <Spinner size="sm" />}
                <Zap className="w-4 h-4" />
                <span>Generate & Publish Batch Slots</span>
              </button>
            </form>
          )}
        </div>

        {/* Right 2 Cols: Slot Inventory & Filters */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Active Slots Ledger</span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredSlots.length} available
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Patients globally can view and book these real-time slots
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="upcoming">Upcoming</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Only</option>
                <option value="booked">Booked Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Spinner size="lg" className="mx-auto text-teal-600" />
              <p className="text-xs text-slate-500 mt-2">Loading calendar slots...</p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No availability slots match the current filter.</p>
              <p className="text-slate-400 text-[11px]">Use the left panel to publish single or batch time slots.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSlots.map((slot) => (
                <div
                  key={slot._id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    slot.isBooked
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50/80 border-slate-200 hover:border-teal-400 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {slot.slotDate}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          slot.isBooked
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-teal-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-600" />
                      {slot.startTime} – {slot.endTime}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                      {slot.slotType === 'teleconsultation' ? (
                        <span className="flex items-center gap-1 text-blue-700 font-medium">
                          <Video className="w-3 h-3" /> Online Teleconsult
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Building2 className="w-3 h-3" /> In-Person Hospital
                        </span>
                      )}
                    </div>
                  </div>

                  {!slot.isBooked && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleDeleteSlot(slot._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-[11px] flex items-center gap-1"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
