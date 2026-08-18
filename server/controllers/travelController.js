// @desc    Get complete Indian Medical Visa, Logistics & Travel guidelines
// @route   GET /api/travel/guidelines
// @access  Public
exports.getTravelGuidelines = async (req, res) => {
  const visaInfo = {
    title: 'Indian e-Medical Visa & Medical Attendant Visa Guide',
    categories: [
      {
        name: 'e-Medical Visa (MED)',
        eligibility: 'Foreign nationals seeking medical treatment in recognized, specialized Indian hospitals.',
        validity: '60 days from date of first entry into India.',
        entries: 'Triple Entry permitted within the 60-day validity.',
        processingTime: '72 to 96 hours via official Indian Visa Portal.',
        extensionPermitted: true,
        documentsRequired: [
          'Scanned bio page of passport (valid for minimum 6 months).',
          'Recent color passport-size photograph with white background.',
          'Official Medical Visa Invitation Letter from accredited Indian Hospital on their letterhead.',
          'Medical documents outlining the diagnosis and treatment plan.',
        ],
      },
      {
        name: 'e-Medical Attendant Visa (MED-X)',
        eligibility: 'Up to two attendants/family members accompanying the patient holding an e-Medical Visa.',
        validity: 'Same validity as the primary patient’s e-Medical Visa.',
        entries: 'Triple Entry.',
        documentsRequired: ['Passport copy', 'Photograph', 'Reference to patient’s e-Medical Visa Application ID.'],
      },
    ],
    countryRules: [
      {
        country: 'United States',
        code: 'US',
        feeUSD: 80,
        processingDays: '3-4 Days',
        specialNotes: 'Standard e-Medical Visa online application. 3 entries permitted.',
      },
      {
        country: 'United Kingdom',
        code: 'GB',
        feeUSD: 80,
        processingDays: '3-4 Days',
        specialNotes: 'Eligible for fast-track e-Visa with hospital invitation letter.',
      },
      {
        country: 'United Arab Emirates',
        code: 'AE',
        feeUSD: 25,
        processingDays: '2-3 Days',
        specialNotes: 'Expedited processing for GCC residents seeking specialized surgery.',
      },
      {
        country: 'Australia',
        code: 'AU',
        feeUSD: 80,
        processingDays: '3-4 Days',
        specialNotes: 'Direct flights from Sydney/Melbourne into Delhi with terminal medical lounge assistance.',
      },
      {
        country: 'Canada',
        code: 'CA',
        feeUSD: 80,
        processingDays: '3-4 Days',
        specialNotes: 'Valid for all major accredited hospitals across India.',
      },
      {
        country: 'Nigeria / Kenya / Africa',
        code: 'AFR',
        feeUSD: 80,
        processingDays: '4-5 Days',
        specialNotes: 'Yellow fever vaccination card required if departing from endemic zones.',
      },
      {
        country: 'Bangladesh',
        code: 'BD',
        feeUSD: 0,
        processingDays: '2-3 Days',
        specialNotes: 'Free / Nil visa fee for medical visits with accredited hospital letter.',
      },
    ],
    stepByStepProcess: [
      {
        step: 1,
        title: 'Submit Consultation & Obtain Hospital Visa Letter',
        description: 'Submit your medical records via MediJourney India. Once the specialist approves, the hospital issues an official Medical Visa Invitation Letter.',
      },
      {
        step: 2,
        title: 'Apply Online on Indian e-Visa Portal',
        description: 'Visit the official Government of India portal (indianvisaonline.gov.in) and apply under e-Medical Visa using the hospital invitation letter.',
      },
      {
        step: 3,
        title: 'Receive Electronic Travel Authorization (ETA)',
        description: 'Your ETA will be emailed within 3 to 4 business days. Print a copy to present at immigration upon arrival.',
      },
      {
        step: 4,
        title: 'Airport Assistance & Hospital Admission',
        description: 'Our hospital coordination desk provides airport pickup, local 5G SIM card, currency exchange, and hotel/hospital check-in.',
      },
    ],
  };

  const preDepartureChecklist = [
    {
      category: 'Official Travel & Visa Documents',
      items: [
        'Passport with at least 6 months validity & 2 blank pages',
        'Printed Electronic Travel Authorization (ETA) confirmation',
        'Official Hospital Medical Visa Invitation Letter (MED/MED-X)',
        'Confirmed return air tickets for patient & attendants',
      ],
    },
    {
      category: 'Medical Dossier & Diagnostic Scans',
      items: [
        'Original MRI, CT Scans, X-Rays (CD/DVD discs or DICOM files)',
        'Recent blood test results and biopsy pathology reports',
        'Detailed clinical case history from treating physician in home country',
        'List of current medications, dosage schedule, and allergy chart',
      ],
    },
    {
      category: 'Financial & Connectivity Essentials',
      items: [
        'International credit/debit cards notified for overseas transactions',
        'Foreign currency (USD/EUR/GBP) for currency exchange counter at airport',
        'Unlocked smartphone for complimentary Indian 5G SIM card',
        'Universal power adapter (Type D & M plugs standard in India)',
      ],
    },
  ];

  const cityGuides = [
    {
      city: 'Delhi NCR (New Delhi & Gurugram)',
      airport: 'Indira Gandhi International Airport (DEL)',
      terminalPickup: 'Terminal 3 International Arrival Gate 5 (MediJourney Desk)',
      overview: 'Hub for major multi-super specialty institutions (Medanta, Fortis FMRI, Apollo Indraprastha, Max). Excellent metro connectivity, 5-star & service apartment lodging within 10-15 mins of hospitals.',
      popularSpecialties: ['Cardiology', 'Cosmetic Surgery', 'Hair Restoration', 'Bone Marrow Transplant', 'Oncology'],
      nearbyStayAvgUSD: 45,
      weather: 'Best travel months: October to March.',
      emergencyHelpline: '+91-11-2309-2011',
    },
    {
      city: 'Mumbai (Maharashtra)',
      airport: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
      terminalPickup: 'Terminal 2 International Arrivals Concierge Desk',
      overview: 'India’s financial capital and renowned center for advanced oncology, robotic surgery, cosmetic dentistry, and IVF fertility clinics.',
      popularSpecialties: ['Oncology & CyberKnife', 'IVF & Fertility', 'Cosmetic Dentistry', 'Plastic Surgery'],
      nearbyStayAvgUSD: 60,
      weather: 'Pleasant winter months: November to February.',
      emergencyHelpline: '+91-22-2262-0111',
    },
    {
      city: 'Chennai (Tamil Nadu)',
      airport: 'Chennai International Airport (MAA)',
      terminalPickup: 'Terminal 4 International Arrival Help Desk',
      overview: 'Known as the "Healthcare Capital of India". High patient inflow from Southeast Asia, Middle East, and Africa for cardiac surgery, organ transplants, and eye care.',
      popularSpecialties: ['Cardiology & CABG', 'Organ Transplants', 'Ophthalmology', 'Orthopedics'],
      nearbyStayAvgUSD: 35,
      weather: 'Tropical climate; comfortable from November to February.',
      emergencyHelpline: '+91-44-2345-2345',
    },
    {
      city: 'Bengaluru (Karnataka)',
      airport: 'Kempegowda International Airport (BLR)',
      terminalPickup: 'Terminal 2 International Arrival Lounge Zone B',
      overview: 'India’s Silicon Valley, boasting premier tertiary care hospitals (Manipal, Narayana Health) with world-leading pediatric cardiology and robotic knee/hip replacements.',
      popularSpecialties: ['Robotic Joint Replacement', 'Pediatric Cardiology', 'Neurology', 'Stem Cell Therapy'],
      nearbyStayAvgUSD: 40,
      weather: 'Moderate, pleasant climate throughout the entire year.',
      emergencyHelpline: '+91-80-2294-2222',
    },
    {
      city: 'Kochi / Kerala',
      airport: 'Cochin International Airport (COK)',
      terminalPickup: 'Terminal 3 International Arrival Medical Tourism Desk',
      overview: 'Global destination for integrative modern medicine paired with authentic Ayurvedic rejuvenation, post-surgery wellness retreats, and dental tourism.',
      popularSpecialties: ['Ayurveda & Panchakarma', 'Dental Care', 'Wellness & Detox', 'General Surgery'],
      nearbyStayAvgUSD: 30,
      weather: 'Lush tropical climate; cool season from September to March.',
      emergencyHelpline: '+91-484-2394-000',
    },
  ];

  const currencyRates = {
    base: 'USD',
    rates: {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      AED: 3.67,
      CAD: 1.36,
      AUD: 1.52,
      SAR: 3.75,
      INR: 83.5,
    },
  };

  res.json({
    success: true,
    visaInfo,
    preDepartureChecklist,
    cityGuides,
    currencyRates,
  });
};
