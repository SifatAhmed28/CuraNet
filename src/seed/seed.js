const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDB = require('../config/db');
const { User, DoctorProfile, DonorProfile, PatientProfile, BloodRequest, BloodDonation, Appointment, Review, Course, Enrollment, Article } = require('../models');

async function seed() {
  const conn = await connectDB();
  const dbName = conn.name;
  console.log(`\n=== CuraNet Atlas Provisioning | DB: ${dbName} ===`);

  // Clear in dependency order (child first)
  console.log('\n[1/4] Clearing existing collections...');
  const collections = ['enrollments','articles','reviews','appointments','blooddonations','bloodrequests','courses','donorprofiles','doctorprofiles','patientprofiles','users'];
  for (const c of collections) {
    try { await mongoose.connection.db.collection(c).deleteMany({}); console.log(`  cleared ${c}`);} catch(e){ console.log(`  skip ${c}: ${e.message}`)}
  }

  console.log('\n[2/4] Creating Users (single shared identity)...');
  const hash = await bcrypt.hash('CuraNet@123', 10);
  const usersData = [
    { name: 'CuraNet Admin', email: 'admin@curanet.health', passwordHash: hash, phone: '+8801710000001', role: 'admin', isVerified: true },
    { name: 'Dr. Ayesha Rahman', email: 'ayesha.rahman@curanet.health', passwordHash: hash, phone: '+8801710000002', role: 'doctor', isVerified: true },
    { name: 'Dr. Tanvir Hasan', email: 'tanvir.hasan@curanet.health', passwordHash: hash, phone: '+8801710000003', role: 'doctor', isVerified: true },
    { name: 'Dr. Sarah Khan', email: 'sarah.khan@curanet.health', passwordHash: hash, phone: '+8801710000004', role: 'doctor', isVerified: true },
    { name: 'Rahim Uddin', email: 'rahim.uddin@example.com', passwordHash: hash, phone: '+8801810000005', role: 'donor', isVerified: true },
    { name: 'Nusrat Jahan', email: 'nusrat.jahan@example.com', passwordHash: hash, phone: '+8801810000006', role: 'donor', isVerified: true, additionalRoles: ['patient'] },
    { name: 'Karim Ahmed', email: 'karim.ahmed@example.com', passwordHash: hash, phone: '+8801910000007', role: 'patient', isVerified: true },
    { name: 'Fatima Islam', email: 'fatima.islam@example.com', passwordHash: hash, phone: '+8801910000008', role: 'patient', isVerified: true },
    { name: 'Arif Hossain', email: 'arif.hossain@example.com', passwordHash: hash, phone: '+8801910000009', role: 'patient', isVerified: true },
    { name: 'Guest Visitor', email: 'guest_001@curanet.health', passwordHash: hash, role: 'guest', isVerified: false, isActive: true },
  ];
  const users = await User.insertMany(usersData);
  const u = Object.fromEntries(users.map(x=>[x.email, x]));
  console.log(`  inserted ${users.length} users`);

  console.log('\n[3/4] Creating module-specific extension profiles...');
  // Doctor Profiles - availabilitySlots EMBEDDED (parent-owned, no independent lifecycle)
  const doctorProfiles = await DoctorProfile.insertMany([
    {
      userId: u['ayesha.rahman@curanet.health']._id,
      specialization: ['Cardiology','Internal Medicine'],
      qualifications: ['MBBS (DMC)','MD Cardiology (NICVD)','FACC'],
      experienceYears: 12,
      licenseNumber: 'BMDC-A-12345',
      bio: 'Consultant Cardiologist at National Heart Foundation, specializes in preventive cardiology and heart failure.',
      consultationFee: 1200,
      clinicName: 'Heart Care Center, Dhanmondi',
      clinicAddress: 'House 12, Road 7, Dhanmondi, Dhaka-1205',
      location: { type:'Point', coordinates:[90.3753,23.7465] },
      languages: ['English','Bengali','Hindi'],
      ratingAvg: 4.8, ratingCount: 124,
      isVerifiedByAdmin: true,
      consultationTypes: ['both'],
      availabilitySlots: [
        { dayOfWeek:'monday', startTime:'09:00', endTime:'13:00', slotDurationMinutes:30 },
        { dayOfWeek:'monday', startTime:'17:00', endTime:'20:00', slotDurationMinutes:30 },
        { dayOfWeek:'wednesday', startTime:'09:00', endTime:'13:00', slotDurationMinutes:30 },
        { dayOfWeek:'friday', startTime:'10:00', endTime:'14:00', slotDurationMinutes:30 },
      ]
    },
    {
      userId: u['tanvir.hasan@curanet.health']._id,
      specialization: ['Orthopedics','Sports Medicine'],
      qualifications: ['MBBS (Chittagong)','MS Orthopedics','Fellow SICOT'],
      experienceYears: 8,
      licenseNumber: 'BMDC-A-12346',
      bio: 'Orthopedic surgeon focusing on joint replacement and sports injuries.',
      consultationFee: 1000,
      clinicName: 'Ortho Plus, Gulshan',
      clinicAddress: 'Gulshan Avenue, Dhaka-1212',
      location: { type:'Point', coordinates:[90.4125,23.7806] },
      languages: ['English','Bengali'],
      ratingAvg: 4.6, ratingCount: 89,
      isVerifiedByAdmin: true,
      availabilitySlots: [
        { dayOfWeek:'tuesday', startTime:'10:00', endTime:'14:00', slotDurationMinutes:20 },
        { dayOfWeek:'thursday', startTime:'15:00', endTime:'19:00', slotDurationMinutes:20 },
        { dayOfWeek:'saturday', startTime:'09:00', endTime:'12:00', slotDurationMinutes:20 },
      ]
    },
    {
      userId: u['sarah.khan@curanet.health']._id,
      specialization: ['Pediatrics','Neonatology'],
      qualifications: ['MBBS','MD Pediatrics (BSMMU)'],
      experienceYears: 10,
      licenseNumber: 'BMDC-A-12347',
      bio: 'Child health specialist with focus on neonatal care and immunization.',
      consultationFee: 800,
      clinicName: 'Child Wellness Clinic, Uttara',
      clinicAddress: 'Sector 7, Uttara, Dhaka-1230',
      location: { type:'Point', coordinates:[90.3970,23.8700] },
      languages: ['English','Bengali','Urdu'],
      ratingAvg: 4.9, ratingCount: 210,
      isVerifiedByAdmin: true,
      availabilitySlots: [
        { dayOfWeek:'sunday', startTime:'09:00', endTime:'12:00', slotDurationMinutes:15 },
        { dayOfWeek:'monday', startTime:'14:00', endTime:'17:00', slotDurationMinutes:15 },
        { dayOfWeek:'wednesday', startTime:'14:00', endTime:'17:00', slotDurationMinutes:15 },
      ]
    }
  ]);
  console.log(`  doctorProfiles: ${doctorProfiles.length}`);

  const donorProfiles = await DonorProfile.insertMany([
    {
      userId: u['rahim.uddin@example.com']._id,
      bloodGroup:'O+',
      gender:'male',
      dateOfBirth: new Date('1995-06-15'),
      isAvailable: true,
      lastDonationDate: new Date('2025-09-10'),
      totalDonations: 7,
      location: { type:'Point', coordinates:[90.4125,23.8103] },
      address: 'Banani, Dhaka-1213',
      healthStatus:'eligible',
      weightKg: 72,
      phoneVisible: true
    },
    {
      userId: u['nusrat.jahan@example.com']._id,
      bloodGroup:'B+',
      gender:'female',
      dateOfBirth: new Date('1998-03-22'),
      isAvailable: true,
      lastDonationDate: new Date('2025-11-01'),
      totalDonations: 3,
      location: { type:'Point', coordinates:[90.3753,23.7465] },
      address: 'Dhanmondi, Dhaka-1205',
      healthStatus:'eligible',
      weightKg: 58,
      phoneVisible: false
    }
  ]);
  console.log(`  donorProfiles: ${donorProfiles.length}`);

  const patientProfiles = await PatientProfile.insertMany([
    {
      userId: u['karim.ahmed@example.com']._id,
      dateOfBirth: new Date('1990-01-10'),
      gender:'male',
      bloodGroup:'A+',
      allergies:['Penicillin'],
      chronicConditions:['Hypertension'],
      emergencyContact:{ name:'Salma Ahmed', relationship:'Spouse', phone:'+8801911111111' },
      address:'Mirpur 10, Dhaka',
      location:{ type:'Point', coordinates:[90.3657,23.8065] }
    },
    {
      userId: u['fatima.islam@example.com']._id,
      dateOfBirth: new Date('1992-08-08'),
      gender:'female',
      bloodGroup:'O+',
      allergies:[],
      chronicConditions:['Asthma'],
      emergencyContact:{ name:'Rafiq Islam', relationship:'Father', phone:'+8801912222222' },
      address:'Mohammadpur, Dhaka',
      location:{ type:'Point', coordinates:[90.3620,23.7630] }
    },
    {
      userId: u['arif.hossain@example.com']._id,
      dateOfBirth: new Date('1988-12-05'),
      gender:'male',
      bloodGroup:'AB+',
      allergies:['Dust'],
      chronicConditions:[],
      emergencyContact:{ name:'Hosne Ara', relationship:'Mother', phone:'+8801913333333' },
      address:'Bashundhara R/A, Dhaka',
      location:{ type:'Point', coordinates:[90.4300,23.8100] }
    },
    {
      userId: u['nusrat.jahan@example.com']._id,
      dateOfBirth: new Date('1998-03-22'),
      gender:'female',
      bloodGroup:'B+',
      allergies:[],
      chronicConditions:[],
      emergencyContact:{ name:'Jamal Uddin', relationship:'Brother', phone:'+8801914444444' },
      address:'Dhanmondi, Dhaka',
      location:{ type:'Point', coordinates:[90.3753,23.7465] }
    }
  ]);
  console.log(`  patientProfiles: ${patientProfiles.length}`);

  console.log('\n[3b] Blood Exchange Network...');
  const bloodRequests = await BloodRequest.insertMany([
    {
      requesterId: u['karim.ahmed@example.com']._id,
      patientName: 'Karim Ahmed',
      bloodGroup:'O+',
      unitsNeeded: 2,
      urgency:'critical',
      status:'open',
      hospitalName:'Dhaka Medical College Hospital',
      hospitalAddress:'Secretariat Road, Dhaka-1000',
      location:{ type:'Point', coordinates:[90.3944,23.7258] },
      contactPhone:'+8801910000007',
      neededByDate: new Date(Date.now()+3*24*3600e3),
      description:'Urgent O+ needed for cardiac surgery. Rule-based match will geo-query donors within 10km.'
    },
    {
      requesterId: u['fatima.islam@example.com']._id,
      patientName: 'Fatima Islam',
      bloodGroup:'B+',
      unitsNeeded: 1,
      urgency:'high',
      status:'matched',
      hospitalName:'Square Hospital',
      hospitalAddress:'Panthapath, Dhaka-1215',
      location:{ type:'Point', coordinates:[90.3875,23.7520] },
      contactPhone:'+8801910000008',
      neededByDate: new Date(Date.now()+7*24*3600e3),
      description:'B+ for scheduled transfusion.',
      fulfilledByDonorId: donorProfiles[1]._id
    },
    {
      requesterId: u['arif.hossain@example.com']._id,
      patientName: 'Arif Hossain',
      bloodGroup:'AB+',
      unitsNeeded: 3,
      urgency:'medium',
      status:'open',
      hospitalName:'United Hospital',
      hospitalAddress:'Gulshan 2, Dhaka-1212',
      location:{ type:'Point', coordinates:[90.4125,23.8120] },
      contactPhone:'+8801910000009',
      neededByDate: new Date(Date.now()+5*24*3600e3),
      description:'AB+ needed for accident victim.'
    }
  ]);
  console.log(`  bloodRequests: ${bloodRequests.length}`);

  const bloodDonations = await BloodDonation.insertMany([
    {
      donorId: donorProfiles[1]._id,
      donorUserId: u['nusrat.jahan@example.com']._id,
      requestId: bloodRequests[1]._id,
      unitsDonated:1,
      donationDate: new Date('2025-12-10'),
      location:{ type:'Point', coordinates:[90.3753,23.7465] },
      status:'completed',
      notes:'Donated at Square Hospital blood bank, verified by lab.',
      verifiedBy: u['admin@curanet.health']._id
    }
  ]);
  console.log(`  bloodDonations: ${bloodDonations.length}`);
  console.log('\n[3c] AI Doctor Matchmaking (transparent rule-based appointments)...');
  const appointments = await Appointment.insertMany([
    {
      patientId: u['karim.ahmed@example.com']._id,
      doctorId: doctorProfiles[0]._id,
      doctorUserId: u['ayesha.rahman@curanet.health']._id,
      appointmentDate: new Date('2026-02-15'),
      timeSlot:{ startTime:'09:30', endTime:'10:00', dayOfWeek:'monday' },
      consultationType:'offline',
      status:'completed',
      reason:'Chest pain and hypertension follow-up',
      fee:1200,
      prescriptionNotes:'ECG normal, continue Amlodipine 5mg, low-salt diet.',
      ruleMatchMeta:{ matchedSpecialty:'Cardiology', matchedLocation:true, matchedAvailability:true, distanceKm:2.3 }
    },
    {
      patientId: u['fatima.islam@example.com']._id,
      doctorId: doctorProfiles[2]._id,
      doctorUserId: u['sarah.khan@curanet.health']._id,
      appointmentDate: new Date('2026-03-01'),
      timeSlot:{ startTime:'09:15', endTime:'09:30', dayOfWeek:'sunday' },
      consultationType:'online',
      status:'confirmed',
      reason:'Child fever and cough for 3 days',
      fee:800,
      ruleMatchMeta:{ matchedSpecialty:'Pediatrics', matchedLocation:true, matchedAvailability:true, distanceKm:5.1 }
    },
    {
      patientId: u['arif.hossain@example.com']._id,
      doctorId: doctorProfiles[1]._id,
      doctorUserId: u['tanvir.hasan@curanet.health']._id,
      appointmentDate: new Date('2026-03-05'),
      timeSlot:{ startTime:'10:00', endTime:'10:20', dayOfWeek:'tuesday' },
      consultationType:'offline',
      status:'pending',
      reason:'Knee pain after football injury',
      fee:1000,
      ruleMatchMeta:{ matchedSpecialty:'Orthopedics', matchedLocation:true, matchedAvailability:true, distanceKm:1.8 }
    }
  ]);
  console.log(`  appointments: ${appointments.length}`);

  const reviews = await Review.insertMany([
    { patientId: u['karim.ahmed@example.com']._id, doctorId: doctorProfiles[0]._id, appointmentId: appointments[0]._id, rating:5, comment:'Excellent cardiologist, explained everything transparently.' },
    { patientId: u['fatima.islam@example.com']._id, doctorId: doctorProfiles[2]._id, appointmentId: appointments[1]._id, rating:4, comment:'Very caring pediatrician, good for kids.' }
  ]);
  console.log(`  reviews: ${reviews.length}`);

  console.log('\n[3d] Healthcare Literacy Hub...');
  const courses = await Course.insertMany([
    {
      title:'Heart Health 101: Preventing Cardiovascular Disease',
      slug:'heart-health-101',
      description:'Evidence-based course on hypertension, diet, exercise and preventive cardiology.',
      category:'chronic_disease',
      level:'beginner',
      instructorId: u['ayesha.rahman@curanet.health']._id,
      thumbnailUrl:'https://cdn.curanet.health/courses/heart-health.jpg',
      tags:['cardiology','prevention','hypertension','nutrition'],
      isPublished:true, isFeatured:true,
      lessons:[
        { title:'Understanding Blood Pressure', description:'What is hypertension?', contentType:'video', videoUrl:'https://cdn.curanet.health/videos/bp-intro.mp4', content:'Article transcript on BP...', durationMinutes:15, order:1, isPreview:true, resources:['https://cdn.curanet.health/resources/bp-chart.pdf'] },
        { title:'Diet for a Healthy Heart', description:'DASH diet principles', contentType:'article', content:'Low-sodium, high-fiber diet explained...', durationMinutes:20, order:2, isPreview:false },
        { title:'Exercise and Heart Health Quiz', description:'Test your knowledge', contentType:'quiz', content:'Quiz lesson', durationMinutes:10, order:3, quiz:{ questions:[{ question:'Normal BP is?', options:['120/80 mmHg','140/90 mmHg','100/60 mmHg'], correctIndex:0 },{ question:'Recommended sodium per day?', options:['<5g','<2.3g','<10g'], correctIndex:1 }] } }
      ]
    },
    {
      title:'First Aid Essentials',
      slug:'first-aid-essentials',
      description:'Critical first-aid skills: CPR, bleeding control, burns and choking.',
      category:'first_aid',
      level:'beginner',
      instructorId: u['tanvir.hasan@curanet.health']._id,
      thumbnailUrl:'https://cdn.curanet.health/courses/first-aid.jpg',
      tags:['first_aid','emergency','cpr'],
      isPublished:true, isFeatured:true,
      lessons:[
        { title:'CPR Basics', contentType:'video', videoUrl:'https://cdn.curanet.health/videos/cpr.mp4', content:'CPR steps', durationMinutes:25, order:1, isPreview:true },
        { title:'Bleeding Control', contentType:'article', content:'Pressure and bandaging techniques...', durationMinutes:15, order:2 },
        { title:'Burns Management', contentType:'article', content:'Degrees of burns and care...', durationMinutes:12, order:3 }
      ]
    },
    {
      title:'Maternal Health & Nutrition',
      slug:'maternal-health-nutrition',
      description:'Guide for pregnancy nutrition, antenatal care and newborn wellness.',
      category:'maternal_health',
      level:'intermediate',
      instructorId: u['sarah.khan@curanet.health']._id,
      thumbnailUrl:'https://cdn.curanet.health/courses/maternal.jpg',
      tags:['maternal','nutrition','pregnancy'],
      isPublished:true, isFeatured:false,
      lessons:[
        { title:'Antenatal Care Schedule', contentType:'article', content:'Trimester wise checkups...', durationMinutes:18, order:1, isPreview:true },
        { title:'Nutrition During Pregnancy', contentType:'video', videoUrl:'https://cdn.curanet.health/videos/maternal-nutrition.mp4', durationMinutes:22, order:2 }
      ]
    }
  ]);
  console.log(`  courses: ${courses.length}`);
  const enrollments = await Enrollment.insertMany([
    { userId: u['karim.ahmed@example.com']._id, courseId: courses[0]._id, progress:66, completedLessonIds:[courses[0].lessons[0]._id, courses[0].lessons[1]._id], status:'in_progress', enrolledAt:new Date('2026-01-10'), lastAccessedAt:new Date() },
    { userId: u['fatima.islam@example.com']._id, courseId: courses[1]._id, progress:100, completedLessonIds: courses[1].lessons.map(l=>l._id), status:'completed', enrolledAt:new Date('2026-01-05'), completedAt:new Date('2026-01-20'), lastAccessedAt:new Date('2026-01-20'), certificateUrl:'https://cdn.curanet.health/certs/fatima-first-aid.pdf' },
    { userId: u['arif.hossain@example.com']._id, courseId: courses[0]._id, progress:33, completedLessonIds:[courses[0].lessons[0]._id], status:'in_progress', enrolledAt:new Date('2026-02-01') }
  ]);
  console.log(`  enrollments: ${enrollments.length}`);

  const articles = await Article.insertMany([
    {
      title:'How to Lower Blood Pressure Without Medication',
      slug:'lower-bp-without-medication',
      excerpt:'Lifestyle interventions that reduce hypertension risk by up to 30%.',
      content:'# Lower BP Naturally\n\n1. Reduce sodium <2.3g/day\n2. 150min/week exercise\n3. DASH diet\n\n> Consult your doctor.',
      category:'chronic_disease',
      tags:['hypertension','lifestyle','prevention'],
      authorId: u['ayesha.rahman@curanet.health']._id,
      coverImageUrl:'https://cdn.curanet.health/articles/bp-lifestyle.jpg',
      readingTimeMinutes:6, views:342, likes:45, isPublished:true, publishedAt:new Date('2026-01-15')
    },
    {
      title:'When to Donate Blood: Eligibility Checklist',
      slug:'blood-donation-eligibility',
      excerpt:'Who can donate? Weight, hemoglobin, interval and health criteria.',
      content:'## Eligibility\n- Weight >45kg\n- Hb >12.5g/dL\n- 3 months since last donation\n- No fever in last 7 days',
      category:'general_wellness',
      tags:['blood','donation','eligibility'],
      authorId: u['admin@curanet.health']._id,
      coverImageUrl:'https://cdn.curanet.health/articles/blood-eligibility.jpg',
      readingTimeMinutes:4, views:512, likes:78, isPublished:true, publishedAt:new Date('2026-01-20')
    },
    {
      title:'Choking First Aid for Children',
      slug:'choking-first-aid-children',
      excerpt:'Heimlich maneuver for children: step-by-step.',
      content:'## Steps\n1. Confirm choking\n2. Back blows\n3. Abdominal thrusts\n4. Call 999',
      category:'first_aid',
      tags:['first_aid','pediatrics','emergency'],
      authorId: u['sarah.khan@curanet.health']._id,
      coverImageUrl:'https://cdn.curanet.health/articles/choking.jpg',
      readingTimeMinutes:5, views:210, likes:32, isPublished:true, publishedAt:new Date('2026-02-01')
    }
  ]);
  console.log(`  articles: ${articles.length}`);

  console.log('\n[4/4] Verifying indexes & counts...');
  for (const modelName of ['User','DoctorProfile','DonorProfile','PatientProfile','BloodRequest','BloodDonation','Appointment','Review','Course','Enrollment','Article']) {
    const Model = mongoose.model(modelName);
    const count = await Model.countDocuments();
    const indexes = await Model.collection.getIndexes();
    console.log(`  ${modelName}: ${count} docs | ${Object.keys(indexes).length} indexes -> ${Object.keys(indexes).join(', ')}`);
  }

  console.log('\n=== Demo Rule-Based Matching Queries (transparent, not AI) ===');
  const cardioDocs = await DoctorProfile.find({ specialization: 'Cardiology', isVerifiedByAdmin:true }).select('specialization clinicAddress ratingAvg').lean();
  console.log('  Cardiology verified doctors:', cardioDocs.length);
  const nearbyDonors = await DonorProfile.find({ bloodGroup:'O+', isAvailable:true, location: { $near: { $geometry:{ type:'Point', coordinates:[90.3944,23.7258] }, $maxDistance: 10000 } } }).select('bloodGroup address').lean();
  console.log('  Nearby O+ donors within 10km of DMC:', nearbyDonors.length);
  const publishedCourses = await Course.find({ isPublished:true }).select('title category level').lean();
  console.log('  Published courses:', publishedCourses.length);

  console.log('\nSEED COMPLETE - CuraNet Atlas ready for MERN frontend');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async e=>{ console.error('SEED FAILED', e); try{await mongoose.disconnect();}catch{} process.exit(1);});
