const Treatment = require('../models/Treatment');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

// @desc    Intelligent Medical Discovery, Cost Estimator & Report Explainer Assistant
// @route   POST /api/ai/discovery
// @access  Public
exports.aiDiscovery = async (req, res, next) => {
  try {
    const { query, preferredCity, mode = 'discovery', countryOfOrigin = 'United States' } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a health query, diagnostic text or treatment name' });
    }

    const lowerQuery = query.toLowerCase();

    // Map common symptoms, procedures, and diagnostic scan keywords to specialties
    let detectedCategory = 'Cosmetic & Plastic Surgery';
    let urgencyLevel = 'Elective / Standard Planning';
    let keyFindings = [];
    
    if (
      lowerQuery.includes('tooth') ||
      lowerQuery.includes('teeth') ||
      lowerQuery.includes('dental') ||
      lowerQuery.includes('implant') ||
      lowerQuery.includes('veneer') ||
      lowerQuery.includes('crown') ||
      lowerQuery.includes('smile') ||
      lowerQuery.includes('all-on-4') ||
      lowerQuery.includes('all-on-6') ||
      lowerQuery.includes('periodont') ||
      lowerQuery.includes('denture')
    ) {
      detectedCategory = 'Dental Treatments';
      keyFindings = ['Full-arch rehabilitation recommended', 'Immediate-load dental implants eligible', '3D CBCT digital smile design needed'];
    } else if (
      lowerQuery.includes('hair') ||
      lowerQuery.includes('bald') ||
      lowerQuery.includes('graft') ||
      lowerQuery.includes('follicle') ||
      lowerQuery.includes('alopecia') ||
      lowerQuery.includes('norwood') ||
      (lowerQuery.includes('transplant') && !lowerQuery.includes('kidney') && !lowerQuery.includes('liver') && !lowerQuery.includes('heart'))
    ) {
      detectedCategory = 'Hair Restoration';
      keyFindings = ['High-density Direct Hair Transplant (DHT) indicated', 'Estimated 2,500 – 4,000 follicular units required', 'Sapphire/titanium implanter extraction'];
    } else if (
      lowerQuery.includes('baby') ||
      lowerQuery.includes('ivf') ||
      lowerQuery.includes('fertility') ||
      lowerQuery.includes('pregnant') ||
      lowerQuery.includes('infertility') ||
      lowerQuery.includes('icsi') ||
      lowerQuery.includes('egg') ||
      lowerQuery.includes('embryo') ||
      lowerQuery.includes('sperm') ||
      lowerQuery.includes('blastocyst') ||
      lowerQuery.includes('pgt')
    ) {
      detectedCategory = 'Fertility & IVF Care';
      keyFindings = ['Advanced ICSI + blastocyst incubation recommended', 'Pre-implantation Genetic Testing (PGT-A) suggested', 'High success rate protocols in accredited cleanroom labs'];
    } else if (
      lowerQuery.includes('heart') ||
      lowerQuery.includes('cardio') ||
      lowerQuery.includes('bypass') ||
      lowerQuery.includes('cabg') ||
      lowerQuery.includes('valve') ||
      lowerQuery.includes('chest pain') ||
      lowerQuery.includes('angioplasty') ||
      lowerQuery.includes('stent') ||
      lowerQuery.includes('artery') ||
      lowerQuery.includes('stenosis') ||
      lowerQuery.includes('ejection fraction')
    ) {
      detectedCategory = 'Cardiology & Heart Surgery';
      urgencyLevel = 'Priority Evaluation Recommended';
      keyFindings = ['Beating-heart off-pump CABG or minimally invasive valve replacement', 'Hybrid cath lab and coronary angiography recommended', 'Continuous post-op telemetry in Cardiac ICU'];
    } else if (
      lowerQuery.includes('knee') ||
      lowerQuery.includes('hip') ||
      lowerQuery.includes('joint') ||
      lowerQuery.includes('bone') ||
      lowerQuery.includes('spine') ||
      lowerQuery.includes('ortho') ||
      lowerQuery.includes('disc') ||
      lowerQuery.includes('herniation') ||
      lowerQuery.includes('cartilage') ||
      lowerQuery.includes('arthroplasty') ||
      lowerQuery.includes('mako') ||
      lowerQuery.includes('osteoarthritis')
    ) {
      detectedCategory = 'Orthopedics & Joint Replacement';
      keyFindings = ['Robotic-assisted joint replacement (sub-millimeter precision)', 'Same-day supervised gait physiotherapy', 'High-flexion FDA-approved titanium/polyethylene prosthesis'];
    } else if (
      lowerQuery.includes('cancer') ||
      lowerQuery.includes('tumor') ||
      lowerQuery.includes('chemo') ||
      lowerQuery.includes('radiation') ||
      lowerQuery.includes('oncology') ||
      lowerQuery.includes('cyberknife') ||
      lowerQuery.includes('proton') ||
      lowerQuery.includes('malignant') ||
      lowerQuery.includes('biopsy') ||
      lowerQuery.includes('lymph')
    ) {
      detectedCategory = 'Oncology & Cancer Care';
      urgencyLevel = 'Priority Evaluation Recommended';
      keyFindings = ['Sub-millimeter CyberKnife robotic radiosurgery or Proton Beam therapy', 'Multidisciplinary Tumor Board review', 'Minimal collateral radiation to adjacent healthy tissue'];
    } else if (
      lowerQuery.includes('nose') ||
      lowerQuery.includes('rhinoplasty') ||
      lowerQuery.includes('face') ||
      lowerQuery.includes('liposuction') ||
      lowerQuery.includes('breast') ||
      lowerQuery.includes('tummy') ||
      lowerQuery.includes('facelift') ||
      lowerQuery.includes('blepharoplasty') ||
      lowerQuery.includes('aesthetic')
    ) {
      detectedCategory = 'Cosmetic & Plastic Surgery';
      keyFindings = ['Board-certified plastic and reconstructive surgeon mapping', 'Pre-operative 3D morphing consultation', 'Rapid recovery protocols with discreet recovery suites'];
    } else if (
      lowerQuery.includes('ayurveda') ||
      lowerQuery.includes('wellness') ||
      lowerQuery.includes('detox') ||
      lowerQuery.includes('panchakarma') ||
      lowerQuery.includes('herbal') ||
      lowerQuery.includes('rejuvenation') ||
      lowerQuery.includes('stress') ||
      lowerQuery.includes('holistic')
    ) {
      detectedCategory = 'Ayurveda & Wellness';
      keyFindings = ['Ayurvedic Pulse Diagnosis (Nadi Pariksha) by certified Vaidyas', 'Authentic medicated herbal Abhyanga & Shirodhara', 'Kerala waterfront post-surgical organic rejuvenation'];
 main
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
      .populate('hospitalId', 'name city state airportName heroImage')
      .limit(3);

    // Formulate primary treatment benchmarks
    const primaryTreatment = treatments[0] || {
      name: detectedCategory,
      costIndiaUSD: 2500,
      costUSAUSD: 18000,
      costUKUSD: 12000,
      costUAEUSD: 10000,
      avgStayDays: 4,
      avgRecoveryDays: 8,
    };

    const costUSA = primaryTreatment.costUSAUSD || 18000;
    const costIndia = primaryTreatment.costIndiaUSD || 2500;
    const costSavingsPercent = Math.round(((costUSA - costIndia) / costUSA) * 100);
    const savingsAmountUSD = costUSA - costIndia;

    // Report Explainer layman summary
    let reportExplanation = '';
    if (mode === 'report_explainer') {
      reportExplanation = `Based on your diagnostic inquiry, the clinical terms strongly correlate with "${detectedCategory}". In India's premier JCI/NABH hospitals, this is managed by board-certified specialists using computer-guided and minimally invasive protocols. Your condition can be evaluated through a pre-arrival teleconsultation before booking flights.`;
    }

    const guidanceNotes = [
      `Identified Clinical Department: ${detectedCategory}`,
      `Estimated Treatment Savings: ~${costSavingsPercent}% lower total cost compared to Western healthcare benchmarks (Saving ~$${savingsAmountUSD.toLocaleString()} USD).`,
      `Recommended Stay in India: ${primaryTreatment.avgStayDays || 4} days hospital admission + ${primaryTreatment.avgRecoveryDays || 7} days local hotel recovery prior to fitness-to-fly clearance.`,
      `Pre-Travel Action: Submit a free consultation request below with your MRI/X-ray files for an official treatment quote and Indian e-Medical Visa invitation letter.`,
    ];

    res.json({
      success: true,
      query,
      mode,
      detectedCategory,
      urgencyLevel,
      estimatedCostUSD: costIndia,
      costUSAUSD: costUSA,
      costUKUSD: primaryTreatment.costUKUSD || Math.round(costUSA * 0.7),
      costUAEUSD: primaryTreatment.costUAEUSD || Math.round(costUSA * 0.55),
      costSavingsPercent,
      savingsAmountUSD,
      avgStayDays: primaryTreatment.avgStayDays || 4,
      avgRecoveryDays: primaryTreatment.avgRecoveryDays || 7,
      keyFindings,
      reportExplanation,
      guidanceNotes,
      recommendedTreatments: treatments,
      recommendedHospitals: hospitals,
      recommendedDoctors: doctors,
      travelAdvice: {
        visaType: 'Indian e-Medical Visa (Triple-entry, 60-day validity, granted in 24-48 hrs)',
        airportAssistance: 'Complimentary private chauffeur transfer from DEL / BOM / MAA / BLR / HYD / COK international airports.',
        languages: 'English, Arabic, Russian, and French hospital coordinators provided free of charge.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Personalized Medical Travel Itinerary
// @route   POST /api/ai/itinerary
// @access  Public
exports.generateItinerary = async (req, res, next) => {
  try {
    const { procedureName, destinationCity = 'Delhi NCR', totalDays = 10 } = req.body;

    const daysCount = Number(totalDays) || 10;
    const city = destinationCity || 'Delhi NCR';
    const procedure = procedureName || 'Robotic Healthcare Procedure';

    const daySchedule = [
      {
        day: 1,
        title: 'VIP Arrival & Airport Chauffeur Transfer',
        description: `Land at ${city} International Airport. Meet your personal international patient concierge, transfer via private chauffeur to luxury partner hotel, and receive your Indian local SIM card & welcome kit.`,
        tag: 'Logistics',
      },
      {
        day: 2,
        title: 'Comprehensive Pre-Op Evaluation & Surgeon Consultation',
        description: `Morning transfer to accredited hospital. In-person clinical consultation with Senior Surgeon, complete blood work, 3D high-resolution imaging scans, and final anesthesia clearance.`,
        tag: 'Clinical',
      },
      {
        day: 3,
        title: `Procedure Day: ${procedure}`,
        description: `Hospital admission to private international deluxe suite. Procedure performed in advanced robotic hybrid surgical suite. Monitored post-op recovery in specialized high-dependency unit.`,
        tag: 'Surgical',
      },
      {
        day: 4,
        title: 'Post-Operative Recovery & Monitoring',
        description: `Bedside rounds with surgical team and physiotherapist. Customized nutritional chef-curated menu, continuous telemetry monitoring, and pain management protocol.`,
        tag: 'Recovery',
      },
      {
        day: 5,
        title: 'Hospital Discharge to Recuperation Suite',
        description: `Discharge clearance by Chief Surgeon. Chauffeur transfer to partner recovery hotel suite. Daily in-room visits by attending nursing team for wound management.`,
        tag: 'Discharge',
      },
      {
        day: 6,
        title: 'Supervised Physiotherapy & Gentle Mobility',
        description: `Personalized physical rehabilitation session. Video check-in with your attending medical coordinator. Rest and organic recovery meals.`,
        tag: 'Rehab',
      },
      {
        day: 7,
        title: 'Local Cultural & Sightseeing Excursion',
        description: `Gentle private sightseeing tailored to your recovery pace (e.g. historic monuments, artisanal craft markets, or serene botanical gardens).`,
        tag: 'Leisure',
      },
      {
        day: 8,
        title: 'Final Follow-Up & Fit-to-Fly Certification',
        description: `Final hospital review with your surgeon. Delivery of complete digitized medical records, pathology results, post-travel prescription medications, and official airline Fit-to-Fly clearance.`,
        tag: 'Certification',
      },
      {
        day: 9,
        title: 'Souvenir Shopping & Farewell Dinner',
        description: `Relaxed day for cultural exploration, Ayurvedic wellness massage, and evening farewell dinner with your companion.`,
        tag: 'Wellness',
      },
      {
        day: daysCount,
        title: 'VIP Airport Departure & Return Flight',
        description: `Private chauffeur transfer from hotel to International Airport terminal. Priority check-in assistance and departure flight home with 12-month complimentary teleconsultation access.`,
        tag: 'Departure',
      },
    ];

    res.json({
      success: true,
      procedureName: procedure,
      destinationCity: city,
      totalDays: daysCount,
      itinerary: daySchedule.slice(0, daysCount),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive Conversational AI Assistant
// @route   POST /api/ai/chat
// @access  Public
exports.aiChat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const msgLower = message.toLowerCase();
    let reply = '';

    if (msgLower.includes('visa') || msgLower.includes('e-visa') || msgLower.includes('passport')) {
      reply = `**Indian e-Medical Visa Guidelines:**
1. **Validity & Entry**: The Indian e-Medical Visa is triple-entry and valid for 60 days from arrival (extendable up to 6 months for ongoing therapy).
2. **Medical Attendants**: Up to two accompanying family members or attendants can travel under the **e-Medical Attendant Visa**.
3. **Processing Speed**: Government clearance typically takes 24 to 48 hours online.
4. **Platform Assistance**: MediJourney issues official hospital visa invitation letters free of charge within 4 hours of consultation confirmation.`;
    } else if (msgLower.includes('cost') || msgLower.includes('price') || msgLower.includes('save') || msgLower.includes('cheap')) {
      reply = `**Why Medical Treatment in India is 70%–90% More Affordable:**
- Global surgical implants and robotic systems (e.g. da Vinci, Stryker Mako, CyberKnife) are available at fraction of Western prices due to lower hospital infrastructure and operational overheads.
- Typical savings examples:
  • **Knee/Hip Replacement**: $4,500 in India vs $40,000+ in the US (~88% savings)
  • **Hair Transplant (3,000 grafts)**: $1,200 in India vs $9,000 in the UK (~86% savings)
  • **Full-Mouth Dental Implants**: $3,000 in India vs $25,000 in Australia (~88% savings)
  • **CABG Heart Bypass**: $5,500 in India vs $120,000 in the US (~95% savings)`;
    } else if (msgLower.includes('language') || msgLower.includes('arabic') || msgLower.includes('russian') || msgLower.includes('french') || msgLower.includes('translator')) {
      reply = `**Dedicated Language Assistance:**
- All partner hospitals have dedicated International Patient Lounges staffed with fluent translators in **Arabic, Russian, French, Spanish, Persian, and Bengali**.
- Every teleconsultation and hospital visit includes an assigned bilingual coordinator at no additional charge.`;
    } else if (msgLower.includes('airport') || msgLower.includes('flight') || msgLower.includes('hotel') || msgLower.includes('pickup')) {
      reply = `**Airport & Logistics Coordination:**
- We provide complimentary private chauffeur transfers from international airports in Delhi (DEL), Mumbai (BOM), Chennai (MAA), Bengaluru (BLR), Hyderabad (HYD), and Kochi (COK).
- We partner with 4-star and 5-star recuperation hotels with special sterile post-op rooms, wheelchair access, and custom dietary chef services located within 10–20 minutes of your hospital.`;
    } else {
      reply = `Thank you for reaching out! MediJourney-India connects international patients with JCI and NABH accredited hospitals and internationally acclaimed surgeons across India. 

You can:
1. **Search Procedures**: Explore cosmetic, dental, fertility, cardiology, orthopedics, or oncology treatments.
2. **Book a Free Video Consult**: Speak directly with a Chief Medical Specialist before traveling.
3. **Receive a Visa Invitation Letter**: Guaranteed within 4 hours for speedy visa approval.

How can I assist you with your treatment planning today?`;
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};


