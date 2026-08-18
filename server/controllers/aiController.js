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

    if (lowerQuery.includes('tooth') || lowerQuery.includes('teeth') || lowerQuery.includes('dental') || lowerQuery.includes('implant') || lowerQuery.includes('veneer') || lowerQuery.includes('smile') || lowerQuery.includes('crown') || lowerQuery.includes('dentist')) {
      detectedCategory = 'Dental Treatments';
      detectedKeywords = ['All-on-4', 'Dental Implants', 'Zirconia Crowns', 'Veneers'];
    } else if (lowerQuery.includes('hair') || lowerQuery.includes('bald') || lowerQuery.includes('graft') || (lowerQuery.includes('transplant') && !lowerQuery.includes('kidney') && !lowerQuery.includes('liver') && !lowerQuery.includes('heart') && !lowerQuery.includes('bone marrow')) || lowerQuery.includes('follicle') || lowerQuery.includes('alopecia')) {
      detectedCategory = 'Hair Restoration';
      detectedKeywords = ['DHT Hair Transplant', 'FUE Grafts', 'Hairline Design'];
    } else if (lowerQuery.includes('baby') || lowerQuery.includes('ivf') || lowerQuery.includes('fertility') || lowerQuery.includes('pregnant') || lowerQuery.includes('infertility') || lowerQuery.includes('icsi') || lowerQuery.includes('embryo') || lowerQuery.includes('egg freezing')) {
      detectedCategory = 'Fertility & IVF Care';
      detectedKeywords = ['IVF Cycle', 'ICSI', 'PGT-A Genetics', 'Embryo Transfer'];
    } else if (lowerQuery.includes('heart') || lowerQuery.includes('cardio') || lowerQuery.includes('bypass') || lowerQuery.includes('valve') || lowerQuery.includes('chest pain') || lowerQuery.includes('angioplasty') || lowerQuery.includes('cabg') || lowerQuery.includes('stent')) {
      detectedCategory = 'Cardiology & Heart Surgery';
      detectedKeywords = ['Beating Heart CABG', 'Valve Replacement', 'Robotic Cardiology'];
    } else if (lowerQuery.includes('knee') || lowerQuery.includes('hip') || lowerQuery.includes('joint') || lowerQuery.includes('bone') || lowerQuery.includes('spine') || lowerQuery.includes('ortho') || lowerQuery.includes('arthritis') || lowerQuery.includes('ligament') || lowerQuery.includes('acl')) {
      detectedCategory = 'Orthopedics & Joint Replacement';
      detectedKeywords = ['Robotic Knee Replacement', 'Hip Arthroplasty', 'Spine Surgery'];
    } else if (lowerQuery.includes('cancer') || lowerQuery.includes('tumor') || lowerQuery.includes('chemo') || lowerQuery.includes('radiation') || lowerQuery.includes('oncology') || lowerQuery.includes('cyberknife') || lowerQuery.includes('proton') || lowerQuery.includes('carcinoma')) {
      detectedCategory = 'Oncology & Cancer Care';
      detectedKeywords = ['CyberKnife Radiosurgery', 'Proton Beam', 'Targeted Immunotherapy'];
    } else if (lowerQuery.includes('ayurveda') || lowerQuery.includes('wellness') || lowerQuery.includes('detox') || lowerQuery.includes('panchakarma') || lowerQuery.includes('herbal') || lowerQuery.includes('rejuvenation') || lowerQuery.includes('kerala')) {
      detectedCategory = 'Ayurveda & Wellness';
      detectedKeywords = ['Panchakarma Detox', 'Abhyanga Therapy', 'Holistic Healing'];
    } else if (lowerQuery.includes('nose') || lowerQuery.includes('rhinoplasty') || lowerQuery.includes('face') || lowerQuery.includes('liposuction') || lowerQuery.includes('breast') || lowerQuery.includes('tummy') || lowerQuery.includes('cosmetic') || lowerQuery.includes('plastic') || lowerQuery.includes('facelift')) {
      detectedCategory = 'Cosmetic & Plastic Surgery';
      detectedKeywords = ['Rhinoplasty', 'Facelift', 'Body Contouring', 'Blepharoplasty'];
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
