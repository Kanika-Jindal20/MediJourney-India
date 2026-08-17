import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, Globe2, PhoneCall, Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-slate-800">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white">JCI & NABH Accredited</div>
              <div className="text-xs text-slate-400">Strict clinical standards & zero wait-time</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white">70-90% Cost Savings</div>
              <div className="text-xs text-slate-400">Compared to USA, UK & European hospital quotes</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white">End-to-End Travel Care</div>
              <div className="text-xs text-slate-400">e-Medical visa letters & airport pickup</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white">24/7 International Desk</div>
              <div className="text-xs text-slate-400">Multilingual coordinators & WhatsApp hotline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Medi<span className="text-teal-400">Journey</span> India
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            India’s dedicated digital gateway for global medical tourists. Connecting international patients to JCI/NABH accredited hospitals, distinguished surgeons, transparent cost estimates, and seamless travel logistics.
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Ministry of Tourism & Heal In India Initiative Hub, New Delhi</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>International Hotline: +91 11 2309 2026 (24x7)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>support@medijourney.in</span>
            </div>
          </div>
        </div>

        {/* Popular Treatments */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
            Top Procedures
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/treatments/all-on-4-dental-implants" className="hover:text-white transition">
                All-on-4 Dental Implants
              </Link>
            </li>
            <li>
              <Link to="/treatments/hair-transplant-fue-dht" className="hover:text-white transition">
                DHT & FUE Hair Transplant
              </Link>
            </li>
            <li>
              <Link to="/treatments/ivf-icsi-fertility-treatment" className="hover:text-white transition">
                IVF & ICSI Fertility Cycle
              </Link>
            </li>
            <li>
              <Link to="/treatments/robotic-total-knee-replacement" className="hover:text-white transition">
                Robotic Knee Replacement
              </Link>
            </li>
            <li>
              <Link to="/treatments/cabg-coronary-artery-bypass" className="hover:text-white transition">
                Coronary Bypass (CABG)
              </Link>
            </li>
            <li>
              <Link to="/treatments/rhinoplasty-facial-surgery" className="hover:text-white transition">
                Cosmetic Rhinoplasty
              </Link>
            </li>
          </ul>
        </div>

        {/* Healthcare Hubs */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
            Medical Hubs
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/hospitals?city=Delhi%20NCR" className="hover:text-white transition">
                Delhi NCR & Gurugram
              </Link>
            </li>
            <li>
              <Link to="/hospitals?city=Mumbai" className="hover:text-white transition">
                Mumbai (Maharashtra)
              </Link>
            </li>
            <li>
              <Link to="/hospitals?city=Chennai" className="hover:text-white transition">
                Chennai (Tamil Nadu)
              </Link>
            </li>
            <li>
              <Link to="/hospitals?city=Bengaluru" className="hover:text-white transition">
                Bengaluru (Karnataka)
              </Link>
            </li>
            <li>
              <Link to="/hospitals?city=Hyderabad" className="hover:text-white transition">
                Hyderabad (Telangana)
              </Link>
            </li>
            <li>
              <Link to="/hospitals?city=Kochi" className="hover:text-white transition">
                Kochi (Kerala Ayurveda)
              </Link>
            </li>
          </ul>
        </div>

        {/* Portals & Official Links */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
            Portals & Resources
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/travel-guide" className="hover:text-white transition">
                e-Medical Visa Guide
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-white transition">
                Cost Comparison Tool
              </Link>
            </li>
            <li>
              <Link to="/patient/dashboard" className="hover:text-white transition">
                Patient Portal
              </Link>
            </li>
            <li>
              <Link to="/doctor/login" className="hover:text-white transition">
                Doctor & Specialist Login
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-white transition">
                Administrator Login
              </Link>
            </li>
            <li>
              <a
                href="https://indianvisaonline.gov.in/evisa/tvoa.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-300 transition flex items-center gap-1 text-[11px]"
              >
                Official Govt e-Visa Portal <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 bg-black/40 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} MediJourney India. Built for Smart India Hackathon (SIH 2026).
          </div>
          <div className="flex gap-4 text-xs">
            <span className="hover:text-slate-300 cursor-pointer">Privacy & HIPAA Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Patient Charter</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
