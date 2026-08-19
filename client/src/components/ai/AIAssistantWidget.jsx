import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useCurrency } from '../../context/CurrencyContext';
import { Modal } from '../common/Modal';
import { Alert, Spinner } from '../common/Alert';
import {
  Sparkles,
  Send,
  Building2,
  Stethoscope,
  TrendingDown,
  Plane,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,

  FileSearch,
  Calculator,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  MapPin,
  FileCheck,
  Wallet,
  Activity,
  Layers,
} from 'lucide-react';

export const AIAssistantWidget = ({ isOpen, onClose, onSelectDoctor, onSelectHospital }) => {
  const { formatPrice, currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'cost' | 'report' | 'itinerary' | 'chat'
  const [query, setQuery] = useState('');
  const [preferredCity, setPreferredCity] = useState('All');
  const [budgetUSD, setBudgetUSD] = useState('any');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');


  // Itinerary state
  const [itineraryProcedure, setItineraryProcedure] = useState('Robotic Knee Replacement');
  const [itineraryCity, setItineraryCity] = useState('Delhi NCR');
  const [itineraryDays, setItineraryDays] = useState(10);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your MediJourney AI Medical Assistant. I can help you compare hospital costs, understand Indian e-Medical Visa requirements, match accredited surgeons, or plan your medical itinerary. What would you like to know?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Sample prompt chips tailored to medical tourism
  const sampleTriageQueries = [
    'Severe osteoarthritis in knee, seeking robotic joint replacement',
    'Full-mouth All-on-4 dental implants with zirconia bridge',
    '3,500 grafts high density Direct Hair Transplant in Delhi',
    'IVF fertility cycle with ICSI and PGT genetic embryo testing',
    'Triple vessel coronary artery disease needing beating-heart CABG',
  ];

  const sampleReportTexts = [
    'MRI Lumbar Spine: L4-L5 disc protrusion with mild thecal sac compression and radiculopathy.',
    '2D Echocardiogram: Ejection fraction 45%, severe aortic valve calcification with moderate stenosis.',
    'Trichoscopy Analysis: Norwood-Hamilton Scale Grade IV male pattern androgenetic alopecia with miniaturization.',
    'Maxillary CBCT: Severe alveolar bone resorption in posterior regions, edentulous maxilla.',
  ];

  const sampleQueries = [
    'Looking for All-on-4 dental implants with 5 days recovery',
    '3,500 grafts hair transplant in Delhi with natural hairline',
    'Affordable IVF cycle with high success rate and embryo testing',
    'Robotic knee replacement surgery cost vs USA / UK',
    'Heart bypass CABG surgery at top accredited cardiology hospital',
    'CyberKnife radiosurgery for targeted cancer treatment in Mumbai',
 main
  ];

  const sampleChatQuestions = [
    'How do I apply for an Indian e-Medical Visa?',
    'Can my spouse travel with me as an attendant?',
    'Why is healthcare in India 80% cheaper?',
    'Are Arabic or Russian translators provided at hospitals?',
  ];

  const handleSearch = async (queryText = query, mode = activeTab) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getDiscoveryRecommendations({
        query: queryText,
        preferredCity,
 feature/Ai
        mode: mode === 'report' ? 'report_explainer' : mode === 'cost' ? 'cost_estimator' : 'discovery',

        budgetUSD: budgetUSD !== 'any' ? Number(budgetUSD) : undefined,
 main
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'AI Assistant is currently busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    setItineraryLoading(true);
    setError('');
    try {
      const res = await aiService.generateItinerary({
        procedureName: itineraryProcedure,
        destinationCity: itineraryCity,
        totalDays: itineraryDays,
      });
      setItineraryResult(res.itinerary || []);
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary');
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleSendChat = async (msgText = chatInput) => {
    if (!msgText.trim()) return;
    const userMsg = { sender: 'user', text: msgText };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await aiService.sendChatMessage({ message: msgText });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, I am experiencing a temporary connection issue. Please try again in a moment.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setResult(null);
    setError('');
    if (newTab === 'report') {
      setQuery('');
    }
    if (newTab === 'itinerary' && !itineraryResult) {
      handleGenerateItinerary();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Medical Discovery & Clinical Triage Suite"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs font-semibold">
          <button
            onClick={() => handleTabChange('triage')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'triage'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical Triage</span>
          </button>

          <button
            onClick={() => handleTabChange('cost')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'cost'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Cost & Stay Estimator</span>
          </button>

          <button
            onClick={() => handleTabChange('report')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'report'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5 text-teal-600" />
            <span>Report Explainer</span>
          </button>

          <button
            onClick={() => handleTabChange('itinerary')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'itinerary'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-teal-600" />
            <span>Medical Itinerary</span>
          </button>

          <button
            onClick={() => handleTabChange('chat')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'chat'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Q&A Chat</span>
          </button>
        </div>

        {/* Dynamic Mode Header Banner */}
        {activeTab !== 'chat' && (
          <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-2xl p-5 shadow-lg border border-teal-500/30">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              {activeTab === 'triage'
                ? 'Intelligent Clinical Triage'
                : activeTab === 'cost'
                ? 'International Price Benchmarking'
                : activeTab === 'itinerary'
                ? 'Personalized Medical Travel Planner'
                : 'Diagnostic Findings Interpreter'}
            </div>

            <h4 className="text-lg sm:text-xl font-display font-bold">
              {activeTab === 'triage'
                ? 'Describe your medical condition or desired surgical procedure'
                : activeTab === 'cost'
                ? 'Compare India healthcare costs vs USA, UK, Canada & UAE'
                : activeTab === 'itinerary'
                ? 'Day-by-Day Treatment, Hospital Stay & Tourism Timeline'
                : 'Paste diagnostic scan findings or pathology summary'}
            </h4>

            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              {activeTab === 'triage'
                ? 'Our clinical matching engine maps symptoms to JCI/NABH accredited centers, verifies top specialist surgeons, and calculates estimated recovery timelines.'
                : activeTab === 'cost'
                ? 'Transparent international price comparisons showing ~70–90% cost savings for high-end surgeries in India without compromising clinical excellence.'
                : activeTab === 'itinerary'
                ? 'Customized timeline spanning pre-op consultation, surgical admission, recuperation hotel stay, local wellness, and Fit-to-Fly certification.'
                : 'Our AI translates complex radiology (MRI, CT, X-Ray) and laboratory terminology into clear explanations with direct specialist department recommendations.'}
            </p>
          </div>
        )}

        {/* TAB 1, 2, 3: Search Form for Triage, Cost, and Report */}
        {(activeTab === 'triage' || activeTab === 'cost' || activeTab === 'report') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                {activeTab === 'report' ? (
                  <textarea
                    rows={3}
                    placeholder="Paste diagnostic MRI, CT, Blood Panel, or Pathology impression text here..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-slate-400"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'cost'
                        ? 'e.g. Total knee replacement, Dental implants, IVF cycle...'
                        : 'e.g. Chest pain with shortness of breath, Severe hair loss, Rhinoplasty...'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-slate-400"
                  />
                )}
              </div>

              {activeTab !== 'report' && (
                <div className="w-full sm:w-48">
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full h-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="All">All Medical Hubs</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Kochi">Kochi (Kerala)</option>
                  </select>
                </div>
              )}


        {/* Intro */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-navy-950 text-white rounded-2xl p-5 shadow-lg border border-teal-500/30">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            AI Clinical Matcher & Savings Engine
          </div>
          <h4 className="text-xl font-display font-bold">
            Describe your condition, desired treatment or budget
          </h4>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Our AI engine maps your symptoms to specialized departments, scans JCI/NABH accredited hospital facilities, calculates savings vs Western hospitals, and recommends verified specialists.
          </p>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sampleQueries.map((item, idx) => (
 main
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                <span>Analyze</span>
              </button>
            </div>

            {/* Prompt Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === 'report' ? 'Sample Diagnostic Text:' : 'Quick Medical Queries:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeTab === 'report' ? sampleReportTexts : sampleTriageQueries).map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(sample);
                      handleSearch(sample);
                    }}
                    className="text-left text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ITINERARY PLANNER */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Procedure</label>
                <select
                  value={itineraryProcedure}
                  onChange={(e) => setItineraryProcedure(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                >
                  <option value="Robotic Knee Replacement">Robotic Knee Replacement</option>
                  <option value="CABG Heart Bypass Surgery">CABG Heart Bypass Surgery</option>
                  <option value="Full-Mouth Dental Implants">Full-Mouth Dental Implants</option>
                  <option value="Direct Hair Transplant (DHT)">Direct Hair Transplant (DHT)</option>
                  <option value="IVF Fertility ICSI Cycle">IVF Fertility ICSI Cycle</option>
                  <option value="CyberKnife Radiosurgery">CyberKnife Radiosurgery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination City</label>
                <select
                  value={itineraryCity}
                  onChange={(e) => setItineraryCity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kochi">Kochi (Kerala)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateItinerary}
                  disabled={itineraryLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {itineraryLoading ? <Spinner size="sm" /> : <Calendar className="w-4 h-4" />}
                  <span>Generate Itinerary</span>
                </button>
              </div>
            </div>

            {/* Itinerary Timeline */}
            {itineraryResult && (
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Proposed {itineraryDays}-Day Medical Journey Itinerary ({itineraryCity})
                </div>

                <div className="relative pl-6 border-l-2 border-teal-200 space-y-4 text-xs">
                  {itineraryResult.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-xs">
                            Day {item.day}: {item.title}
                          </span>
                          <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-100">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AI Q&A CHAT */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="h-80 overflow-y-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none shadow-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2 text-slate-500">
                    <Spinner size="sm" />
                    <span>AI Assistant is drafting your answer...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {sampleChatQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(q)}
                  className="text-[11px] bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 px-3 py-1 rounded-xl border border-slate-200 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything about medical visas, treatment costs, flight transfers, companion stay..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={chatLoading || !chatInput.trim()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner for Triage & Cost */}
        {loading && (
          <div className="text-center py-10 space-y-3">
            <Spinner size="lg" className="mx-auto text-teal-600" />
            <p className="text-xs font-semibold text-slate-600">
              Analyzing medical query against JCI clinical databases & specialist surgeons...
            </p>

        {/* Input & Filter Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Need robotic knee replacement or dental implants under $3,000..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={preferredCity}
              onChange={(e) => setPreferredCity(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="All">All Medical Hubs (Pan-India)</option>
              <option value="Delhi NCR">Delhi NCR & Gurugram</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kochi">Kochi (Kerala)</option>
            </select>

            <select
              value={budgetUSD}
              onChange={(e) => setBudgetUSD(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="any">Any Budget Tier</option>
              <option value="2500">Under $2,500 (Dental / Hair / Minor)</option>
              <option value="6000">$2,500 - $6,000 (Joints / IVF / Cosmetic)</option>
              <option value="12000">$6,000 - $12,000 (Cardiology / Oncology)</option>
            </select>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
              <span>Analyze & Match</span>
            </button>
 main
          </div>
        )}

        {error && <Alert type="error" message={error} />}

        {/* RESULTS SECTION (Triage, Cost, Report) */}
        {result && !loading && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            {/* Urgency & Category Badge Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-teal-50/70 border border-teal-100 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-700 block">
                  Matched Clinical Specialty
                </span>
                <span className="text-base font-extrabold text-teal-950 font-display">
                  {result.detectedCategory}
                </span>
              </div>


              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  Stay & Recovery
                </span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {result.avgStayDays}d Inpatient + {result.avgRecoveryDays}d Hotel
                </span>
              </div>
            </div>

            {/* Cross-Border Price Comparison (if cost tab or comparison available) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Cross-Border Procedure Cost Benchmark Matrix
                </span>
                <span className="text-emerald-700 font-extrabold text-[11px]">
                  Est. Net Savings: ${result.savingsAmountUSD?.toLocaleString()} USD
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="text-[10px] font-bold text-teal-900">India (Accredited JCI)</div>
                  <div className="text-base font-extrabold text-teal-700 mt-1">
                    {formatPrice(result.estimatedCostUSD)}
                  </div>
                  <div className="text-[10px] text-teal-600 font-semibold mt-0.5">
                    ★ Best Value & Zero Wait Time
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500">United States (Average)</div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {formatPrice(result.costUSAUSD)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High insurance deductible</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500">United Kingdom (Private)</div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {formatPrice(result.costUKUSD)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">NHS long waiting queues</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500">UAE / Singapore</div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {formatPrice(Math.round(result.estimatedCostUSD * 2.8))}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Moderate savings</div>
                </div>
              </div>
            </div>

            {/* Report Explanation / Clinical Guidance */}
            {result.reportExplanation && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1.5 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-amber-700" />
                  Layman Clinical Finding Interpretation:
                </div>
                <p className="text-amber-950 leading-relaxed">{result.reportExplanation}</p>
              </div>
            )}

            {/* Key Clinical Findings / Notes */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-600" />
                Clinical Analysis & Recommendations
              </div>
              <ul className="space-y-1.5 text-slate-600">
                {result.guidanceNotes?.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>


            {/* Recommended Specialists */}

            {/* Recommended Treatments */}
            {result.recommendedTreatments?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Matched Procedure Guides
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.recommendedTreatments.map((t) => (
                    <div
                      key={t._id}
                      className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 transition"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{t.name}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{formatPrice(t.costIndiaUSD)}</div>
                      </div>
                      <Link
                        to={`/treatments/${t.slug}`}
                        onClick={onClose}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold shrink-0 transition"
                      >
                        View Guide
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Doctors */}
 main
            {result.recommendedDoctors?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    Top Verified Specialists for Your Case
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    Direct Pre-Travel Video Consultations Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.recommendedDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{doc.fullName}</div>
                          <div className="text-[11px] text-slate-500">{doc.specialty}</div>
                          <div className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {doc.hospitalId?.name || 'Accredited Hospital'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectDoctor) onSelectDoctor(doc);
                        }}

                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-xs"
=======
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shrink-0 transition shadow-xs"
main
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Hospitals */}
            {result.recommendedHospitals?.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Matching JCI & NABH Accredited Medical Centers
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.recommendedHospitals.map((hosp) => (
                    <div
                      key={hosp._id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 text-xs hover:border-slate-300 transition"
                    >
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {hosp.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {hosp.city}, {hosp.state}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {hosp.accreditations?.map((acc, i) => (
                          <span
                            key={i}
                            className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-bold"
                          >
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

