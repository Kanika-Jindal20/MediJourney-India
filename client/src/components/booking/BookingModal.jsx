import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { hospitalService } from '../../services/hospitalService';
import { Modal } from '../common/Modal';
import { Alert, Spinner } from '../common/Alert';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  FileText,
  Building2,
  Stethoscope,
  Plane,
  ShieldCheck,
  Globe,
  User,
  Phone,
  Mail,
} from 'lucide-react';

export const BookingModal = ({
  isOpen,
  onClose,
  preselectedDoctor = null,
  preselectedHospital = null,
  preselectedTreatment = null,
  onSuccess = () => {},
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submittedAppt, setSubmittedAppt] = useState(null);
  const [error, setError] = useState('');

  // Form states
  const [doctorsList, setDoctorsList] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    patientName: user?.fullName || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    patientCountry: user?.country || 'United States',
    passportNumber: user?.passportNumber || '',
    doctorId: preselectedDoctor?._id || '',
    hospitalId: preselectedHospital?._id || preselectedDoctor?.hospitalId?._id || preselectedDoctor?.hospitalId || '',
    treatmentId: preselectedTreatment?._id || '',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '11:30 AM',
    slotId: '',
    consultationType: 'teleconsultation',
    symptomsDescription: '',
    preferredLanguage: 'English',
    visaAssistanceRequired: true,
    airportPickupRequired: true,
  });

  const [files, setFiles] = useState([]);

  // Load hospitals & doctors if not provided
  useEffect(() => {
    if (isOpen) {
      setSubmittedAppt(null);
      setError('');
      if (user) {
        setFormData((prev) => ({
          ...prev,
          patientName: user.fullName || prev.patientName,
          patientEmail: user.email || prev.patientEmail,
          patientCountry: user.country || prev.patientCountry,
          patientPhone: user.phone || prev.patientPhone,
        }));
      }

      const fetchData = async () => {
        try {
          const [docRes, hospRes] = await Promise.all([
            doctorService.getDoctors(),
            hospitalService.getHospitals(),
          ]);
          setDoctorsList(docRes.doctors || []);
          setHospitalsList(hospRes.hospitals || []);

          // Set defaults if not preselected
          if (!formData.doctorId && docRes.doctors?.length > 0) {
            const firstDoc = docRes.doctors[0];
            setFormData((prev) => ({
              ...prev,
              doctorId: firstDoc._id,
              hospitalId: firstDoc.hospitalId?._id || firstDoc.hospitalId || hospRes.hospitals[0]?._id,
            }));
          }
        } catch (e) {
          console.error('Error loading doctors/hospitals for booking modal:', e);
        }
      };

      fetchData();
    }
  }, [isOpen, user]);

  // Load doctor slots when doctor or date changes
  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await doctorService.getDoctorSlots(
            formData.doctorId,
            formData.appointmentDate
          );
          setAvailableSlots(res.slots || []);
          if (res.slots?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              timeSlot: res.slots[0].startTime,
              slotId: res.slots[0]._id,
            }));
          }
        } catch (e) {
          console.error('Error loading slots:', e);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const handleDoctorChange = (docId) => {
    const selected = doctorsList.find((d) => d._id === docId);
    setFormData((prev) => ({
      ...prev,
      doctorId: docId,
      hospitalId: selected?.hospitalId?._id || selected?.hospitalId || prev.hospitalId,
    }));
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(uploadedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patientName || !formData.patientEmail || !formData.patientPhone || !formData.symptomsDescription) {
      setError('Please fill in all required fields (Name, Email, WhatsApp Phone, and Medical Description).');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      files.forEach((file) => {
        payload.append('medicalReports', file);
      });

      const res = await appointmentService.createAppointment(payload);

      setSubmittedAppt(res.appointment);
      onSuccess(res.appointment);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setError(err.message || 'Failed to submit consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        submittedAppt
          ? 'Consultation Request Confirmed'
          : 'Request Specialist Consultation & Treatment Plan'
      }
      maxWidth="max-w-3xl"
    >
      {submittedAppt ? (
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-2xl font-bold text-slate-900 font-display">
              Request Received Successfully!
            </h4>
            <p className="text-slate-600 text-sm mt-1">
              Your inquiry has been routed to the hospital’s International Patient Coordination Team.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Booking Reference
              </span>
              <span className="font-mono text-base font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                {submittedAppt.appointmentRef}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name</span>
                <span className="font-semibold text-slate-800">{submittedAppt.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Country</span>
                <span className="font-semibold text-slate-800">{submittedAppt.patientCountry}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Specialist</span>
                <span className="font-semibold text-slate-800">
                  {submittedAppt.doctorId?.fullName || 'Specialist Doctor'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Hospital</span>
                <span className="font-semibold text-slate-800">
                  {submittedAppt.hospitalId?.name || 'Accredited Hospital'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Appointment Date</span>
                <span className="font-semibold text-slate-800">
                  {submittedAppt.appointmentDate} at {submittedAppt.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Consultation Mode</span>
                <span className="font-semibold capitalize text-teal-700">
                  {submittedAppt.consultationType}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Checklist */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 text-left text-xs space-y-2 text-teal-900">
            <div className="font-bold flex items-center gap-1.5 text-teal-950">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              What Happens Next?
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Doctor will review your medical description and uploaded records within 24 hours.</li>
              <li>You will receive a confirmation email along with an official Hospital Invitation Letter for your Indian e-Medical Visa.</li>
              <li>Our dedicated desk will contact you via WhatsApp (+{formData.patientPhone}) to coordinate teleconsultation connection links.</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm shadow-md transition"
            >
              Done & Return to Platform
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error" message={error} />}

          {/* Section 1: Doctor & Hospital Choice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                Select Specialist Doctor *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {doctorsList.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fullName} ({doc.specialty}) - ${doc.consultationFeeUSD}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Healthcare Institution *
              </label>
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {hospitalsList.map((hosp) => (
                  <option key={hosp._id} value={hosp._id}>
                    {hosp.name} ({hosp.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Date & Time Slot Picker */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Select Preferred Date & Consultation Slot
              </span>
              <div className="flex gap-2 text-xs">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="consultationType"
                    value="teleconsultation"
                    checked={formData.consultationType === 'teleconsultation'}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="text-teal-600"
                  />
                  <span>Online Video Teleconsult</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="consultationType"
                    value="in_person"
                    checked={formData.consultationType === 'in_person'}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="text-teal-600"
                  />
                  <span>In-Person Hospital Visit</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Available Slots {loadingSlots && <Spinner size="sm" className="inline ml-1" />}
                </label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot._id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            timeSlot: slot.startTime,
                            slotId: slot._id,
                          })
                        }
                        className={`py-1.5 px-2 text-[11px] rounded-md font-semibold border transition ${
                          formData.timeSlot === slot.startTime
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                    No predefined slots. Doctor will confirm closest time on this date.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Patient Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-teal-600" /> Patient Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-teal-600" /> Email Address *
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.patientEmail}
                onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-teal-600" /> WhatsApp / Phone *
              </label>
              <input
                type="text"
                placeholder="+1 234 567 8900"
                value={formData.patientPhone}
                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-teal-600" /> Country of Residence *
              </label>
              <input
                type="text"
                placeholder="United States, UK, UAE, etc."
                value={formData.patientCountry}
                onChange={(e) => setFormData({ ...formData, patientCountry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Preferred Language for Translation
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="Russian">Russian (Русский)</option>
                <option value="French">French (Français)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Uzbek">Uzbek</option>
              </select>
            </div>
          </div>

          {/* Section 4: Clinical Needs & Document Upload */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Describe Medical Condition / Desired Procedure *
            </label>
            <textarea
              rows={3}
              placeholder="Please provide details about your diagnosis, symptoms, duration, previous surgeries, or specific questions for the doctor..."
              value={formData.symptomsDescription}
              onChange={(e) => setFormData({ ...formData, symptomsDescription: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* File Upload for Medical Scans */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              Upload Medical Reports / X-Rays / MRI Scans (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-xl p-3 text-center transition bg-slate-50/50">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-booking"
              />
              <label
                htmlFor="file-upload-booking"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <FileText className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-semibold text-teal-700">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : 'Click to browse files (PDF, JPG, PNG, DOCX)'}
                </span>
                <span className="text-[10px] text-slate-400">Max size 10MB per file</span>
              </label>
            </div>
          </div>

          {/* Section 5: Medical Tourism Assistance Add-ons */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-2">
            <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-amber-700" />
              Complimentary Medical Travel Logistics Assistance:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.visaAssistanceRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, visaAssistanceRequired: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Generate Official e-Medical Visa Invitation Letter</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.airportPickupRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, airportPickupRequired: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Request Airport Transfer & Dedicated Translator</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading && <Spinner size="sm" />}
              <span>Submit Consultation Request</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
