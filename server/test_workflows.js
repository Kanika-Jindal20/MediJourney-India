const http = require('http');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runWorkflowTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE WORKFLOW & VALIDATION TEST SUITE');
  console.log('===============================================================');

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, testName, details = '') => {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  };

  try {
    // 1. Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data.status === 'online', '1. Server Health Check API');

    // 2. Registration test
    const randomSuffix = Date.now();
    const newPatientEmail = `test.patient.${randomSuffix}@gmail.com`;
    const regRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: 'Carlos Mendoza',
        email: newPatientEmail,
        password: 'Password@123',
        role: 'patient',
        country: 'Spain',
        phone: '+34 612 345 678',
      }
    );
    assert(regRes.status === 201 && regRes.data.token && regRes.data.user.email === newPatientEmail, '2. Patient Registration with JWT token');

    const patientToken = regRes.data.token;
    const patientId = regRes.data.user._id;

    // 3. Validation: Duplicate Email Rejection
    const dupRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: 'Carlos Duplicate',
        email: newPatientEmail,
        password: 'Password@123',
      }
    );
    assert(dupRes.status === 400, '3. Error Handling: Reject Duplicate Email Registration');

    // 4. Validation: Invalid Login Credentials
    const badLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: newPatientEmail,
        password: 'WrongPassword!',
      }
    );
    assert(badLogin.status === 401, '4. Error Handling: Reject Invalid Password Login');

    // 5. Login Doctor & Admin
    const docLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'dr.naresh@medanta.org',
        password: 'Doctor@123456',
      }
    );
    assert(docLogin.status === 200 && docLogin.data.user.role === 'doctor', '5. Doctor Authentication & Role Verification');
    const doctorToken = docLogin.data.token;

    const adminLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@medijourney.in',
        password: 'Admin@123456',
      }
    );
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', '6. Admin Authentication & Role Verification');
    const adminToken = adminLogin.data.token;

    // 6. Role Authorization Security Check: Doctor trying to access Admin analytics
    const unauthorizedAccess = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(unauthorizedAccess.status === 403, '7. Security: Patient Forbidden from Accessing Admin Analytics');

    // 7. Hospitals Search & Filtering
    const hospSearch = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/hospitals?city=Chennai',
      method: 'GET',
    });
    assert(hospSearch.status === 200 && hospSearch.data.hospitals.some(h => h.city === 'Chennai'), '8. Hospital Filtering by City (Chennai)');

    const hospAccred = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/hospitals?accreditation=JCI',
      method: 'GET',
    });
    assert(hospAccred.status === 200 && hospAccred.data.hospitals.length > 0, '9. Hospital Filtering by JCI Accreditation');

    // 8. Hospital Details with populated Doctors & Reviews
    const firstHosp = hospAccred.data.hospitals[0];
    const hospDetail = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/hospitals/${firstHosp.slug}`,
      method: 'GET',
    });
    assert(hospDetail.status === 200 && hospDetail.data.hospital && Array.isArray(hospDetail.data.doctors), '10. Hospital Detail Page Data with Affiliated Doctors');

    // 9. Doctors Search & Language Filtering
    const docSearch = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/doctors?language=Arabic',
      method: 'GET',
    });
    assert(docSearch.status === 200 && docSearch.data.doctors.length > 0, '11. Doctor Search by Language (Arabic)');

    const docDetail = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/doctors/${docSearch.data.doctors[0]._id}`,
      method: 'GET',
    });
    assert(docDetail.status === 200 && docDetail.data.doctor && Array.isArray(docDetail.data.slots), '12. Doctor Detail Page with Real-Time Slots');

    // 10. Treatments Catalog & Global Cost Matrix
    const treatmentsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/treatments?category=Dental%20Treatments',
      method: 'GET',
    });
    assert(treatmentsRes.status === 200 && treatmentsRes.data.treatments.length > 0, '13. Treatments Catalog with Category Filter');

    const compareRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/treatments/compare/items?ids=all-on-4-dental-implants,hair-transplant-fue-dht',
      method: 'GET',
    });
    assert(compareRes.status === 200 && compareRes.data.treatments.length === 2, '14. Multi-Treatment Comparison Matrix API');

    // 11. Appointment / Consultation Workflow
    const selectedDoc = docSearch.data.doctors[0];
    const bookRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/appointments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`,
        },
      },
      {
        patientName: 'Carlos Mendoza',
        patientEmail: newPatientEmail,
        patientPhone: '+34 612 345 678',
        patientCountry: 'Spain',
        passportNumber: 'ES9918231',
        doctorId: selectedDoc._id,
        hospitalId: selectedDoc.hospitalId._id,
        appointmentDate: '2026-09-20',
        timeSlot: '11:30 AM',
        consultationType: 'teleconsultation',
        symptomsDescription: 'Looking for full arch dental reconstruction. Need treatment timeline for traveling from Madrid to India.',
        preferredLanguage: 'English',
        visaAssistanceRequired: true,
        airportPickupRequired: true,
      }
    );
    assert(bookRes.status === 201 && bookRes.data.appointment.appointmentRef.startsWith('MJ-2026-'), '15. Appointment Request Submission & Reference Generation');
    const apptId = bookRes.data.appointment._id;

    // 12. Doctor Queue & Review Case
    const docQueue = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/appointments/doctor-queue?doctorId=${selectedDoc._id}&status=pending`,
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert(docQueue.status === 200 && docQueue.data.appointments.some(a => a._id === apptId), '16. Doctor Workspace Consultation Queue Retrieval');

    // 13. Doctor Status Update (Confirm Appointment with Notes)
    const updateRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/appointments/${apptId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctorToken}`,
        },
      },
      {
        status: 'confirmed',
        doctorNotes: 'Treatment plan approved for All-on-4 implants. 4-day stay required. Medical visa letter issued.',
      }
    );
    assert(updateRes.status === 200 && updateRes.data.appointment.status === 'confirmed', '17. Doctor Case Confirmation & Clinical Notes Update');

    // 14. Patient Portal Inquiry Verification
    const patientPortal = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments/my-requests',
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const verifiedAppt = patientPortal.data.appointments.find(a => a._id === apptId);
    assert(patientPortal.status === 200 && verifiedAppt && verifiedAppt.status === 'confirmed', '18. Patient Portal Live Status & Doctor Notes Reflection');

    // 15. Doctor Slot Creation and Deletion
    const slotCreate = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/doctors/${selectedDoc._id}/slots`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctorToken}`,
        },
      },
      {
        slotDate: '2026-10-01',
        startTime: '04:00 PM',
        endTime: '04:30 PM',
        slotType: 'teleconsultation',
      }
    );
    assert(slotCreate.status === 201 && slotCreate.data.slot, '19. Doctor Availability Slot Creation');

    const slotDelete = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/doctors/slots/${slotCreate.data.slot._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert(slotDelete.status === 200, '20. Doctor Availability Slot Deletion');

    // 16. Admin Analytics
    const adminAnalytics = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAnalytics.status === 200 && adminAnalytics.data.stats.totalAppointments > 0, '21. Admin Platform Overview & Global Patient Analytics');

    // 17. Admin Master Appointments Ledger
    const adminLedger = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments/admin-all',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminLedger.status === 200 && adminLedger.data.appointments.length > 0, '22. Admin Master Appointments Ledger Audit');

    // 18. AI Medical Discovery Assistant
    const aiDiscoveryRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/discovery',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        query: 'Severe heart pain and need bypass surgery in Delhi',
        preferredCity: 'Delhi NCR',
      }
    );
    assert(
      aiDiscoveryRes.status === 200 &&
      aiDiscoveryRes.data.detectedCategory === 'Cardiology & Heart Surgery' &&
      aiDiscoveryRes.data.costSavingsPercent > 80,
      '23. AI Clinical Triage & Cardiology Matching'
    );

    // 19. Travel & Visa Guidelines API
    const travelRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/travel/guidelines',
      method: 'GET',
    });
    assert(travelRes.status === 200 && travelRes.data.visaInfo && travelRes.data.cityGuides.length >= 5, '24. Medical Travel, e-Visa & City Guide Logistics API');

    console.log('===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('===============================================================');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runWorkflowTests();
