import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { hospitalService } from '../../services/hospitalService';
import { Modal } from '../../components/common/Modal';
import { Spinner, Alert } from '../../components/common/Alert';
import {
  Stethoscope,
  Plus,
  Trash2,
  Building2,
  ArrowLeft,
  Star,
  Award,
} from 'lucide-react';

export const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    hospitalId: '',
    specialty: 'Cardiology & Heart Surgery',
    qualifications: 'MBBS, MS, MCh, Fellowship (USA)',
    experienceYears: 15,
    consultationFeeUSD: 50,
    languagesSpoken: 'English, Hindi',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, hospRes] = await Promise.all([
        doctorService.getDoctors(),
        hospitalService.getHospitals(),
      ]);
      setDoctors(docRes.doctors || []);
      setHospitals(hospRes.hospitals || []);
      if (hospRes.hospitals?.length > 0 && !formData.hospitalId) {
        setFormData((prev) => ({ ...prev, hospitalId: hospRes.hospitals[0]._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        languagesSpoken: formData.languagesSpoken.split(',').map((s) => s.trim()),
      };
      await doctorService.createDoctor(payload);
      setSuccess('Doctor onboarded successfully.');
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to onboard doctor');
    } finally {
      setSubmitting(false);
    }
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
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Specialist Doctor</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Medical Specialist Master Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify surgeon credentials, assign hospital affiliations, and manage international consultation fees.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <Spinner size="lg" className="mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Doctor & Specialty</th>
                  <th className="py-3.5 px-4">Affiliated Hospital</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Consultation Fee</th>
                  <th className="py-3.5 px-4">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            <Link to={`/doctors/${doc._id}`} className="hover:text-blue-600">
                              {doc.fullName}
                            </Link>
                          </div>
                          <div className="text-teal-700 text-[11px] font-semibold">
                            {doc.specialty}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {doc.hospitalId?.name || 'Accredited Facility'}
                      </div>
                      <div className="text-slate-400 text-[10px]">{doc.hospitalId?.city}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold">
                      {doc.experienceYears} Years ({doc.surgeriesCount?.toLocaleString()}+ Surgeries)
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${doc.consultationFeeUSD} USD
                    </td>

                    <td className="py-3.5 px-4 font-bold text-amber-600">
                      ★ {doc.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Doctor Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Onboard Medical Specialist"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rajesh Kumar"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affiliated Hospital *</label>
              <select
                required
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {hospitals.map((hosp) => (
                  <option key={hosp._id} value={hosp._id}>
                    {hosp.name} ({hosp.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specialty *</label>
              <input
                type="text"
                required
                placeholder="e.g. Surgical Oncology"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualifications *</label>
              <input
                type="text"
                required
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="MBBS, MS, MCh (Plastic Surgery)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consultation Fee (USD) *</label>
              <input
                type="number"
                required
                value={formData.consultationFeeUSD}
                onChange={(e) => setFormData({ ...formData, consultationFeeUSD: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Biography & Credentials *</label>
            <textarea
              rows={3}
              required
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Career background, surgical accomplishments, fellowship training..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              {submitting ? 'Saving...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
