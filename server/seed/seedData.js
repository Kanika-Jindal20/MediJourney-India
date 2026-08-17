const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const DoctorSlot = require('../models/DoctorSlot');
const Treatment = require('../models/Treatment');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

const seedAllData = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await DoctorSlot.deleteMany({});
    await Treatment.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});

    console.log('[Seed] Seeding Users (Admin, Doctors, Patients)...');

    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@medijourney.in',
      password: 'Admin@123456',
      role: 'admin',
      country: 'India',
      phone: '+91-9876543210',
    });

    const doctorUser1 = await User.create({
      fullName: 'Dr. Naresh Trehan',
      email: 'dr.naresh@medanta.org',
      password: 'Doctor@123456',
      role: 'doctor',
      country: 'India',
      phone: '+91-9988776655',
    });

    const doctorUser2 = await User.create({
      fullName: 'Dr. Rashmi Shetty',
      email: 'dr.rashmi@eugenix.com',
      password: 'Doctor@123456',
      role: 'doctor',
      country: 'India',
      phone: '+91-9123456780',
    });

    const patientUser1 = await User.create({
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      password: 'Patient@123456',
      role: 'patient',
      country: 'United Kingdom',
      phone: '+44-7911-123456',
      passportNumber: 'GB9823412',
    });

    const patientUser2 = await User.create({
      fullName: 'Ahmed Al-Mansoori',
      email: 'ahmed.almansoori@gmail.com',
      password: 'Patient@123456',
      role: 'patient',
      country: 'United Arab Emirates',
      phone: '+971-50-1234567',
      passportNumber: 'UAE5521990',
    });

    console.log('[Seed] Seeding Accredited Indian Hospitals...');
    const hospitals = await Hospital.create([
      {
        name: 'Medanta – The Medicity',
        slug: 'medanta-the-medicity-gurugram',
        tagline: 'World-Class Multi-Super Specialty Healthcare Institution',
        city: 'Delhi NCR',
        state: 'Haryana',
        address: 'Sector 38, CH Bakhtawar Singh Road, Gurugram, Haryana 122001',
        airportDistanceKm: 18,
        airportName: 'Indira Gandhi International Airport (DEL)',
        accreditations: ['JCI', 'NABH', 'NABL', 'ISO 9001'],
        specialties: [
          'Cardiology & Heart Surgery',
          'Orthopedics & Joint Replacement',
          'Oncology & Cancer Care',
          'Neuro & Spine Surgery',
          'Organ Transplant',
        ],
        description:
          'Medanta is one of India’s largest multi-super specialty institutes spread over 43 acres with 1,250+ beds, 29 superspecialty departments, and 45 modern operating theaters equipped with da Vinci Xi robotic systems.',
        heroImage:
          'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        ],
        internationalServices: [
          'Dedicated International Patient Lounge',
          'Complimentary Airport Pick-Up & Drop-Off',
          'Full-Time Multi-lingual Translators (Arabic, Russian, French, Uzbek)',
          'Embassy & Medical Visa Extension Desk',
          'Customized Halal / Continental Diet Plans',
          'Private Deluxe Suites with Attendant Stay',
        ],
        facilities: ['Robotic Surgery Center', 'Hybrid Cath Lab', 'Gamma Knife Radiosurgery', 'Air Ambulance'],
        rating: 4.9,
        reviewsCount: 340,
        bedsCount: 1250,
        establishedYear: 2009,
        isFeatured: true,
      },
      {
        name: 'Apollo Hospitals Greams Road',
        slug: 'apollo-hospitals-greams-road-chennai',
        tagline: 'The Forefront of Medical Excellence & Robotic Innovations',
        city: 'Chennai',
        state: 'Tamil Nadu',
        address: '21 Greams Lane, Thousand Lights West, Chennai, Tamil Nadu 600006',
        airportDistanceKm: 14,
        airportName: 'Chennai International Airport (MAA)',
        accreditations: ['JCI', 'NABH', 'NABL'],
        specialties: [
          'Cardiology & Heart Surgery',
          'Oncology & Cancer Care',
          'Orthopedics & Joint Replacement',
          'Organ Transplant',
          'Cosmetic & Plastic Surgery',
        ],
        description:
          'Apollo Chennai is recognized globally as the pioneer of modern private healthcare in India. Renowned for pioneering complex open heart bypass surgeries, proton beam cancer therapy, and multi-organ transplants.',
        heroImage:
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'Dedicated International Patient Coordinators',
          'Direct Airport Transfer Service',
          'Language Translators',
          'Foreign Currency Exchange Desk',
          'Telemedicine Follow-Up Support',
        ],
        facilities: ['South Asia First Proton Beam Therapy', 'CyberKnife', 'Cardiac ICU', 'International Wing'],
        rating: 4.9,
        reviewsCount: 420,
        bedsCount: 600,
        establishedYear: 1983,
        isFeatured: true,
      },
      {
        name: 'Fortis Memorial Research Institute (FMRI)',
        slug: 'fortis-memorial-research-institute-gurugram',
        tagline: 'Next-Generation Quaternary Care Medical Destination',
        city: 'Delhi NCR',
        state: 'Haryana',
        address: 'Sector 44, Opposite HUDA City Centre, Gurugram, Haryana 122002',
        airportDistanceKm: 15,
        airportName: 'Indira Gandhi International Airport (DEL)',
        accreditations: ['JCI', 'NABH', 'NABL'],
        specialties: [
          'Oncology & Cancer Care',
          'Neuro & Spine Surgery',
          'Orthopedics & Joint Replacement',
          'Cosmetic & Plastic Surgery',
          'Fertility & IVF Care',
        ],
        description:
          'FMRI Gurugram is a state-of-the-art super-specialty quaternary care hospital often ranked among the top 30 most technologically advanced hospitals in the world.',
        heroImage:
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'Fast-Track International Admissions',
          'Visa Invitation Letter within 24 Hours',
          'Interpreter Services',
          'Guest House & Hotel Accommodations Assistance',
        ],
        facilities: ['Brain Suite (Intraoperative MRI)', 'da Vinci Surgical Robot', 'Bone Marrow Transplant Unit'],
        rating: 4.8,
        reviewsCount: 285,
        bedsCount: 1000,
        establishedYear: 2013,
        isFeatured: true,
      },
      {
        name: 'Nova IVF Fertility Clinic',
        slug: 'nova-ivf-fertility-mumbai',
        tagline: 'Advanced Reproductive Genetics & Assisted Conception',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'Bandra West, Linking Road, Mumbai, Maharashtra 400050',
        airportDistanceKm: 8,
        airportName: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
        accreditations: ['NABH', 'ISAR'],
        specialties: ['Fertility & IVF Care'],
        description:
          'Nova IVF Fertility is India’s premier network of fertility clinics providing world-class IVF, ICSI, PGT-A (Pre-implantation Genetic Testing), and egg freezing with clinical pregnancy success rates exceeding 70%.',
        heroImage:
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'Confidential International Consultation Desk',
          'Cryo-Preservation Shipping Support',
          'Personalized Treatment Timelines for Overseas Visitors',
          'Affiliated 4-Star Hotel Accommodations',
        ],
        facilities: ['Cleanroom Grade IVF Lab', 'RI Witness Electronic Matching', 'EmbryoScope Time-Lapse Incubators'],
        rating: 4.9,
        reviewsCount: 195,
        bedsCount: 50,
        establishedYear: 2011,
        isFeatured: true,
      },
      {
        name: 'FMS International Dental Center',
        slug: 'fms-international-dental-center-hyderabad',
        tagline: 'Global Leader in All-on-4 Implants & Smile Design',
        city: 'Hyderabad',
        state: 'Telangana',
        address: 'Road No. 37, Jubilee Hills, Hyderabad, Telangana 500033',
        airportDistanceKm: 32,
        airportName: 'Rajiv Gandhi International Airport (HYD)',
        accreditations: ['NABH', 'ICOI', 'ISO 9001'],
        specialties: ['Dental Treatments', 'Cosmetic & Plastic Surgery'],
        description:
          'One of Asia’s largest independent dental hospitals featuring 55 multi-specialty dental operatories, in-house CAD-CAM zirconia milling labs, and full-mouth rehabilitation in 3 days.',
        heroImage:
          'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'Dental Vacation Concierge',
          'Same-Day Zirconia Crowns & Veneers',
          'Airport Chauffeur Service',
          'Customized Hyderabad Sightseeing Packages',
        ],
        facilities: ['In-house 3D CBCT Imaging', 'CAD/CAM Milling Lab', 'Conscious Sedation Suites'],
        rating: 4.9,
        reviewsCount: 510,
        bedsCount: 30,
        establishedYear: 1993,
        isFeatured: true,
      },
      {
        name: 'Eugenix Hair Sciences & Aesthetics',
        slug: 'eugenix-hair-sciences-delhi-mumbai',
        tagline: 'World-Renowned Direct Hair Transplantation (DHT) Specialists',
        city: 'Delhi NCR',
        state: 'Delhi',
        address: '898 Noton Road, South Extension Part II, New Delhi 110049',
        airportDistanceKm: 12,
        airportName: 'Indira Gandhi International Airport (DEL)',
        accreditations: ['NABH', 'ISHRS', 'IADVL'],
        specialties: ['Hair Restoration', 'Cosmetic & Plastic Surgery'],
        description:
          'World-famous hair transplant center founded by Dr. Pradeep Sethi and Dr. Arika Bansal. Inventors of the patented Direct Hair Transplant (DHT) technique, trusted by international athletes, celebrities, and global patients.',
        heroImage:
          'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'VIP Chauffeur & Airport Greeting',
          'Luxury Suite Accommodation included in 3000+ graft packages',
          'Post-Op Wash & Care Kits for Travel',
          '1-Year Global Tele-Monitoring',
        ],
        facilities: ['HEPA Filtered Surgical Suites', 'Microscopic Graft Sorting Station', 'Trichology Suite'],
        rating: 5.0,
        reviewsCount: 680,
        bedsCount: 20,
        establishedYear: 2010,
        isFeatured: true,
      },
      {
        name: 'Manipal Hospital HAL Airport Road',
        slug: 'manipal-hospital-bengaluru',
        tagline: 'Premier Quaternary Care and Robotic Joint Replacement Center',
        city: 'Bengaluru',
        state: 'Karnataka',
        address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
        airportDistanceKm: 38,
        airportName: 'Kempegowda International Airport (BLR)',
        accreditations: ['JCI', 'NABH', 'NABL'],
        specialties: [
          'Orthopedics & Joint Replacement',
          'Cardiology & Heart Surgery',
          'Oncology & Cancer Care',
          'Neuro & Spine Surgery',
        ],
        description:
          'Manipal Hospital is a premier quaternary hospital in Bangalore with cutting-edge robotic joint replacements (Mako Robotic Arm), comprehensive oncology center, and organ transplant departments.',
        heroImage:
          'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'International Patient Service Lounge',
          'Customized Physical Rehabilitation Programs',
          'Multi-lingual Interpreters',
        ],
        facilities: ['Mako Robotic Knee System', 'Comprehensive Cancer Care', 'Nuclear Medicine'],
        rating: 4.8,
        reviewsCount: 310,
        bedsCount: 650,
        establishedYear: 1991,
        isFeatured: true,
      },
      {
        name: 'Aster Medcity',
        slug: 'aster-medcity-kochi-kerala',
        tagline: 'Waterfront Medical Destination for Holistic Care & Surgery',
        city: 'Kochi',
        state: 'Kerala',
        address: 'Kuttisahib Road, Near Kothad Bridge, Cheranallur, South Chittoor, Kochi 682027',
        airportDistanceKm: 26,
        airportName: 'Cochin International Airport (COK)',
        accreditations: ['JCI', 'NABH', 'NABL'],
        specialties: [
          'Ayurveda & Wellness',
          'Cardiology & Heart Surgery',
          'Orthopedics & Joint Replacement',
          'Cosmetic & Plastic Surgery',
        ],
        description:
          'Aster Medcity is a 670-bed world-class medical city situated in a serene 45-acre waterfront campus in Kochi, offering cutting-edge surgical care combined with Kerala post-operative wellness and Ayurvedic recovery.',
        heroImage:
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        internationalServices: [
          'Waterfront Serene Recovery Cottages',
          'Yacht & Airport Chauffeur Options',
          'Ayurvedic Post-Operative Rehabilitation',
          'Multi-lingual Arab & European Patient Desks',
        ],
        facilities: ['Minimal Access Robotic Surgery', 'Integrated Holistic Wellness Center', 'Pediatric ICU'],
        rating: 4.9,
        reviewsCount: 220,
        bedsCount: 670,
        establishedYear: 2014,
        isFeatured: true,
      },
    ]);

    console.log('[Seed] Seeding Medical Treatments & Global Cost Comparisons...');
    const treatments = await Treatment.create([
      {
        name: 'All-on-4 / All-on-6 Full Mouth Dental Implants',
        slug: 'all-on-4-dental-implants',
        category: 'Dental Treatments',
        shortSummary:
          'Complete arch restoration with premium titanium or zirconia implants and fixed prosthetic bridge.',
        description:
          'All-on-4 dental implants replace an entire arch of missing or damaged teeth using only four strategically angled titanium implants, providing immediate loading and functional natural smile within 3-5 days.',
        avgStayDays: 3,
        avgRecoveryDays: 5,
        successRate: '98.5%',
        costIndiaUSD: 1800,
        costUSAUSD: 24000,
        costUKUSD: 14000,
        costThailandUSD: 4500,
        costUAEUSD: 12000,
        costSingaporeUSD: 16000,
        procedureSteps: [
          '3D CBCT Scan and Digital Smile Design planning',
          'Gentle extraction and computer-guided implant placement',
          'Immediate fabrication of high-grade provisional bridge',
          'Final permanent zirconia bridge placement and occlusion adjustment',
        ],
        inclusions: [
          'Straumann / Nobel Biocare Implants',
          '3D CBCT Diagnostic Imaging',
          'Permanent Zirconia Screw-Retained Bridge',
          'Lifetime International Manufacturer Warranty',
          'Complimentary Airport Pick-Up',
        ],
        idealCandidates: 'Patients with extensive tooth loss, severe periodontal disease, or uncomfortable dentures.',
        heroImage:
          'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'Direct Hair Transplant (DHT) & High-Density FUE (3,500 Grafts)',
        slug: 'hair-transplant-fue-dht',
        category: 'Hair Restoration',
        shortSummary:
          'Natural hairline restoration using simultaneous extraction and ultra-fine graft implantation.',
        description:
          'State-of-the-art hair restoration utilizing the Direct Hair Transplant (DHT) technique where follicles are extracted and implanted simultaneously, reducing out-of-body time to near zero for maximum graft survival and 100% natural density.',
        avgStayDays: 2,
        avgRecoveryDays: 4,
        successRate: '99%',
        costIndiaUSD: 1600,
        costUSAUSD: 12000,
        costUKUSD: 9500,
        costThailandUSD: 3800,
        costUAEUSD: 7000,
        costSingaporeUSD: 8500,
        procedureSteps: [
          'Artistic hairline design and digital graft count calculation',
          'Local anesthesia and microscopic follicle harvesting',
          'Direct implantation with specialized patented sapphire/titanium implanters',
          'Post-op head wash, laser therapy, and travel clearance',
        ],
        inclusions: [
          '3,500 High-Density Grafts',
          'Specialist Surgeon Execution',
          'PRP / Growth Factor Therapy Session',
          'Post-Op Wash Kit & 6-Month Medication Supply',
          'Luxury Hotel Transfer',
        ],
        idealCandidates: 'Men and women suffering from androgenetic alopecia (Norwood Grade 2 to 6).',
        heroImage:
          'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'IVF (In-Vitro Fertilization) with ICSI & PGT-A',
        slug: 'ivf-icsi-fertility-treatment',
        category: 'Fertility & IVF Care',
        shortSummary:
          'Advanced assisted reproductive technology cycle with intracytoplasmic sperm injection and genetic screening.',
        description:
          'Comprehensive IVF cycle incorporating ICSI, blastocyst culture, and optional Pre-implantation Genetic Testing for Aneuploidies (PGT-A) to achieve high clinical pregnancy rates for couples facing infertility.',
        avgStayDays: 14,
        avgRecoveryDays: 3,
        successRate: '72%',
        costIndiaUSD: 3200,
        costUSAUSD: 22000,
        costUKUSD: 15000,
        costThailandUSD: 8000,
        costUAEUSD: 14000,
        costSingaporeUSD: 16500,
        procedureSteps: [
          'Ovarian stimulation & ultrasound follicle monitoring',
          'Ultrasound-guided egg retrieval under mild anesthesia',
          'ICSI fertilization and blastocyst incubator cultivation',
          'Embryo transfer and hormonal support management',
        ],
        inclusions: [
          'All Stimulation Medications & Hormonal Injections',
          'Egg Retrieval & ICSI Laboratory Fees',
          'Blastocyst Culture & Embryo Freezing for 1 Year',
          'Dedicated Fertility Counselor & Translator',
        ],
        idealCandidates: 'Couples experiencing unexplained infertility, blocked fallopian tubes, or low sperm motility.',
        heroImage:
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'Rhinoplasty & Facial Sculpting (Cosmetic Nose Surgery)',
        slug: 'rhinoplasty-facial-surgery',
        category: 'Cosmetic & Plastic Surgery',
        shortSummary:
          'Aesthetic and functional nasal reshaping by board-certified plastic and reconstructive surgeons.',
        description:
          'Precision open or closed rhinoplasty to refine the nasal bridge, tip, nostrils, and correct deviated nasal septum (septorhinoplasty) for improved breathing and facial harmony.',
        avgStayDays: 3,
        avgRecoveryDays: 7,
        successRate: '97%',
        costIndiaUSD: 2200,
        costUSAUSD: 11500,
        costUKUSD: 8000,
        costThailandUSD: 4000,
        costUAEUSD: 7500,
        costSingaporeUSD: 9000,
        procedureSteps: [
          'Pre-operative 3D morphing consultation',
          'Surgical reshaping of cartilage and nasal bone structure',
          'Internal splint and protective nasal cast application',
          'Cast removal and final recovery check on Day 6',
        ],
        inclusions: [
          'Board-Certified Plastic Surgeon & Anesthesiologist Fees',
          '1-Night Hospital Stay in Private Room',
          'Post-Surgical Medications and Splints',
          'Airport Transportation',
        ],
        idealCandidates: 'Individuals seeking cosmetic refinement of the nose or relief from structural airway obstruction.',
        heroImage:
          'https://images.unsplash.com/photo-1512290900672-1f02e6a09028?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'Robotic Total Knee Replacement (Bilateral / Single)',
        slug: 'robotic-total-knee-replacement',
        category: 'Orthopedics & Joint Replacement',
        shortSummary:
          'Sub-millimeter accurate joint replacement with Mako or CORI robotic systems for rapid recovery.',
        description:
          'Robotic-assisted knee arthroplasty offering precise implant alignment, minimal soft tissue damage, significantly reduced post-operative pain, and patient walking on the same day.',
        avgStayDays: 5,
        avgRecoveryDays: 14,
        successRate: '99%',
        costIndiaUSD: 5200,
        costUSAUSD: 45000,
        costUKUSD: 24000,
        costThailandUSD: 12000,
        costUAEUSD: 22000,
        costSingaporeUSD: 28000,
        procedureSteps: [
          'Pre-operative CT scan and 3D virtual joint modeling',
          'Robotic arm guided bone resection and ligament balancing',
          'High-flexion FDA-approved prosthetic knee implant insertion',
          'Physiotherapy and supervised gait training starting Day 1',
        ],
        inclusions: [
          'US-FDA Approved Knee Implants (Zimmer Biomet / Stryker)',
          'Robotic System Usage & Surgeon Fees',
          '5-Day Private Room Hospital Stay with Nurse & Food',
          'Daily In-Hospital Physiotherapy',
        ],
        idealCandidates: 'Patients with severe osteoarthritis, chronic knee stiffness, or joint degeneration.',
        heroImage:
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'Coronary Artery Bypass Grafting (CABG / Heart Bypass)',
        slug: 'cabg-coronary-artery-bypass',
        category: 'Cardiology & Heart Surgery',
        shortSummary:
          'Beating heart bypass surgery performed by internationally trained cardiac surgical teams.',
        description:
          'Off-pump (beating heart) or minimally invasive CABG to restore blood flow to obstructed coronary arteries with minimal blood transfusion requirements and fast rehabilitation.',
        avgStayDays: 8,
        avgRecoveryDays: 21,
        successRate: '99.2%',
        costIndiaUSD: 6500,
        costUSAUSD: 130000,
        costUKUSD: 55000,
        costThailandUSD: 19000,
        costUAEUSD: 38000,
        costSingaporeUSD: 42000,
        procedureSteps: [
          'Coronary Angiography and surgical mapping',
          'Harvesting of internal mammary artery and saphenous vein grafts',
          'Beating heart bypass anastomosis without heart-lung machine',
          'Cardiac ICU recovery followed by step-down cardiac rehabilitation',
        ],
        inclusions: [
          'Full Cardiac Surgery Team & Perfusionist',
          '3 Days Cardiac ICU + 5 Days Deluxe Inpatient Suite',
          'All Diagnostic Cath Lab and Echo Testing',
          'Cardiac Rehabilitation Sessions & Medical Visa Support',
        ],
        idealCandidates: 'Patients diagnosed with severe multi-vessel coronary artery disease or angina.',
        heroImage:
          'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'CyberKnife & Proton Beam Radiotherapy for Cancer',
        slug: 'cyberknife-proton-radiosurgery',
        category: 'Oncology & Cancer Care',
        shortSummary:
          'Non-invasive, robotic precision radiation targeting tumors with sub-millimeter accuracy.',
        description:
          'State-of-the-art radiosurgery that delivers high-dose radiation beams directly to tumors in the brain, lung, prostate, liver, or spine without open incisions or damage to healthy surrounding tissue.',
        avgStayDays: 4,
        avgRecoveryDays: 3,
        successRate: '95%',
        costIndiaUSD: 7800,
        costUSAUSD: 85000,
        costUKUSD: 40000,
        costThailandUSD: 16000,
        costUAEUSD: 30000,
        costSingaporeUSD: 35000,
        procedureSteps: [
          'High-resolution 4D CT / MRI tumor localization',
          'Custom computer-calculated beam delivery plan',
          '1 to 5 painless outpatient CyberKnife treatment sessions',
          'Post-treatment follow-up and tumor response scan',
        ],
        inclusions: [
          'Complete Radiation Oncology & Medical Physicist Planning',
          'All Robotic CyberKnife Delivery Fractions',
          'Diagnostic Imaging & Contrast Scans',
          'International Patient Coordinator Service',
        ],
        idealCandidates: 'Patients with localized brain, spine, lung, prostate, or inoperable recurrent tumors.',
        heroImage:
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
        isPopular: true,
      },
      {
        name: 'Authentic Kerala Panchakarma & Post-Surgery Rejuvenation',
        slug: 'kerala-panchakarma-wellness',
        category: 'Ayurveda & Wellness',
        shortSummary:
          'Traditional 5-action Ayurvedic detoxification, pain relief, and post-operative healing.',
        description:
          'Holistic healthcare therapy administered by certified Ayurvedic Vaidyas using medicated herbal oils, Abhyanga, Shirodhara, and customized organic nutrition to revitalize body metabolism and support chronic healing.',
        avgStayDays: 10,
        avgRecoveryDays: 0,
        successRate: '99%',
        costIndiaUSD: 1200,
        costUSAUSD: 8500,
        costUKUSD: 6000,
        costThailandUSD: 2800,
        costUAEUSD: 4500,
        costSingaporeUSD: 5200,
        procedureSteps: [
          'Ayurvedic Pulse Diagnosis (Nadi Pariksha) and Prakriti determination',
          'Daily therapeutic Abhyanga massage and steam therapies',
          'Specialized Panchakarma cleansing protocols (Shirodhara, Basti)',
          'Herbal rejuvenation regimen and yoga meditation training',
        ],
        inclusions: [
          '10 Nights Stay in Waterfront Ayurvedic Retreat',
          'All Daily Ayurvedic Treatments & Organic Herbal Medicines',
          'All Sattvic Meals & Doctor Consultations',
          'Airport Chauffeur Transfer in Kochi',
        ],
        idealCandidates: 'Individuals suffering from chronic pain, arthritis, stress, or seeking post-surgery organic detox.',
        heroImage:
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
        isPopular: false,
      },
    ]);

    console.log('[Seed] Seeding Specialist Doctors...');
    const doctors = await Doctor.create([
      {
        userId: doctorUser1._id,
        hospitalId: hospitals[0]._id, // Medanta
        fullName: 'Dr. Naresh Trehan',
        title: 'Chairman & Chief Cardiac Surgeon',
        specialty: 'Cardiology & Heart Surgery',
        subSpecialties: ['CABG', 'Minimally Invasive Valve Surgery', 'Robotic Heart Surgery'],
        qualifications: 'MBBS, MS, Diplomate American Board of Cardiothoracic Surgery',
        experienceYears: 38,
        languagesSpoken: ['English', 'Hindi', 'Punjabi'],
        consultationFeeUSD: 60,
        bio: 'Dr. Naresh Trehan is a world-renowned cardiovascular surgeon with over 48,000 successful open-heart surgeries to his credit. Former faculty at New York University Medical Center and recipient of Padma Bhushan.',
        avatarUrl:
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 48000,
        rating: 5.0,
        reviewsCount: 380,
        isAvailable: true,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        hospitalId: hospitals[0]._id, // Medanta
        fullName: 'Dr. Ashok Rajgopal',
        title: 'Group Chairman – Institute of Musculoskeletal Disorders',
        specialty: 'Orthopedics & Joint Replacement',
        subSpecialties: ['Robotic Knee Replacement', 'Hip Arthroplasty', 'Sports Medicine'],
        qualifications: 'MBBS, MS (Ortho), MCh, FRCS (England)',
        experienceYears: 35,
        languagesSpoken: ['English', 'Hindi'],
        consultationFeeUSD: 50,
        bio: 'Internationally recognized orthopedic surgeon who has performed over 30,000 total knee arthroplasties. Pioneer in computer-assisted and minimally invasive knee surgery in Asia.',
        avatarUrl:
          'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 32000,
        rating: 4.9,
        reviewsCount: 290,
        isAvailable: true,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
      },
      {
        hospitalId: hospitals[1]._id, // Apollo Chennai
        fullName: 'Dr. S. K. Gupta',
        title: 'Senior Consultant Plastic & Reconstructive Surgeon',
        specialty: 'Cosmetic & Plastic Surgery',
        subSpecialties: ['Rhinoplasty', 'Facelift', 'Body Contouring', 'Breast Aesthetics'],
        qualifications: 'MBBS, MS, MCh (Plastic Surgery), Fellow International College of Surgeons (USA)',
        experienceYears: 24,
        languagesSpoken: ['English', 'Tamil', 'Hindi', 'Arabic'],
        consultationFeeUSD: 45,
        bio: 'Celebrated plastic surgeon specializing in complex aesthetic facial sculpting, advanced rhinoplasty, and body contouring for international clientele from Europe, Middle East, and North America.',
        avatarUrl:
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 9500,
        rating: 4.9,
        reviewsCount: 215,
        isAvailable: true,
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      },
      {
        userId: doctorUser2._id,
        hospitalId: hospitals[5]._id, // Eugenix
        fullName: 'Dr. Pradeep Sethi & Dr. Arika Bansal',
        title: 'Founders & Master Hair Transplant Surgeons',
        specialty: 'Hair Restoration',
        subSpecialties: ['Direct Hair Transplant (DHT)', 'Beard Reconstruction', 'Corrective Hair Surgery'],
        qualifications: 'MD (AIIMS New Delhi), Diplomate of American Board of Hair Restoration Surgery (ABHRS)',
        experienceYears: 18,
        languagesSpoken: ['English', 'Hindi', 'Russian'],
        consultationFeeUSD: 50,
        bio: 'AIIMS alumni and innovators of the DHT hair transplantation protocol. Eugenix is globally endorsed by the International Alliance of Hair Restoration Surgeons (IAHRS).',
        avatarUrl:
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 14000,
        rating: 5.0,
        reviewsCount: 520,
        isAvailable: true,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      {
        hospitalId: hospitals[4]._id, // FMS Dental Hyderabad
        fullName: 'Dr. P. P. Reddy',
        title: 'Director & Chief Implantologist',
        specialty: 'Dental Treatments',
        subSpecialties: ['All-on-4 Implants', 'Zygomatic Implants', 'Digital Smile Design'],
        qualifications: 'BDS, MDS (Prosthodontics), Fellow ICOI (USA), Diplomate ISOI',
        experienceYears: 26,
        languagesSpoken: ['English', 'Telugu', 'Hindi', 'Arabic'],
        consultationFeeUSD: 30,
        bio: 'One of India’s most prolific implantologists, having placed over 20,000 dental implants with computer-guided surgical templates and immediate loading protocols.',
        avatarUrl:
          'https://images.unsplash.com/photo-1594824813511-2092576b5d92?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 22000,
        rating: 4.9,
        reviewsCount: 410,
        isAvailable: true,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        hospitalId: hospitals[3]._id, // Nova IVF Mumbai
        fullName: 'Dr. Sulbha Arora',
        title: 'Clinical Director & Reproductive Medicine Specialist',
        specialty: 'Fertility & IVF Care',
        subSpecialties: ['IVF / ICSI', 'Recurrent Implantation Failure', 'Egg Freezing'],
        qualifications: 'MBBS, MD, DNB (Obstetrics & Gynecology), Fellowship in Reproductive Medicine (UK)',
        experienceYears: 20,
        languagesSpoken: ['English', 'Marathi', 'Hindi', 'French'],
        consultationFeeUSD: 40,
        bio: 'Distinguished fertility specialist trained in the UK, dedicated to helping international couples achieve parenthood through advanced genetic embryo testing and individualized IVF stimulation protocols.',
        avatarUrl:
          'https://images.unsplash.com/photo-1594824813511-2092576b5d92?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 8200,
        rating: 4.9,
        reviewsCount: 180,
        isAvailable: true,
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        hospitalId: hospitals[2]._id, // Fortis FMRI
        fullName: 'Dr. Vinod Raina',
        title: 'Chairman – Medical Oncology & Hematology',
        specialty: 'Oncology & Cancer Care',
        subSpecialties: ['Bone Marrow Transplant', 'Targeted Immunotherapy', 'CyberKnife Radiosurgery'],
        qualifications: 'MBBS, MD (Medicine), MRCP (UK), FRCP (Edinburgh, London)',
        experienceYears: 32,
        languagesSpoken: ['English', 'Hindi', 'Kashmiri'],
        consultationFeeUSD: 55,
        bio: 'Pioneer of medical oncology in India, former Head of Oncology at AIIMS New Delhi. Performed the first high-dose chemotherapy and autologous stem cell transplant in India.',
        avatarUrl:
          'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
        surgeriesCount: 6500,
        rating: 4.9,
        reviewsCount: 310,
        isAvailable: true,
        availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
      },
    ]);

    console.log('[Seed] Seeding Doctor Availability Slots...');
    const today = new Date();
    const timeSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

    for (const doc of doctors) {
      for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const slotDateObj = new Date(today);
        slotDateObj.setDate(today.getDate() + dayOffset);
        const slotDateStr = slotDateObj.toISOString().split('T')[0];

        for (const time of timeSlots) {
          await DoctorSlot.create({
            doctorId: doc._id,
            slotDate: slotDateStr,
            startTime: time,
            endTime: time.replace('00', '30').replace('30', '00'),
            slotType: 'teleconsultation',
            isBooked: false,
          });
        }
      }
    }

    console.log('[Seed] Seeding Initial Appointments & Consultation Requests...');
    const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeDaysStr = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const appt1 = await Appointment.create({
      appointmentRef: 'MJ-2026-UK781',
      patientId: patientUser1._id,
      patientName: 'Sarah Jenkins',
      patientEmail: 'sarah.jenkins@gmail.com',
      patientPhone: '+44-7911-123456',
      patientCountry: 'United Kingdom',
      passportNumber: 'GB9823412',
      doctorId: doctors[3]._id, // Dr. Pradeep Sethi (Eugenix)
      hospitalId: hospitals[5]._id,
      treatmentId: treatments[1]._id, // Hair Transplant
      appointmentDate: tomorrowStr,
      timeSlot: '11:30 AM',
      consultationType: 'teleconsultation',
      status: 'pending',
      symptomsDescription:
        'Seeking hairline restoration and temple density enhancement (approx 3,000-3,500 grafts). Looking to travel to New Delhi in October 2026. Requesting quotation and graft count estimate.',
      preferredLanguage: 'English',
      visaAssistanceRequired: true,
      airportPickupRequired: true,
    });

    const appt2 = await Appointment.create({
      appointmentRef: 'MJ-2026-UAE419',
      patientId: patientUser2._id,
      patientName: 'Ahmed Al-Mansoori',
      patientEmail: 'ahmed.almansoori@gmail.com',
      patientPhone: '+971-50-1234567',
      patientCountry: 'United Arab Emirates',
      passportNumber: 'UAE5521990',
      doctorId: doctors[0]._id, // Dr. Naresh Trehan (Medanta)
      hospitalId: hospitals[0]._id,
      treatmentId: treatments[5]._id, // CABG Heart
      appointmentDate: threeDaysStr,
      timeSlot: '02:00 PM',
      consultationType: 'teleconsultation',
      status: 'confirmed',
      symptomsDescription:
        'Triple vessel coronary artery disease diagnosed in Dubai. Seeking second opinion on minimally invasive beating heart CABG vs stenting, hospital stay timeline, and visa assistance for my wife and me.',
      preferredLanguage: 'Arabic',
      visaAssistanceRequired: true,
      airportPickupRequired: true,
      doctorNotes:
        'Reviewed angiography CD. Patient is an ideal candidate for off-pump MIDCAB. Hospital invitation letter prepared for Indian Embassy in Abu Dhabi.',
    });

    console.log('[Seed] Seeding Verified Patient Reviews...');
    await Review.create([
      {
        patientName: 'Michael Davies',
        patientCountry: 'United Kingdom',
        hospitalId: hospitals[4]._id,
        doctorId: doctors[4]._id,
        treatmentCategory: 'Dental Treatments',
        rating: 5,
        comment:
          'Had full mouth All-on-4 dental implants at FMS Hyderabad. Saved over £15,000 compared to London quotes. The clinic has better equipment than most private clinics in Harley Street. Flawless experience from airport pickup to final zirconia bridge!',
      },
      {
        patientName: 'Kareem & Fatima Al-Sayed',
        patientCountry: 'Oman',
        hospitalId: hospitals[3]._id,
        doctorId: doctors[5]._id,
        treatmentCategory: 'Fertility & IVF Care',
        rating: 5,
        comment:
          'After 5 years of failed IVF attempts in the Gulf, we came to Nova IVF Mumbai. Dr. Sulbha and the embryology team were incredible. We are now blessed with healthy twins! India’s medical care is top-tier.',
      },
      {
        patientName: 'David Miller',
        patientCountry: 'United States',
        hospitalId: hospitals[0]._id,
        doctorId: doctors[0]._id,
        treatmentCategory: 'Cardiology & Heart Surgery',
        rating: 5,
        comment:
          'Dr. Naresh Trehan at Medanta performed my bypass surgery. In the US, the procedure was quoted at $140,000 without full insurance coverage. Medanta charged under $7,000 including a private suite and post-op care. A lifesaver!',
      },
      {
        patientName: 'Alexander Petrov',
        patientCountry: 'Russia',
        hospitalId: hospitals[5]._id,
        doctorId: doctors[3]._id,
        treatmentCategory: 'Hair Restoration',
        rating: 5,
        comment:
          'Traveled from Moscow to Eugenix Delhi for 3,800 grafts DHT. Russian translator was with me throughout. The precision and density look 100% natural. Best hair restoration center on earth.',
      },
    ]);

    console.log('=====================================================');
    console.log('✅ SEEDING COMPLETE! Platform is pre-populated with:');
    console.log(`- ${await Hospital.countDocuments()} Accredited Multi-Specialty Hospitals`);
    console.log(`- ${await Doctor.countDocuments()} Top Specialists & Surgeons`);
    console.log(`- ${await Treatment.countDocuments()} Medical Treatments with Global Cost Benchmarks`);
    console.log(`- ${await DoctorSlot.countDocuments()} Available Consultation Slots`);
    console.log(`- ${await Appointment.countDocuments()} Active Patient Consultation Requests`);
    console.log(`- ${await Review.countDocuments()} Verified Global Patient Reviews`);
    console.log('=====================================================');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

// If run directly via `node seed/seedData.js`
if (require.main === module) {
  connectDB().then(async () => {
    await seedAllData();
    process.exit(0);
  });
}

module.exports = seedAllData;
