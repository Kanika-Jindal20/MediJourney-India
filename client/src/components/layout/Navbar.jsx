import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Building2,
  Stethoscope,
  Activity,
  Globe,
  Plane,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronDown,
  CalendarCheck,
  LayoutDashboard,
  Layers,
} from 'lucide-react';

const Navbar = ({ onOpenAI }) => {
  const { user, logout, switchDemoRole, isDoctor, isAdmin, isPatient } = useAuth();
  const { currency, setCurrency, exchangeRates } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Notification Bar for Hackathon / Demonstration */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-teal-500/30">
              SIH 2026 Edition
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Integrated Digital Platform for International Patients Seeking Medical Care in India
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Demo Role Switcher Dropdown for Evaluation */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-0.5 rounded text-xs transition border border-slate-700 font-medium"
              >
                <span>Demo Role Switcher</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-800 py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    Switch Test Account
                  </div>
                  <button
                    onClick={async () => {
                      await switchDemoRole('patient');
                      setDemoDropdownOpen(false);
                      navigate('/patient/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-teal-950 hover:text-teal-300 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    <div>
                      <div className="font-semibold">Sarah Jenkins (Patient)</div>
                      <div className="text-[10px] text-slate-400">UK Resident • Hair & Dental</div>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      await switchDemoRole('doctor');
                      setDemoDropdownOpen(false);
                      navigate('/doctor/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-teal-950 hover:text-teal-300 flex items-center gap-2"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <div className="font-semibold">Dr. Naresh Trehan (Doctor)</div>
                      <div className="text-[10px] text-slate-400">Medanta Chief Surgeon</div>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      await switchDemoRole('admin');
                      setDemoDropdownOpen(false);
                      navigate('/admin/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-teal-950 hover:text-teal-300 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="font-semibold">Platform Administrator</div>
                      <div className="text-[10px] text-slate-400">Full System Control</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 text-xs">
              <Globe className="w-3 h-3 text-slate-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-800 text-white rounded px-1.5 py-0.5 text-xs border border-slate-700 focus:outline-none focus:border-teal-400"
              >
                {Object.keys(exchangeRates).map((currKey) => (
                  <option key={currKey} value={currKey}>
                    {currKey}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-extrabold text-xl leading-none text-slate-900 tracking-tight flex items-center gap-1">
                Medi<span className="text-teal-600">Journey</span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 ml-1">
                  India
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Global Healthcare Gateway
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/hospitals"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/hospitals')
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Hospitals & Clinics
            </Link>

            <Link
              to="/doctors"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/doctors')
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Specialists
            </Link>

            <Link
              to="/treatments"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/treatments')
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              Treatments & Costs
            </Link>

            <Link
              to="/compare"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/compare')
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Compare
            </Link>

            <Link
              to="/travel-guide"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/travel-guide')
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Plane className="w-4 h-4" />
              Visa & Travel
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition shadow-xs group"
            >
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse group-hover:rotate-12 transition-transform" />
              <span>AI Medical Guide</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            </button>

            {/* Role Dashboards / Auth Links */}
            {user ? (
              <div className="flex items-center gap-2">
                {isPatient && (
                  <Link
                    to="/patient/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition"
                  >
                    <CalendarCheck className="w-4 h-4 text-teal-600" />
                    My Appointments
                  </Link>
                )}

                {isDoctor && (
                  <Link
                    to="/doctor/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    Doctor Portal
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Hospitals & Clinics
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Specialists & Doctors
          </Link>
          <Link
            to="/treatments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Treatments & Costs
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Compare Procedures
          </Link>
          <Link
            to="/travel-guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Medical Visa & Travel
          </Link>
          
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAI();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-800 rounded-xl font-semibold text-sm border border-teal-200"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              Launch AI Medical Guide
            </button>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2 text-rose-600 font-medium text-sm"
              >
                Log Out ({user.fullName})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-slate-100 rounded-lg text-slate-800 font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-teal-600 text-white rounded-lg font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
