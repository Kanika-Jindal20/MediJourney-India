const Treatment = require('../models/Treatment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// @desc    Get all treatments with category filtering & search
// @route   GET /api/treatments
// @access  Public
exports.getTreatments = async (req, res, next) => {
  try {
    const { category, search, isPopular } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = new RegExp(category, 'i');
    }

    if (isPopular === 'true') {
      query.isPopular = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { shortSummary: searchRegex },
        { description: searchRegex },
      ];
    }

    const treatments = await Treatment.find(query).sort({ isPopular: -1, costIndiaUSD: 1 });

    res.json({
      success: true,
      count: treatments.length,
      treatments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single treatment by slug or id
// @route   GET /api/treatments/:slugOrId
// @access  Public
exports.getTreatment = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let treatment;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      treatment = await Treatment.findById(slugOrId);
    } else {
      treatment = await Treatment.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    // Find recommended doctors specializing in this field
    const specialtyKeyword = treatment.category.split(' ')[0];
    const doctors = await Doctor.find({
      $or: [
        { specialty: new RegExp(specialtyKeyword, 'i') },
        { specialty: new RegExp(treatment.name, 'i') },
      ],
    })
      .populate('hospitalId')
      .limit(6);

    // Find hospitals offering this specialty
    const hospitals = await Hospital.find({
      $or: [
        { specialties: new RegExp(specialtyKeyword, 'i') },
        { description: new RegExp(treatment.name, 'i') },
      ],
    }).limit(6);

    res.json({
      success: true,
      treatment,
      recommendedDoctors: doctors,
      topHospitals: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare multiple treatments or procedures side-by-side
// @route   GET /api/treatments/compare/items
// @access  Public
exports.compareTreatments = async (req, res, next) => {
  try {
    const { ids } = req.query; // comma-separated ids or slugs
    if (!ids) {
      // Default to 3 popular treatments if none specified
      const popular = await Treatment.find({ isPopular: true }).limit(3);
      return res.json({ success: true, treatments: popular });
    }

    const idList = ids.split(',').map((id) => id.trim());
    const treatments = await Treatment.find({
      $or: [
        { _id: { $in: idList.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
        { slug: { $in: idList } },
      ],
    });

    res.json({
      success: true,
      count: treatments.length,
      treatments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create treatment (Admin only)
// @route   POST /api/treatments
// @access  Private/Admin
exports.createTreatment = async (req, res, next) => {
  try {
    const { name, category, shortSummary, description, avgStayDays, avgRecoveryDays, costIndiaUSD, costUSAUSD, costUKUSD, costThailandUSD, procedureSteps, inclusions, heroImage, isPopular } = req.body;

    if (!name || !category || !costIndiaUSD || !description) {
      return res.status(400).json({ success: false, message: 'Please provide name, category, cost and description' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const treatment = await Treatment.create({
      name,
      slug,
      category,
      shortSummary: shortSummary || description.slice(0, 120),
      description,
      avgStayDays: avgStayDays || 3,
      avgRecoveryDays: avgRecoveryDays || 7,
      costIndiaUSD,
      costUSAUSD: costUSAUSD || costIndiaUSD * 5,
      costUKUSD: costUKUSD || costIndiaUSD * 4,
      costThailandUSD: costThailandUSD || costIndiaUSD * 1.5,
      procedureSteps: Array.isArray(procedureSteps) ? procedureSteps : ['Initial Medical Evaluation & Diagnostic Testing', 'Procedure Execution by Specialist Team', 'Post-Op Observation in Dedicated Recovery Suite', 'Discharge & Follow-Up Review'],
      inclusions: Array.isArray(inclusions) ? inclusions : ['Consultation & Diagnostics', 'Surgical / Procedure Team Fees', 'Hospital Stay & Medications', 'Airport Pick-Up Assistance'],
      heroImage: heroImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      isPopular: isPopular || false,
    });

    res.status(201).json({
      success: true,
      treatment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update treatment (Admin only)
// @route   PUT /api/treatments/:id
// @access  Private/Admin
exports.updateTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    res.json({
      success: true,
      treatment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete treatment (Admin only)
// @route   DELETE /api/treatments/:id
// @access  Private/Admin
exports.deleteTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    res.json({
      success: true,
      message: 'Treatment removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
