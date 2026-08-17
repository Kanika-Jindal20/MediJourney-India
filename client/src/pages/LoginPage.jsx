import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/common/Alert';
import { Activity, Lock, Mail, UserCheck, ShieldAlert, Stethoscope } from 'lucide-react';

export const LoginPage = ({ defaultRole = 'patient' }) => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      await switchDemoRole(role);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Sign In to MediJourney
          </h2>
          <p className="text-xs text-slate-500">
            Access your appointments, consultations & clinical records
          </p>
        </div>

        {/* Quick Demo One-Click Logins for Hackathon Evaluators */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
          <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
            <span>Evaluation Quick Logins</span>
            <span className="bg-teal-500/20 px-2 py-0.5 rounded text-[9px]">Demo Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('patient')}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-center border border-slate-700 transition"
            >
              <UserCheck className="w-4 h-4 text-teal-400 mx-auto mb-1" />
              <div className="font-bold text-[11px]">Patient</div>
              <div className="text-[9px] text-slate-400">Sarah (UK)</div>
            </button>

            <button
              onClick={() => handleQuickDemo('doctor')}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-center border border-slate-700 transition"
            >
              <Stethoscope className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="font-bold text-[11px]">Doctor</div>
              <div className="text-[9px] text-slate-400">Dr. Trehan</div>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-center border border-slate-700 transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-[11px]">Admin</div>
              <div className="text-[9px] text-slate-400">Full System</div>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
          {error && <Alert type="error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Spinner size="sm" />}
              <span>Sign In</span>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-700 hover:underline">
              Create Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
