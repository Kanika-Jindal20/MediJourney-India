const Treatment = require('../models/Treatment');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

// @desc    Intelligent Medical Discovery Assistant
// @route   POST /api/ai/discovery
// @access  Public
exports.aiDiscovery = async (req, res, next) => {
  try {
    const { query, preferredCity, budgetUSD } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a health query or desired treatment' });
    }

    const lowerQuery = query.toLowerCase();

    // Map common symptoms/procedures to medical specialties
    let detectedCategory = 'Cosmetic & Plastic Surgery';
    let detectedKeywords = [];

    if (lowerQuery.includes('tooth') || lowerQuery.includes('teeth') || lowerQuery.includes('dental') || lowerQuery.includes('implant') || lowerQuery.includes('veneer') || lowerQuery.includes('smile')) {
      detectedCategory = 'Dental Treatments';
      detectedKeywords = ['Dental', 'Implant', 'Crown', 'Veneer'];
    } else if (lowerQuery.includes('hair') || lowerQuery.includes('bald') || lowerQuery.includes('graft') || lowerQuery.includes('transplant') && !lowerQuery.includes('kidney') && !lowerQuery.includes('liver')) {
      detectedCategory = 'Hair Restoration';
      detectedKeywords = ['Hair', 'FUE', 'Grafts', 'Alopecia'];
    } else if (lowerQuery.includes('baby') || lowerQuery.includes('ivf') || lowerQuery.includes('fertility') || lowerQuery.includes('pregnant') || lowerQuery.includes('infertility') || lowerQuery.includes('icsi')) {
      detectedCategory = 'Fertility & IVF Care';
      detectedKeywords = ['IVF', 'ICSI', 'Fertility', 'Embryo'];
    } else if (lowerQuery.includes('heart') || lowerQuery.includes('cardio') || lowerQuery.includes('bypass') || lowerQuery.includes('valve') || lowerQuery.includes('chest pain') || lowerQuery.includes('angioplasty')) {
      detectedCategory = 'Cardiology & Heart Surgery';
      detectedKeywords = ['CABG', 'Angioplasty', 'Valve', 'Cardiac'];
    } else if (lowerQuery.includes('knee') || lowerQuery.includes('hip') || lowerQuery.includes('joint') || lowerQuery.includes('bone') || lowerQuery.includes('spine') || lowerQuery.includes('ortho')) {
      detectedCategory = 'Orthopedics & Joint Replacement';
      detectedKeywords = ['Knee Replacement', 'Hip Replacement', 'Arthroscopy'];
    } else if (lowerQuery.includes('cancer') || lowerQuery.includes('tumor') || lowerQuery.includes('chemo') || lowerQuery.includes('radiation') || lowerQuery.includes('oncology')) {
      detectedCategory = 'Oncology & Cancer Care';
      detectedKeywords = ['Oncology', 'CyberKnife', 'Immunotherapy', 'Surgical Oncology'];
    } else if (lowerQuery.includes('nose') || lowerQuery.includes('rhinoplasty') || lowerQuery.includes('face') || lowerQuery.includes('liposuction') || lowerQuery.includes('breast') || lowerQuery.includes('tummy')) {
      detectedCategory = 'Cosmetic & Plastic Surgery';
      detectedKeywords = ['Rhinoplasty', 'Facelift', 'Liposuction', 'Cosmetic'];
    } else if (lowerQuery.includes('ayurveda') || lowerQuery.includes('wellness') || lowerQuery.includes('detox') || lowerQuery.includes('panchakarma') || lowerQuery.includes('herbal')) {
      detectedCategory = 'Ayurveda & Wellness';
      detectedKeywords = ['Panchakarma', 'Ayurveda', 'Holistic Rejuvenation'];
    }

    // Find relevant treatments
    const treatments = await Treatment.find({
      $or: [
        { category: detectedCategory },
        { name: new RegExp(detectedCategory.split(' ')[0], 'i') },
      ],
    }).limit(3);

    // Find top accredited hospitals in preferred city (or nationwide)
    let hospitalQuery = {
      $or: [
        { specialties: new RegExp(detectedCategory.split(' ')[0], 'i') },
        { description: new RegExp(detectedCategory.split(' ')[0], 'i') },
      ],
    };
    if (preferredCity && preferredCity !== 'All') {
      hospitalQuery.city = new RegExp(`^${preferredCity}$`, 'i');
    }

    let hospitals = await Hospital.find(hospitalQuery).sort({ rating: -1 }).limit(3);
    if (hospitals.length === 0) {
      hospitals = await Hospital.find().sort({ rating: -1 }).limit(3);
    }

    // Find specialist doctors
    const doctors = await Doctor.find({
      specialty: new RegExp(detectedCategory.split(' ')[0], 'i'),
    })
      .populate('hospitalId', 'name city state')
      .limit(3);

    // Formulate structured AI recommendation response
    const primaryTreatment = treatments[0] || {
      name: detectedCategory,
      costIndiaUSD: 2500,
      costUSAUSD: 14000,
      avgStayDays: 4,
      avgRecoveryDays: 8,
    };

    const costSavingsPercent = primaryTreatment.costUSAUSD
      ? Math.round(((primaryTreatment.costUSAUSD - primaryTreatment.costIndiaUSD) / primaryTreatment.costUSAUSD) * 100)
      : 80;

    const guidanceNotes = [
      `Recommended Clinical Field: ${detectedCategory}`,
      `Typical Savings in India: ~${costSavingsPercent}% lower cost compared to Western medical centers without compromising JCI/NABH clinical standards.`,
      `Recommended Stay in India: Approximately ${primaryTreatment.avgStayDays} days inpatient, followed by ${primaryTreatment.avgRecoveryDays} days local recovery before return flight.`,
      `Next Step: Select one of the verified specialists below to schedule a preliminary teleconsultation and obtain a personalized medical opinion.`,
    ];

    res.json({
      success: true,
      query,
      detectedCategory,
      estimatedCostUSD: primaryTreatment.costIndiaUSD,
      costSavingsPercent,
      guidanceNotes,
      recommendedTreatments: treatments,
      recommendedHospitals: hospitals,
      recommendedDoctors: doctors,
      travelAdvice: {
        visaType: 'Indian e-Medical Visa (60-day validity, triple entry)',
        airportAssistance: 'Complimentary international patient pickup is available at all partner hospitals.',
      },
    });
  } catch (error) {
    next(error);
  }
};
