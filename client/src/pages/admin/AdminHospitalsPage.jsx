import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { Modal } from '../../components/common/Modal';
import { Spinner, Alert } from '../../components/common/Alert';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Search,
  Star,
  MapPin,
  ShieldCheck,
  Plane,
  Bed,
  CheckCircle2,
} from 'lucide-react';

export const AdminHospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState(null);

  const initialFormState = {
    name: '',
    city: 'Delhi NCR',
    state: 'Delhi',
    address: '',
    airportDistanceKm: 15,
    airportName: 'Indira Gandhi International Airport (DEL)',
    accreditations: 'JCI, NABH, NABL',
    specialties: 'Cardiology & Heart Surgery, Orthopedics & Joint Replacement, Oncology & Cancer Care',
    description: '',
    heroImage: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
    bedsCount: 650,
    rating: 4.9,
    isFeatured: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalService.getHospitals();
      setHospitals(res.hospitals || []);
    } catch (e) {
      setError(e.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (hosp) => {
    setEditingHospitalId(hosp._id);
    setFormData({
      name: hosp.name || '',
      city: hosp.city || 'Delhi NCR',
      state: hosp.state || '',
      address: hosp.address || '',
      airportDistanceKm: hosp.airportDistanceKm || 15,
      airportName: hosp.airportName || '',
      accreditations: Array.isArray(hosp.accreditations) ? hosp.accreditations.join(', ') : hosp.accreditations || '',
      specialties: Array.isArray(hosp.specialties) ? hosp.specialties.join(', ') : hosp.specialties || '',
      description: hosp.description || '',
      heroImage: hosp.heroImage || '',
      bedsCount: hosp.bedsCount || 500,
      rating: hosp.rating || 4.8,
      isFeatured: hosp.isFeatured || false,
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await hospitalService.createHospital(formData);
      setSuccess('Healthcare institution onboarded successfully.');
      setCreateModalOpen(false);
      loadHospitals();
    } catch (err) {
      setError(err.message || 'Failed to create hospital');
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
        accreditations: formData.accreditations.split(',').map((s) => s.trim()),
        specialties: formData.specialties.split(',').map((s) => s.trim()),
      };
      await hospitalService.updateHospital(editingHospitalId, payload);
      setSuccess('Hospital facility details updated successfully.');
      setEditModalOpen(false);
      loadHospitals();
    } catch (err) {
      setError(err.message || 'Failed to update hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the network?`)) return;
    setError('');
    setSuccess('');
    try {
      await hospitalService.deleteHospital(id);
      setSuccess(`"${name}" removed from platform catalog.`);
      loadHospitals();
    } catch (err) {
      setError(err.message || 'Failed to delete hospital');
    }
  };

  // Filter hospitals based on search & city
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      !searchTerm ||
      h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.specialties?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = selectedCity === 'All' || h.city?.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Hospital</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Accredited Healthcare Providers Manager
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage partner hospital chains, clinic networks, JCI/NABH accreditations, airport proximity, and bed capacities.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search hospitals by name, city, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">City Hub:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-slate-800"
          >
            <option value="All">All Cities ({hospitals.length})</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kochi">Kochi</option>
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
                  <th className="py-3.5 px-4">Hospital Name & Proximity</th>
                  <th className="py-3.5 px-4">Accreditations</th>
                  <th className="py-3.5 px-4">Clinical Specialties</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHospitals.map((hosp) => (
                  <tr key={hosp._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        <Link to={`/hospitals/${hosp.slug}`} className="hover:text-teal-600">
                          {hosp.name}
                        </Link>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{hosp.city}, {hosp.state}</span>
                        <span className="text-slate-300">•</span>
                        <Plane className="w-3 h-3 text-teal-600" />
                        <span>{hosp.airportDistanceKm} km to {hosp.airportName?.split(' ')[0]}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {hosp.accreditations?.map((acc, i) => (
                          <span
                            key={i}
                            className="bg-amber-50 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200"
                          >
                            {acc}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px]">
                      {hosp.specialties?.join(', ')}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        {hosp.bedsCount || 500} Beds
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-amber-600">
                      ★ {hosp.rating}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(hosp)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          title="Edit Facility"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hosp._id, hosp.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Hospital"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard / Edit Hospital Modal */}
      {(createModalOpen || editModalOpen) && (
        <Modal
          isOpen={createModalOpen || editModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setEditModalOpen(false);
          }}
          title={createModalOpen ? 'Onboard Accredited Healthcare Facility' : `Edit Facility: ${formData.name}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Max Super Speciality Hospital"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Airport Distance (KM)</label>
                <input
                  type="number"
                  value={formData.airportDistanceKm}
                  onChange={(e) => setFormData({ ...formData, airportDistanceKm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Bed Capacity</label>
                <input
                  type="number"
                  value={formData.bedsCount}
                  onChange={(e) => setFormData({ ...formData, bedsCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Physical Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 1, 2, Press Enclave Marg, Saket, New Delhi 110017"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Accreditations (comma separated)</label>
                <input
                  type="text"
                  value={formData.accreditations}
                  onChange={(e) => setFormData({ ...formData, accreditations: e.target.value })}
                  placeholder="JCI, NABH, NABL, ISO"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Cardiology, Oncology, Orthopedics, Dental"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Robotic operating theaters, international patient lounge, translators..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                {submitting ? 'Saving...' : createModalOpen ? 'Onboard Facility' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

