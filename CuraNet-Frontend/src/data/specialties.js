// Every specialty a general hospital would route patients to, each with its
// own symptom keyword set so matching always resolves to a real specialist.
export const SPECIALTIES = [
  { id: "cardio", name: "Cardiology", keywords: ["chest pain", "shortness of breath", "palpitation", "heart", "breath", "high blood pressure"] },
  { id: "derma", name: "Dermatology", keywords: ["rash", "acne", "skin", "itching", "itchy", "eczema", "hives"] },
  { id: "neuro", name: "Neurology", keywords: ["headache", "migraine", "dizziness", "numbness", "dizzy", "seizure", "tremor"] },
  { id: "gastro", name: "Gastroenterology", keywords: ["stomach", "nausea", "vomiting", "diarrhea", "abdominal", "acidity", "constipation"] },
  { id: "ortho", name: "Orthopedics", keywords: ["joint pain", "fracture", "back pain", "knee", "bone", "sprain", "arthritis"] },
  { id: "pediatric", name: "Pediatrics", keywords: ["child fever", "kids", "child cough", "baby", "infant", "growth"] },
  { id: "general", name: "General Medicine", keywords: ["fever", "cold", "fatigue", "weakness", "flu", "cough", "body ache"] },
  { id: "gyno", name: "Gynecology", keywords: ["pregnancy", "period", "menstrual", "pcos", "pelvic pain"] },
  { id: "ent", name: "ENT (Otolaryngology)", keywords: ["ear pain", "sore throat", "sinus", "hearing loss", "nose bleed", "tonsil"] },
  { id: "psych", name: "Psychiatry", keywords: ["anxiety", "depression", "insomnia", "stress", "panic", "mood"] },
  { id: "pulmo", name: "Pulmonology", keywords: ["asthma", "wheezing", "chronic cough", "chest congestion", "breathing difficulty"] },
  { id: "endo", name: "Endocrinology", keywords: ["diabetes", "thyroid", "hormonal", "weight gain", "weight loss", "blood sugar"] },
  { id: "uro", name: "Urology", keywords: ["urinary", "kidney stone", "urination pain", "bladder", "prostate"] },
  { id: "eye", name: "Ophthalmology", keywords: ["blurry vision", "eye pain", "red eye", "vision loss", "eye strain"] },
  { id: "dental", name: "Dentistry", keywords: ["tooth pain", "cavity", "gum bleeding", "toothache", "wisdom tooth"] },
  { id: "onco", name: "Oncology", keywords: ["lump", "unexplained weight loss", "tumor", "cancer screening"] },
  { id: "nephro", name: "Nephrology", keywords: ["kidney", "swelling", "creatinine", "dialysis"] },
  { id: "rheum", name: "Rheumatology", keywords: ["joint stiffness", "autoimmune", "lupus", "gout"] },
];
