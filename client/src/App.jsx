import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AIAssistantWidget } from './components/ai/AIAssistantWidget';
import { BookingModal } from './components/booking/BookingModal';

// Patient Pages
import { HomePage } from './pages/HomePage';
import { HospitalsPage } from './pages/HospitalsPage';
import { HospitalDetailPage } from './pages/HospitalDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { TreatmentDetailPage } from './pages/TreatmentDetailPage';
import { ComparePage } from './pages/ComparePage';
import { TravelGuidePage } from './pages/TravelGuidePage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Doctor Portal Pages
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { DoctorAvailabilityPage } from './pages/doctor/DoctorAvailabilityPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminHospitalsPage } from './pages/admin/AdminHospitalsPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminTreatmentsPage } from './pages/admin/AdminTreatmentsPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';

// Protected Route wrappers for Role Separation
const DoctorRoute = ({ children }) => {
  const { user, isDoctor, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || (!isDoctor && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedHosp, setSelectedHosp] = useState(null);
  const navigate = useNavigate();

  const handleSelectDoctorFromAI = (doc) => {
    setSelectedDoc(doc);
    setBookingModalOpen(true);
  };

  const handleSelectHospitalFromAI = (hosp) => {
    setSelectedHosp(hosp);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenAI={() => setAiAssistantOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Patient Facing Routes */}
          <Route path="/" element={<HomePage onOpenAI={() => setAiAssistantOpen(true)} />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/hospitals/:slugOrId" element={<HospitalDetailPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />
          <Route path="/treatments" element={<TreatmentsPage />} />
          <Route path="/treatments/:slug" element={<TreatmentDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/travel-guide" element={<TravelGuidePage />} />
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Doctor Portal Routes */}
          <Route path="/doctor/login" element={<LoginPage defaultRole="doctor" />} />
          <Route
            path="/doctor/dashboard"
            element={
              <DoctorRoute>
                <DoctorDashboardPage />
              </DoctorRoute>
            }
          />
          <Route
            path="/doctor/availability"
            element={
              <DoctorRoute>
                <DoctorAvailabilityPage />
              </DoctorRoute>
            }
          />

          {/* Administrator Portal Routes */}
          <Route path="/admin/login" element={<LoginPage defaultRole="admin" />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/hospitals"
            element={
              <AdminRoute>
                <AdminHospitalsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <AdminRoute>
                <AdminDoctorsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/treatments"
            element={
              <AdminRoute>
                <AdminTreatmentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <AdminRoute>
                <AdminAppointmentsPage />
              </AdminRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating AI Assistant Modal */}
      <AIAssistantWidget
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onSelectDoctor={handleSelectDoctorFromAI}
        onSelectHospital={handleSelectHospitalFromAI}
      />

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedDoc(null);
          setSelectedHosp(null);
        }}
        preselectedDoctor={selectedDoc}
        preselectedHospital={selectedHosp}
        onSuccess={() => {
          navigate('/patient/dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}
