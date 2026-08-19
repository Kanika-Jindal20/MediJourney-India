import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  Video,
  X,
} from 'lucide-react';

export const DoctorPatientCommunicator = ({ appointment, doctor, isOpen, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('pre_arrival');
  const [customNotes, setCustomNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !appointment) return null;

  const patientName = appointment.patientName || 'Valued Patient';
  const doctorName = doctor?.fullName || 'Senior Specialist Surgeon';
  const hospitalName = appointment.hospitalId?.name || 'Accredited Partner Hospital';
  const appointmentDate = appointment.appointmentDate || 'Scheduled Date';
  const appointmentRef = appointment.appointmentRef || 'REF-000';
  const rawPhone = appointment.patientPhone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const templates = {
    pre_arrival: {
      title: 'Pre-Arrival Consultation & Visa Confirmation',
      icon: ShieldCheck,
      badge: 'Visa & Admission',
      message: `Dear ${patientName},\n\nThis is Dr. ${doctorName} from ${hospitalName}, India.\n\nI have reviewed your medical files for case #${appointmentRef}. Your appointment is confirmed for ${appointmentDate}.\n\nYour Indian Medical Visa (MED) invitation letter and pre-hospital admission roadmap are prepared. Please let us know if you need airport pickup assistance.\n\nWarm regards,\nDr. ${doctorName}\n${hospitalName}, India`,
    },
    scans_needed: {
      title: 'Radiology / Diagnostic Records Request',
      icon: FileText,
      badge: 'Diagnostic Request',
      message: `Dear ${patientName},\n\nRegarding your consultation inquiry #${appointmentRef} with Dr. ${doctorName} at ${hospitalName}:\n\nTo ensure an accurate surgical assessment, please share recent high-resolution DICOM / MRI / CT scan reports and blood investigations prior to our call.\n\nYou can upload them directly in your MediJourney patient portal.\n\nBest regards,\nClinical Team for Dr. ${doctorName}`,
    },
    teleconsult_ready: {
      title: 'Encrypted Video Teleconsultation Ready',
      icon: Video,
      badge: 'Teleconsultation',
      message: `Dear ${patientName},\n\nYour HD Video Teleconsultation with Dr. ${doctorName} is scheduled for ${appointmentDate} at ${appointment.timeSlot || 'scheduled time'} IST.\n\nPlease join via the secure telehealth room:\nhttps://meet.medijourney.in/room/${appointmentRef}\n\nPlease keep your previous medical prescriptions handy.\n\nRegards,\nDr. ${doctorName}`,
    },
  };

  const currentTemplate = templates[selectedTemplate] || templates.pre_arrival;
  const fullMessage = customNotes
    ? `${currentTemplate.message}\n\nDoctor Remarks: ${customNotes}`
    : currentTemplate.message;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;
  const mailtoUrl = `mailto:${appointment.patientEmail || ''}?subject=${encodeURIComponent(
    `Medical Consultation #${appointmentRef} - Dr. ${doctorName}`
  )}&body=${encodeURIComponent(fullMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">International Patient Direct Outreach</h3>
              <p className="text-[11px] text-slate-400">
                Case #{appointmentRef} • {patientName} ({appointment.patientCountry})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Template Selector Pills */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Select Clinical Message Preset:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(templates).map(([key, tpl]) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-75">
                        {tpl.badge}
                      </span>
                    </div>
                    <span className="text-xs font-semibold leading-tight line-clamp-2">
                      {tpl.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">
                Formatted Message Dispatch Preview:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-teal-700 font-bold hover:text-teal-800 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              readOnly
              value={fullMessage}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-sans leading-relaxed focus:outline-none"
            />
          </div>

          {/* Add Surgeon Remark */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Add Surgeon Custom Addendum (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Please avoid solid food 6 hours prior to pre-op fasting tests..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Target: <strong>{appointment.patientPhone || 'No phone'}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <a
              href={mailtoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Mail className="w-3.5 h-3.5 text-slate-700" />
              <span>Send via Email</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch WhatsApp Chat</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
