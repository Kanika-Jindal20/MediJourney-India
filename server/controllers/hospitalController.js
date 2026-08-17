const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Review = require('../models/Review');

// @desc    Get all hospitals with filtering & search
// @route   GET /api/hospitals
// @access  Public
exports.getHospitals = async (req, res, next) => {
  try {
    const { city, specialty, accreditation, search, minRating, isFeatured } = req.query;
    let query = {};

    if (city && city !== 'All') {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    if (specialty && specialty !== 'All') {
      query.specialties = { $in: [new RegExp(specialty, 'i')] };
    }

    if (accreditation && accreditation !== 'All') {
      query.accreditations = { $in: [accreditation] };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { description: searchRegex },
        { specialties: searchRegex },
      ];
    }

    const hospitals = await Hospital.find(query).sort({ rating: -1, isFeatured: -1 });

    res.json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital by ID or Slug with doctors and reviews
// @route   GET /api/hospitals/:idOrSlug
// @access  Public
exports.getHospital = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let hospital;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      hospital = await Hospital.findById(idOrSlug);
    } else {
      hospital = await Hospital.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Fetch affiliated doctors
    const doctors = await Doctor.find({ hospitalId: hospital._id }).sort({ experienceYears: -1 });

    // Fetch reviews
    const reviews = await Review.find({ hospitalId: hospital._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      hospital,
      doctors,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured hospitals
// @route   GET /api/hospitals/featured
// @access  Public
exports.getFeaturedHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({ isFeatured: true }).limit(6);
    res.json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of unique cities with healthcare counts
// @route   GET /api/hospitals/cities
// @access  Public
exports.getCities = async (req, res, next) => {
  try {
    const citiesAggregation = await Hospital.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          airport: { $first: '$airportName' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      cities: citiesAggregation.map((c) => ({
        name: c._id,
        hospitalCount: c.count,
        airport: c.airport,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hospital (Admin only)
// @route   POST /api/hospitals
// @access  Private/Admin
exports.createHospital = async (req, res, next) => {
  try {
    const { name, city, state, address, accreditations, specialties, description, heroImage, airportDistanceKm, airportName, internationalServices } = req.body;

    if (!name || !city || !description) {
      return res.status(400).json({ success: false, message: 'Please provide name, city, and description' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const hospital = await Hospital.create({
      name,
      slug,
      city,
      state: state || 'India',
      address,
      airportDistanceKm: airportDistanceKm || 15,
      airportName: airportName || `${city} International Airport`,
      accreditations: Array.isArray(accreditations) ? accreditations : (accreditations ? accreditations.split(',').map(s => s.trim()) : ['NABH']),
      specialties: Array.isArray(specialties) ? specialties : (specialties ? specialties.split(',').map(s => s.trim()) : []),
      description,
      heroImage: heroImage || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
      internationalServices: internationalServices || ['Dedicated International Patient Lounge', 'Airport Pickup', 'Medical Visa Support'],
      isFeatured: req.body.isFeatured || false,
    });

    res.status(201).json({
      success: true,
      hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital (Admin only)
// @route   PUT /api/hospitals/:id
// @access  Private/Admin
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({
      success: true,
      hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hospital (Admin only)
// @route   DELETE /api/hospitals/:id
// @access  Private/Admin
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({
      success: true,
      message: 'Hospital removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
