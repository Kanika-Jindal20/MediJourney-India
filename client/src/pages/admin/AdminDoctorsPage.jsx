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
  Edit,
  Building2,
  ArrowLeft,
  Star,
  Award,
  Search,
  CheckCircle2,
  DollarSign,
  Globe,
} from 'lucide-react';

export const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  const initialFormState = {
    fullName: '',
    hospitalId: '',
    specialty: 'Cardiology & Heart Surgery',
    qualifications: 'MBBS, MS, MCh, Fellowship (USA)',
    experienceYears: 15,
    consultationFeeUSD: 50,
    surgeriesCount: 5000,
    languagesSpoken: 'English, Hindi',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  };

  const [formData, setFormData] = useState(initialFormState);
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

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      hospitalId: hospitals[0]?._id || '',
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoctorId(doc._id);
    setFormData({
      fullName: doc.fullName || '',
      hospitalId: doc.hospitalId?._id || hospitals[0]?._id || '',
      specialty: doc.specialty || '',
      qualifications: doc.qualifications || '',
      experienceYears: doc.experienceYears || 10,
      consultationFeeUSD: doc.consultationFeeUSD || 40,
      surgeriesCount: doc.surgeriesCount || 1000,
      languagesSpoken: Array.isArray(doc.languagesSpoken) ? doc.languagesSpoken.join(', ') : doc.languagesSpoken || 'English',
      bio: doc.bio || '',
      avatarUrl: doc.avatarUrl || '',
    });
    setEditModalOpen(true);
  };

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
      setSuccess('Doctor onboarded successfully into master directory.');
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to onboard doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        languagesSpoken: formData.languagesSpoken.split(',').map((s) => s.trim()),
      };
      await doctorService.updateDoctor(editingDoctorId, payload);
      setSuccess('Doctor credentials & consultation profile updated.');
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      !searchTerm ||
      doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospitalId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

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
          onClick={handleOpenCreate}
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
          Verify surgeon credentials, assign hospital affiliations, manage surgical counts, and update international teleconsultation fees.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search doctors by name, specialty, hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Specialty:</span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
          >
            <option value="All">All Specialties ({doctors.length})</option>
            <option value="Cardiology">Cardiology & Heart</option>
            <option value="Orthopedics">Orthopedics & Joints</option>
            <option value="Cosmetic">Cosmetic & Plastic</option>
            <option value="Hair">Hair Restoration</option>
            <option value="Dental">Dental Treatments</option>
            <option value="Fertility">Fertility & IVF</option>
            <option value="Oncology">Oncology & Cancer</option>
          </select>
        </div>
      </div>

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
                  <th className="py-3.5 px-4">Doctor & Credentials</th>
                  <th className="py-3.5 px-4">Affiliated Facility</th>
                  <th className="py-3.5 px-4">Clinical Experience</th>
                  <th className="py-3.5 px-4">Consultation Fee</th>
                  <th className="py-3.5 px-4">Languages</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
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
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {doc.qualifications}
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

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{doc.experienceYears} Years Experience</div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {doc.surgeriesCount?.toLocaleString() || '1,000'}+ Procedures
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ${doc.consultationFeeUSD} USD
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      {Array.isArray(doc.languagesSpoken) ? doc.languagesSpoken.join(', ') : doc.languagesSpoken}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Doctor Credentials"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard / Edit Doctor Modal */}
      {(createModalOpen || editModalOpen) && (
        <Modal
          isOpen={createModalOpen || editModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setEditModalOpen(false);
          }}
          title={createModalOpen ? 'Onboard Medical Specialist' : `Edit Doctor: ${formData.fullName}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name & Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Naresh Trehan"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  {hospitals.map((hosp) => (
                    <option key={hosp._id} value={hosp._id}>
                      {hosp.name} ({hosp.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Specialty *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology & Heart Surgery"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experience (Years) *</label>
                <input
                  type="number"
                  required
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Surgeries Count</label>
                <input
                  type="number"
                  value={formData.surgeriesCount}
                  onChange={(e) => setFormData({ ...formData, surgeriesCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consult Fee (USD) *</label>
                <input
                  type="number"
                  required
                  value={formData.consultationFeeUSD}
                  onChange={(e) => setFormData({ ...formData, consultationFeeUSD: Number(e.target.value) })}
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
                  placeholder="MBBS, MS, MCh, Diplomate American Board"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={formData.languagesSpoken}
                  onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
                  placeholder="English, Arabic, Russian, Hindi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Surgeon Biography & Accomplishments *</label>
              <textarea
                rows={3}
                required
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Career milestones, surgical achievements, fellowship training..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                {submitting ? 'Saving...' : createModalOpen ? 'Onboard Doctor' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

