import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const DoctorAvailabilityPage = () => {
  const { user } = useAuth();

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form for creating new slot
  const [newSlot, setNewSlot] = useState({
    slotDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    slotType: 'teleconsultation',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await doctorService.getDoctors();
        setDoctorsList(res.doctors || []);
        if (res.doctors?.length > 0) {
          setSelectedDoctorId(res.doctors[0]._id);
        }
      } catch (e) {
        setError('Failed to fetch doctor accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const loadSlots = async (docId = selectedDoctorId) => {
    if (!docId) return;
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getDoctorSlots(docId);
      setSlots(res.slots || []);
    } catch (e) {
      setError(e.message || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId) {
      loadSlots(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await doctorService.createSlot(selectedDoctorId, newSlot);
      setSuccess('Availability slot published successfully.');
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to create slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this available slot?')) return;
    setError('');
    setSuccess('');
    try {
      await doctorService.deleteSlot(slotId);
      setSuccess('Slot removed.');
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to remove slot');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctor Workspace
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-3 py-1 rounded-full text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-400" />
            Time Slot Scheduler
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Doctor Availability & Slot Management
          </h1>
          <p className="text-slate-400 text-xs">
            Open up time slots for international video teleconsultations or in-person hospital visits.
          </p>
        </div>

        {/* Doctor Selector */}
        {doctorsList.length > 1 && (
          <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 text-xs">
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">
              Active Specialist Profile
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            >
              {doctorsList.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.fullName} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Main Grid: Add Slot Form vs Current Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Add New Slot */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600" /> Add Available Slot
          </h2>

          <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
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
                <option value="teleconsultation">Online Video Teleconsultation</option>
                <option value="in_person">In-Person Hospital Visit</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" />}
              <span>Publish Slot to Calendar</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Slot Grid */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Active Open Slots ({slots.length})
              </h2>
              <p className="text-xs text-slate-500">
                Patients worldwide can book these real-time slots
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Spinner size="lg" className="mx-auto" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No slots published. Add your available hours on the left form.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                    slot.isBooked
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900">{slot.slotDate}</div>
                    <div className="text-[11px] text-teal-700 font-semibold">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        slot.isBooked
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {slot.isBooked ? 'Booked' : slot.slotType}
                    </span>
                  </div>

                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
