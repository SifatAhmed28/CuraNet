const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// Comprehensive coordinate and area map for all 46 Bangladesh postcodes / locations in CSV
const LOCATION_GEO_MAP = {
  // Dhaka Metropolitan & Greater Dhaka
  'Dhaka-1205': { city: 'Dhaka', district: 'Dhaka', area: 'Dhanmondi', coordinates: [90.3753, 23.7465] },
  'Dhaka-1209': { city: 'Dhaka', district: 'Dhaka', area: 'Dhanmondi / Jigatola', coordinates: [90.3700, 23.7380] },
  'Dhaka-1216': { city: 'Dhaka', district: 'Dhaka', area: 'Mirpur', coordinates: [90.3657, 23.8065] },
  '1216': { city: 'Dhaka', district: 'Dhaka', area: 'Mirpur', coordinates: [90.3657, 23.8065] },
  'Dhaka-1207': { city: 'Dhaka', district: 'Dhaka', area: 'Mohammadpur', coordinates: [90.3620, 23.7630] },
  '1207': { city: 'Dhaka', district: 'Dhaka', area: 'Mohammadpur', coordinates: [90.3620, 23.7630] },
  'Dhaka-1217': { city: 'Dhaka', district: 'Dhaka', area: 'Shantinagar / Malibagh', coordinates: [90.4120, 23.7410] },
  'Dhaka-1219': { city: 'Dhaka', district: 'Dhaka', area: 'Khilgaon / Basabo', coordinates: [90.4280, 23.7510] },
  'Dhaka-1214': { city: 'Dhaka', district: 'Dhaka', area: 'Basabo / Madartek', coordinates: [90.4320, 23.7450] },
  'Dhaka-1230': { city: 'Dhaka', district: 'Dhaka', area: 'Uttara', coordinates: [90.3970, 23.8700] },
  'Dhaka-1212': { city: 'Dhaka', district: 'Dhaka', area: 'Gulshan / Badda', coordinates: [90.4125, 23.7806] },
  'Dhaka-1213': { city: 'Dhaka', district: 'Dhaka', area: 'Banani', coordinates: [90.4030, 23.7937] },
  'Dhaka-1229': { city: 'Dhaka', district: 'Dhaka', area: 'Bashundhara / Baridhara', coordinates: [90.4300, 23.8100] },
  'Dhaka-1215': { city: 'Dhaka', district: 'Dhaka', area: 'Tejgaon / Panthapath', coordinates: [90.3910, 23.7530] },
  'Dhaka-1206': { city: 'Dhaka', district: 'Dhaka', area: 'Dhaka Cantonment', coordinates: [90.3950, 23.8200] },
  'Dhaka-1000': { city: 'Dhaka', district: 'Dhaka', area: 'Dhaka GPO / Motijheel', coordinates: [90.4125, 23.7289] },
  'Dhaka-1100': { city: 'Dhaka', district: 'Dhaka', area: 'Old Dhaka / Sadarghat', coordinates: [90.4100, 23.7080] },
  'Dhaka-1204': { city: 'Dhaka', district: 'Dhaka', area: 'Gandaria', coordinates: [90.4250, 23.7050] },
  'Dhaka-1203': { city: 'Dhaka', district: 'Dhaka', area: 'Wari', coordinates: [90.4180, 23.7150] },
  'Dhaka-1211': { city: 'Dhaka', district: 'Dhaka', area: 'Lalbagh', coordinates: [90.3870, 23.7180] },
  'Dhaka-1236': { city: 'Dhaka', district: 'Dhaka', area: 'Demra', coordinates: [90.4850, 23.7150] },
  'Dhaka-1340': { city: 'Dhaka', district: 'Dhaka', area: 'Savar', coordinates: [90.2600, 23.8550] },
  'Dhaka-1361': { city: 'Dhaka', district: 'Dhaka', area: 'Savar', coordinates: [90.2550, 23.8600] },
  'Dhaka-1362': { city: 'Dhaka', district: 'Dhaka', area: 'Ashulia', coordinates: [90.3150, 23.9050] },
  'Dhaka-1360': { city: 'Dhaka', district: 'Dhaka', area: 'Dhamrai', coordinates: [90.2100, 23.9250] },
  'Dhaka-1310': { city: 'Dhaka', district: 'Dhaka', area: 'Keraniganj', coordinates: [90.3500, 23.6800] },
  'Dhaka-1711': { city: 'Gazipur', district: 'Gazipur', area: 'Tongi', coordinates: [90.4000, 23.8950] },
  'Gazipur-1702': { city: 'Gazipur', district: 'Gazipur', area: 'Gazipur Sadar', coordinates: [90.4250, 23.9950] },
  'Dhaka-1840': { city: 'Munshiganj', district: 'Munshiganj', area: 'Tongibari', coordinates: [90.4700, 23.5100] },
  'Dhaka-1430': { city: 'Narayanganj', district: 'Narayanganj', area: 'Araihazar', coordinates: [90.6500, 23.7900] },
  'Dhaka-1450': { city: 'Narsingdi', district: 'Narsingdi', area: 'Narsingdi Sadar', coordinates: [90.7180, 23.9200] },
  'Narayanganj-1400': { city: 'Narayanganj', district: 'Narayanganj', area: 'Narayanganj Sadar', coordinates: [90.5000, 23.6200] },
  'Narayanganj-1213': { city: 'Narayanganj', district: 'Narayanganj', area: 'Narayanganj', coordinates: [90.5100, 23.6300] },

  // Chittagong Division
  'Chittagong-4000': { city: 'Chittagong', district: 'Chittagong', area: 'Chittagong GPO', coordinates: [91.8317, 22.3475] },
  'Chittagong-4202': { city: 'Chittagong', district: 'Chittagong', area: 'Panchlaish', coordinates: [91.8250, 22.3650] },
  'Chittagong-4203': { city: 'Chittagong', district: 'Chittagong', area: 'Nasirabad / Chandgaon', coordinates: [91.8400, 22.3750] },
  'Chittagong-4212': { city: 'Chittagong', district: 'Chittagong', area: 'Agrabad', coordinates: [91.8150, 22.3250] },
  'Chittagong-4337': { city: 'Chittagong', district: 'Chittagong', area: 'Hathazari', coordinates: [91.8050, 22.5050] },
  "Cox's Bazar-4700": { city: "Cox's Bazar", district: "Cox's Bazar", area: "Cox's Bazar Sadar", coordinates: [91.9800, 21.4300] },
  'Comilla-3500': { city: 'Comilla', district: 'Comilla', area: 'Cumilla Sadar', coordinates: [91.1809, 23.4607] },

  // Rajshahi Division
  'Rajshahi-6000': { city: 'Rajshahi', district: 'Rajshahi', area: 'Rajshahi GPO', coordinates: [88.6042, 24.3745] },
  'Rajshahi-6201': { city: 'Rajshahi', district: 'Rajshahi', area: 'Rajshahi Court', coordinates: [88.5800, 24.3680] },
  'Bogra-5800': { city: 'Bogura', district: 'Bogura', area: 'Bogura Sadar', coordinates: [89.3730, 24.8465] },

  // Khulna Division
  'Jessore-7400': { city: 'Jashore', district: 'Jashore', area: 'Jashore Sadar', coordinates: [89.2167, 23.1667] },
  'Kushtia-7032': { city: 'Kushtia', district: 'Kushtia', area: 'Kushtia Sadar', coordinates: [89.1200, 23.9000] },

  // Barishal Division
  'Barisal-8200': { city: 'Barisal', district: 'Barisal', area: 'Barishal Sadar', coordinates: [90.3696, 22.7010] },
};

// Specialty normalizer
function normalizeSpecialties(rawSpec) {
  if (!rawSpec) return ['General Medicine'];
  
  // Split raw line breaks or slashes
  const parts = rawSpec
    .split(/[\r\n/]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const specializations = new Set();

  parts.forEach(p => {
    specializations.add(p);
    const low = p.toLowerCase();
    if (low.includes('cardio')) {
      specializations.add('Cardiology');
    } else if (low.includes('dermat') || low.includes('skin') || low.includes('vd')) {
      specializations.add('Dermatology');
    } else if (low.includes('neuro')) {
      specializations.add('Neurology');
    } else if (low.includes('gastro') || low.includes('hepato') || low.includes('liver')) {
      specializations.add('Gastroenterology');
    } else if (low.includes('ortho')) {
      specializations.add('Orthopedics');
    } else if (low.includes('pediat') || low.includes('child') || low.includes('neonat')) {
      specializations.add('Pediatrics');
    } else if (low.includes('gyn') || low.includes('obs') || low.includes('maternal')) {
      specializations.add('Gynecology');
    } else if (low.includes('ent') || low.includes('otolaryn') || low.includes('ear') || low.includes('nose') || low.includes('throat')) {
      specializations.add('ENT (Otolaryngology)');
    } else if (low.includes('psych') || low.includes('mental')) {
      specializations.add('Psychiatry');
    } else if (low.includes('pulmon') || low.includes('chest') || low.includes('respirat') || low.includes('asthma')) {
      specializations.add('Pulmonology');
    } else if (low.includes('endocrin') || low.includes('diabet') || low.includes('thyroid')) {
      specializations.add('Endocrinology');
    } else if (low.includes('uro')) {
      specializations.add('Urology');
    } else if (low.includes('ophthal') || low.includes('eye')) {
      specializations.add('Ophthalmology');
    } else if (low.includes('dent')) {
      specializations.add('Dentistry');
    } else if (low.includes('oncol') || low.includes('cancer')) {
      specializations.add('Oncology');
    } else if (low.includes('nephro') || low.includes('kidney')) {
      specializations.add('Nephrology');
    } else if (low.includes('rheumat')) {
      specializations.add('Rheumatology');
    } else if (low.includes('surgeon') || low.includes('surgery')) {
      specializations.add('General Surgery');
    } else if (low.includes('nutrition') || low.includes('diet')) {
      specializations.add('Nutrition');
    } else if (low.includes('medicine')) {
      specializations.add('General Medicine');
    } else {
      specializations.add('General Medicine');
    }
  });

  return Array.from(specializations);
}

// Robust CSV Parser
function parseCSV(text) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let currentStr = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentStr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentStr.trim());
      currentStr = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentStr.trim());
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      currentStr = '';
    } else {
      currentStr += char;
    }
  }
  if (currentStr || row.length > 0) {
    row.push(currentStr.trim());
    if (row.length > 1 || row[0] !== '') {
      rows.push(row);
    }
  }
  return rows;
}

// Generate realistic Bangladeshi consultation fee based on experience and rank
function calculateFee(name, exp) {
  const isProf = name.includes('Prof.') || name.includes('Professor');
  const isAssoc = name.includes('Assoc.');
  const isAsst = name.includes('Asst.');

  if (isProf) return 1500;
  if (isAssoc) return 1200;
  if (isAsst) return 1000;
  if (exp >= 20) return 1000;
  if (exp >= 10) return 800;
  return 600;
}

// Generate random jitter to coordinates so clinics in the same postcode don't stack exactly
function addJitter(coords) {
  const [lng, lat] = coords;
  const jitterLng = (Math.random() - 0.5) * 0.012;
  const jitterLat = (Math.random() - 0.5) * 0.012;
  return [Number((lng + jitterLng).toFixed(5)), Number((lat + jitterLat).toFixed(5))];
}

async function importDoctors() {
  console.log('🚀 Starting CuraNet Doctor Dataset Import...');
  await connectDB();

  const csvPath = path.join(__dirname, '../../dataset/doctors_combined_data.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(fileContent);
  const dataRows = rows.slice(1);
  console.log(`📊 Found ${dataRows.length} total doctor records in CSV.`);

  // Password hash pre-calculated for speed
  const defaultPasswordHash = await bcrypt.hash('Doctor@CuraNet2026', 10);

  // Check how many imported doctors already exist in MongoDB
  const existingImportedCount = await DoctorProfile.countDocuments({
    licenseNumber: { $regex: /^BMDC-DATASET-/ }
  });
  console.log(`ℹ️ Existing imported doctors in DB: ${existingImportedCount}`);

  // If already imported, give option or re-import
  if (existingImportedCount > 5000 && !process.argv.includes('--force')) {
    console.log('✅ Over 5,000 doctors are already imported! Use --force to replace or re-import.');
    await mongoose.disconnect();
    process.exit(0);
  }

  if (process.argv.includes('--force') || existingImportedCount > 0) {
    console.log('🧹 Removing previously imported dataset doctors to ensure clean state...');
    const delResult = await DoctorProfile.deleteMany({
      licenseNumber: { $regex: /^BMDC-DATASET-/ }
    });
    console.log(`   Deleted ${delResult.deletedCount} previous dataset doctor profiles.`);
    await User.deleteMany({
      email: { $regex: /@imported-doctor\.curanet\.health$/ }
    });
    console.log('   Deleted corresponding imported doctor user accounts.');
  }

  console.log('⚙️ Parsing and formatting 6,520 doctor profiles with geolocation...');

  const userBatch = [];
  const doctorBatch = [];

  for (let i = 0; i < dataRows.length; i++) {
    const [rawName, rawEdu, rawSpec, rawExp, rawChamber, rawLoc, rawConc] = dataRows[i];

    const name = rawName ? rawName.trim() : 'Specialist Doctor';

    // Parse qualifications
    const qualifications = rawEdu
      ? rawEdu.split(/[,;\r\n]+/).map(q => q.trim()).filter(Boolean)
      : ['MBBS'];

    // Parse experience
    let expYears = parseFloat(rawExp);
    if (isNaN(expYears) || expYears < 0) {
      if (name.includes('Prof.')) expYears = 22;
      else if (name.includes('Assoc.')) expYears = 16;
      else if (name.includes('Asst.')) expYears = 12;
      else expYears = 8;
    }
    expYears = Math.min(Math.max(Math.round(expYears), 1), 55);

    // Resolve location & geo-coordinates
    let locationKey = rawLoc ? rawLoc.trim() : '';
    if (!locationKey || !LOCATION_GEO_MAP[locationKey]) {
      // Extract from chamber if available
      const m = (rawChamber || '').match(/([A-Za-z\s]+)-(\d{4})/);
      if (m && LOCATION_GEO_MAP[m[0].trim()]) {
        locationKey = m[0].trim();
      } else if (rawChamber && rawChamber.includes('Chittagong')) {
        locationKey = 'Chittagong-4000';
      } else if (rawChamber && rawChamber.includes('Bogra')) {
        locationKey = 'Bogra-5800';
      } else if (rawChamber && rawChamber.includes('Rajshahi')) {
        locationKey = 'Rajshahi-6000';
      } else if (rawChamber && rawChamber.includes('Barisal')) {
        locationKey = 'Barisal-8200';
      } else if (rawChamber && rawChamber.includes('Comilla')) {
        locationKey = 'Comilla-3500';
      } else if (rawChamber && rawChamber.includes('Jessore')) {
        locationKey = 'Jessore-7400';
      } else {
        locationKey = 'Dhaka-1205'; // Default Dhanmondi
      }
    }

    const geoInfo = LOCATION_GEO_MAP[locationKey] || LOCATION_GEO_MAP['Dhaka-1205'];
    const coordinates = addJitter(geoInfo.coordinates);

    // Parse concentrations
    const concentrations = rawConc
      ? rawConc.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    // Parse specializations
    const specialization = normalizeSpecialties(rawSpec);

    // Chamber and Clinic details
    const chamber = rawChamber ? rawChamber.trim() : 'Private Chamber';
    const clinicParts = chamber.split('|');
    const clinicName = clinicParts[0].trim();
    const clinicAddress = chamber + (locationKey ? `, ${locationKey}` : '');

    // Realistic rating (4.4 to 5.0)
    const ratingAvg = Number((4.4 + Math.random() * 0.6).toFixed(1));
    const ratingCount = Math.floor(10 + Math.random() * 180);

    const fee = calculateFee(name, expYears);
    const docIdNum = String(i + 1).padStart(5, '0');
    const licenseNumber = `BMDC-DATASET-${docIdNum}`;

    // Create User object for identity
    const userObjectId = new mongoose.Types.ObjectId();
    const cleanEmail = `doc_${docIdNum}@imported-doctor.curanet.health`;

    userBatch.push({
      _id: userObjectId,
      name,
      email: cleanEmail,
      passwordHash: defaultPasswordHash,
      phone: `+88017000${docIdNum.slice(-5)}`,
      role: 'doctor',
      isVerified: true,
      isActive: true,
      avatarUrl: `https://images.unsplash.com/photo-${1559839734 + (i % 500)}?auto=format&fit=crop&w=300&q=80`,
    });

    doctorBatch.push({
      userId: userObjectId,
      name,
      education: rawEdu || 'MBBS',
      specialization,
      qualifications: qualifications.length > 0 ? qualifications : ['MBBS'],
      experienceYears: expYears,
      licenseNumber,
      bio: `${name} is an experienced ${specialization[0]} with ${expYears} years of practice in ${geoInfo.city}. Specialized in ${concentrations.slice(0, 5).join(', ')}.`,
      consultationFee: fee,
      clinicName: clinicName || 'Specialized Clinic',
      clinicAddress,
      chamber,
      city: geoInfo.city,
      district: geoInfo.district,
      postalCode: locationKey,
      concentrations,
      location: {
        type: 'Point',
        coordinates,
      },
      languages: ['Bengali', 'English'],
      ratingAvg,
      ratingCount,
      isVerifiedByAdmin: true,
      consultationTypes: ['both'],
      availabilitySlots: [
        { dayOfWeek: 'saturday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isAvailable: true },
        { dayOfWeek: 'sunday', startTime: '16:00', endTime: '20:00', slotDurationMinutes: 30, isAvailable: true },
        { dayOfWeek: 'monday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isAvailable: true },
        { dayOfWeek: 'tuesday', startTime: '16:00', endTime: '20:00', slotDurationMinutes: 30, isAvailable: true },
        { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isAvailable: true },
        { dayOfWeek: 'thursday', startTime: '16:00', endTime: '20:00', slotDurationMinutes: 30, isAvailable: true },
      ],
    });
  }

  console.log(`📦 Prepared ${userBatch.length} Users and ${doctorBatch.length} Doctor Profiles.`);
  console.log('💾 Writing to MongoDB Atlas in batches of 1,000...');

  const BATCH_SIZE = 1000;
  for (let i = 0; i < userBatch.length; i += BATCH_SIZE) {
    const uChunk = userBatch.slice(i, i + BATCH_SIZE);
    const dChunk = doctorBatch.slice(i, i + BATCH_SIZE);

    await User.insertMany(uChunk, { ordered: false });
    await DoctorProfile.insertMany(dChunk, { ordered: false });

    console.log(`   ✓ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(userBatch.length / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, userBatch.length)} / ${userBatch.length})`);
  }

  const totalDoctorsInDb = await DoctorProfile.countDocuments();
  console.log(`\n🎉 SUCCESS! Total doctor profiles now in MongoDB: ${totalDoctorsInDb}`);

  // Test sample query
  const sampleCardio = await DoctorProfile.findOne({ specialization: 'Cardiology' }).lean();
  console.log('Sample Imported Doctor Profile:', {
    name: sampleCardio.name,
    specialization: sampleCardio.specialization,
    city: sampleCardio.city,
    experienceYears: sampleCardio.experienceYears,
    consultationFee: sampleCardio.consultationFee,
    ratingAvg: sampleCardio.ratingAvg,
    concentrationsCount: sampleCardio.concentrations?.length,
  });

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB Atlas.');
  process.exit(0);
}

importDoctors().catch(async (err) => {
  console.error('❌ Import failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
