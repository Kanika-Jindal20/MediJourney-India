import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { treatmentService } from '../../services/treatmentService';
import { Modal } from '../../components/common/Modal';
import { Spinner, Alert } from '../../components/common/Alert';
import {
  Activity,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  DollarSign,
  TrendingDown,
  Clock,
  Search,
} from 'lucide-react';

export const AdminTreatmentsPage = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);

  const initialFormState = {
    name: '',
    category: 'Cosmetic & Plastic Surgery',
    shortSummary: '',
    description: '',
    avgStayDays: 3,
    avgRecoveryDays: 7,
    costIndiaUSD: 2000,
    costUSAUSD: 12000,
    costUKUSD: 8500,
    costThailandUSD: 4000,
    costUAEUSD: 7500,
    heroImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
    isPopular: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const loadTreatments = async () => {
    setLoading(true);
    try {
      const res = await treatmentService.getTreatments();
      setTreatments(res.treatments || []);
    } catch (e) {
      setError(e.message || 'Failed to load treatments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTreatmentId(t._id);
    setFormData({
      name: t.name || '',
      category: t.category || 'Cosmetic & Plastic Surgery',
      shortSummary: t.shortSummary || '',
      description: t.description || '',
      avgStayDays: t.avgStayDays || 3,
      avgRecoveryDays: t.avgRecoveryDays || 7,
      costIndiaUSD: t.costIndiaUSD || 2000,
      costUSAUSD: t.costUSAUSD || 12000,
      costUKUSD: t.costUKUSD || 8500,
      costThailandUSD: t.costThailandUSD || 4000,
      costUAEUSD: t.costUAEUSD || 7500,
      heroImage: t.heroImage || '',
      isPopular: t.isPopular || false,
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await treatmentService.createTreatment(formData);
      setSuccess('Medical procedure added to global catalog.');
      setCreateModalOpen(false);
      loadTreatments();
    } catch (err) {
      setError(err.message || 'Failed to create procedure');
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
      await treatmentService.updateTreatment(editingTreatmentId, formData);
      setSuccess('Treatment pricing & stay parameters updated.');
      setEditModalOpen(false);
      loadTreatments();
    } catch (err) {
      setError(err.message || 'Failed to update treatment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from global catalog?`)) return;
    setError('');
    setSuccess('');
    try {
      await treatmentService.deleteTreatment(id);
      setSuccess('Treatment removed.');
      loadTreatments();
    } catch (err) {
      setError(err.message || 'Failed to delete treatment');
    }
  };

  const filteredTreatments = treatments.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || t.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
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
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medical Treatment</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Procedures & Global Price Benchmark Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain procedural descriptions, inpatient stay guidelines, and comparative cost benchmarks vs US/UK/UAE.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search procedures by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-slate-800"
          >
            <option value="All">All Categories ({treatments.length})</option>
            <option value="Cosmetic & Plastic Surgery">Cosmetic & Plastic</option>
            <option value="Dental Treatments">Dental Treatments</option>
            <option value="Fertility & IVF Care">Fertility & IVF Care</option>
            <option value="Hair Restoration">Hair Restoration</option>
            <option value="Cardiology & Heart Surgery">Cardiology & Heart Surgery</option>
            <option value="Orthopedics & Joint Replacement">Orthopedics & Joints</option>
            <option value="Oncology & Cancer Care">Oncology & Cancer Care</option>
            <option value="Ayurveda & Wellness">Ayurveda & Wellness</option>
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
                  <th className="py-3.5 px-4">Procedure Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Stay & Recovery</th>
                  <th className="py-3.5 px-4">India Package</th>
                  <th className="py-3.5 px-4">USA Benchmark</th>
                  <th className="py-3.5 px-4">Savings %</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTreatments.map((t) => {
                  const savings = Math.round(((t.costUSAUSD - t.costIndiaUSD) / t.costUSAUSD) * 100);
                  return (
                    <tr key={t._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link to={`/treatments/${t.slug}`} className="hover:text-purple-600">
                          {t.name}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-purple-50 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-100">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {t.avgStayDays}d stay • {t.avgRecoveryDays}d recovery
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-teal-700 text-sm">
                        ${t.costIndiaUSD?.toLocaleString()} USD
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 line-through">
                        ${t.costUSAUSD?.toLocaleString()} USD
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ~{savings}% Lower
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                            title="Edit Procedure"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id, t.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Treatment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Treatment Modal */}
      {(createModalOpen || editModalOpen) && (
        <Modal
          isOpen={createModalOpen || editModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setEditModalOpen(false);
          }}
          title={createModalOpen ? 'Add Medical Procedure & Cost Matrix' : `Edit Procedure: ${formData.name}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Procedure Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Robotic Hip Replacement"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
              >
                <option value="Cosmetic & Plastic Surgery">Cosmetic & Plastic Surgery</option>
                <option value="Dental Treatments">Dental Treatments</option>
                <option value="Fertility & IVF Care">Fertility & IVF Care</option>
                <option value="Hair Restoration">Hair Restoration</option>
                <option value="Cardiology & Heart Surgery">Cardiology & Heart Surgery</option>
                <option value="Orthopedics & Joint Replacement">Orthopedics & Joint Replacement</option>
                <option value="Oncology & Cancer Care">Oncology & Cancer Care</option>
                <option value="Ayurveda & Wellness">Ayurveda & Wellness</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inpatient Stay (Days)</label>
                <input
                  type="number"
                  value={formData.avgStayDays}
                  onChange={(e) => setFormData({ ...formData, avgStayDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hotel Recovery (Days)</label>
                <input
                  type="number"
                  value={formData.avgRecoveryDays}
                  onChange={(e) => setFormData({ ...formData, avgRecoveryDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">India Cost (USD) *</label>
                <input
                  type="number"
                  required
                  value={formData.costIndiaUSD}
                  onChange={(e) => setFormData({ ...formData, costIndiaUSD: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">USA Cost (USD) *</label>
                <input
                  type="number"
                  required
                  value={formData.costUSAUSD}
                  onChange={(e) => setFormData({ ...formData, costUSAUSD: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UK Cost (USD) *</label>
                <input
                  type="number"
                  required
                  value={formData.costUKUSD}
                  onChange={(e) => setFormData({ ...formData, costUKUSD: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Surgical overview, technological devices used, post-op recovery..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                {submitting ? 'Saving...' : createModalOpen ? 'Add Procedure' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

