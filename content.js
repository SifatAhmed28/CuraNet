export const courses = [
  {
    id: "health-literacy-101",
    title: "Health Literacy 101",
    category: "Everyday Health",
    level: "Beginner",
    duration: "45 min",
    price: 0,
    isFree: true,
    tone: "tone-teal",
    icon: "🩺",
    rating: 4.9,
    students: 1280,
    description: "Build practical skills for understanding health information, appointments, medicines, and reliable sources.",
    outcomes: [
      "Understand common healthcare terms",
      "Prepare useful questions for a doctor",
      "Recognize trustworthy health information",
      "Keep a simple personal health record"
    ],
    lessons: [
      { id: "lesson-1", title: "What health literacy means", duration: "8 min", content: "Health literacy is the ability to find, understand, and use health information to make informed decisions. Start by identifying the question you need answered and the source you are using." },
      { id: "lesson-2", title: "Preparing for a doctor visit", duration: "10 min", content: "Write down your main concern, relevant symptoms, current medicines, allergies, and questions before a visit. Take notes during the consultation and ask for clarification when something is unclear." },
      { id: "lesson-3", title: "Reading health information", duration: "12 min", content: "Check who produced the information, when it was updated, what evidence it uses, and whether it makes unusually strong promises. Compare important claims with trusted medical sources." },
      { id: "lesson-4", title: "Your personal health record", duration: "15 min", content: "Keep useful information such as medicines, allergies, previous diagnoses, vaccination history, and emergency contacts in a secure place that you can access when needed." }
    ]
  },
  {
    id: "understanding-prescriptions",
    title: "Understanding Prescriptions",
    category: "Medicines",
    level: "Beginner",
    duration: "50 min",
    price: 0,
    isFree: true,
    tone: "tone-blue",
    icon: "💊",
    rating: 4.8,
    students: 940,
    description: "Learn how to read common prescription instructions and ask safer questions about medicines.",
    outcomes: [
      "Identify common prescription fields",
      "Understand dose and timing language",
      "Know what to ask a pharmacist",
      "Spot common medication-safety concerns"
    ],
    lessons: [
      { id: "lesson-1", title: "Parts of a prescription", duration: "10 min", content: "A prescription may include the medicine name, strength, directions, quantity, and prescriber information. If handwriting or an instruction is unclear, confirm it with a pharmacist or prescriber." },
      { id: "lesson-2", title: "Dose and timing language", duration: "12 min", content: "Words such as once daily, twice daily, or as needed have specific meanings. Follow the label provided for your medicine rather than guessing from abbreviations." },
      { id: "lesson-3", title: "Questions for your pharmacist", duration: "13 min", content: "Useful questions include how to take the medicine, common side effects, what to do after a missed dose, storage instructions, and whether there are important interactions." },
      { id: "lesson-4", title: "Medication safety checklist", duration: "15 min", content: "Use medicines only as directed, keep them in labeled containers, and avoid taking someone else's prescription. Seek professional advice if you are unsure about a medicine." }
    ]
  },
  {
    id: "first-aid-foundations",
    title: "First Aid Foundations",
    category: "Emergency Skills",
    level: "Beginner",
    duration: "60 min",
    price: 0,
    isFree: true,
    tone: "tone-coral",
    icon: "🧰",
    rating: 4.9,
    students: 1710,
    description: "Learn calm, basic first-aid responses for common situations and when to seek urgent medical help.",
    outcomes: [
      "Prioritize scene safety",
      "Recognize situations needing emergency help",
      "Use simple first-aid measures",
      "Communicate clearly with emergency responders"
    ],
    lessons: [
      { id: "lesson-1", title: "First response priorities", duration: "12 min", content: "Check that the area is safe, assess the person's responsiveness, and get appropriate help. Avoid putting yourself in danger while trying to assist." },
      { id: "lesson-2", title: "Minor cuts and scrapes", duration: "14 min", content: "For a minor wound, gently clean it, protect it with a clean dressing, and monitor for signs that it needs medical attention. Heavy or uncontrolled bleeding requires urgent professional help." },
      { id: "lesson-3", title: "Minor burns", duration: "14 min", content: "For a small, minor burn, cool the area with cool running water and protect it afterward. Do not apply household chemicals or intentionally break blisters." },
      { id: "lesson-4", title: "When first aid is not enough", duration: "20 min", content: "Severe breathing difficulty, loss of consciousness, heavy bleeding, major injury, or other serious symptoms require urgent medical assistance rather than home treatment." }
    ]
  },
  {
    id: "healthy-daily-habits",
    title: "Healthy Daily Habits",
    category: "Wellness",
    level: "Beginner",
    duration: "40 min",
    price: 199,
    isFree: false,
    tone: "tone-violet",
    icon: "🌿",
    rating: 4.7,
    students: 620,
    description: "Explore realistic habits around sleep, hydration, movement, hygiene, and everyday wellbeing.",
    outcomes: [
      "Create a simple daily routine",
      "Understand why sleep matters",
      "Build practical hydration habits",
      "Choose sustainable movement and hygiene habits"
    ],
    lessons: [
      { id: "lesson-1", title: "A balanced routine", duration: "8 min", content: "A useful routine includes sleep, meals, hydration, movement, study or work, relaxation, and social connection. Aim for consistency rather than perfection." },
      { id: "lesson-2", title: "Sleep basics", duration: "10 min", content: "Regular sleep and wake times, a comfortable sleep environment, and a wind-down routine can support better sleep habits." },
      { id: "lesson-3", title: "Hydration and food", duration: "10 min", content: "Drink regularly according to thirst and your circumstances, and aim for varied meals that provide the nutrients your body needs." },
      { id: "lesson-4", title: "Movement and hygiene", duration: "12 min", content: "Regular age-appropriate movement and basic hygiene are practical parts of everyday health. Choose activities that are safe and sustainable." }
    ]
  },
  { id:"fainting", title:"Fainting", category:"Emergency Signs", icon:"💫", summary:"Basic safety steps while checking responsiveness and breathing.", measures:["Check that the area is safe.","Check responsiveness and normal breathing.","If the person is breathing normally, keep them safe and monitor them.","Help them sit or stand slowly only after they have recovered."], avoid:["Do not give food or drink to an unconscious person.","Do not leave a person who has not fully recovered alone."], seek:"Emergency help is needed for unresponsiveness, abnormal breathing, serious injury, chest pain, severe breathing difficulty, or other alarming symptoms." },
  { id:"choking", title:"Choking", category:"Emergency", icon:"🫁", summary:"Recognize a choking emergency and get help promptly.", measures:["Encourage a person who can cough effectively to keep coughing.","If they cannot breathe, speak, or cough effectively, call emergency services immediately.","Follow local emergency-dispatch instructions and use first-aid techniques appropriate to your training."], avoid:["Do not blindly put fingers into the mouth.","Do not delay emergency assistance."], seek:"A person who cannot breathe, speak, or cough effectively needs immediate emergency assistance." },
  { id:"allergic-reaction", title:"Severe Allergic Reaction", category:"Emergency", icon:"⚠️", summary:"Recognize possible anaphylaxis and treat it as an emergency.", measures:["Call emergency services for signs of a severe allergic reaction.","Help the person use their own prescribed emergency medicine if they have one and you can safely assist.","Monitor breathing and responsiveness while help is coming."], avoid:["Do not wait for severe symptoms to simply pass."], seek:"Face or tongue swelling, severe breathing difficulty, fainting, or rapidly worsening symptoms require emergency care." },
  { id:"asthma", title:"Asthma Attack", category:"Breathing", icon:"🌬️", summary:"Support someone having asthma symptoms while arranging help when needed.", measures:["Help the person sit comfortably and stay calm.","Help them use their own prescribed reliever inhaler according to their action plan.","Monitor breathing and responsiveness.","Get emergency help if symptoms are severe or not improving."], avoid:["Do not give another person's prescription inhaler.","Do not leave a severely breathless person alone."], seek:"Severe breathing difficulty, inability to speak normally, blue/gray lips, collapse, or worsening symptoms require urgent emergency care." },
  { id:"dehydration", title:"Dehydration", category:"Home Care", icon:"💧", summary:"Recognize dehydration signs and support safe fluid intake.", measures:["Rest in a comfortable environment.","Offer fluids in small, regular amounts if the person is awake and can swallow safely.","Monitor for worsening weakness or dizziness.","Seek professional advice when dehydration is significant or persistent."], avoid:["Do not give fluids to someone who is unconscious or cannot swallow safely."], seek:"Severe weakness, confusion, fainting, very little urine, inability to keep fluids down, or worsening symptoms need medical attention." },
  { id:"fracture", title:"Suspected Fracture", category:"Injury", icon:"🦴", summary:"Protect a potentially broken bone until professional care is available.", measures:["Keep the injured area as still and comfortable as possible.","Avoid unnecessary movement.","Get professional medical assessment.","Follow emergency instructions for severe injury or circulation problems."], avoid:["Do not try to straighten a visibly deformed limb.","Do not force the person to walk on a suspected serious injury."], seek:"Severe pain, deformity, numbness, loss of movement, or an open injury requires urgent medical assessment." },
  { id:"poison-exposure", title:"Poison Exposure", category:"Emergency", icon:"☣️", summary:"Get expert help quickly rather than guessing at home treatment.", measures:["Move away from the source if safe.","Keep the product or container information available for professionals.","Contact local emergency or poison-control services as appropriate.","Follow professional instructions."], avoid:["Do not make someone vomit unless a qualified professional specifically tells you to.","Do not give a home remedy without professional guidance."], seek:"Breathing difficulty, seizures, loss of consciousness, severe symptoms, or suspected serious poisoning require emergency help." },
  { id:"seizure", title:"Seizure", category:"Emergency", icon:"🧠", summary:"Keep the person safe and monitor them while the seizure passes.", measures:["Clear nearby hazards and protect the person from injury.","Time the seizure if possible.","When movements stop, monitor breathing and keep the person safe.","Stay with them and seek help when needed."], avoid:["Do not restrain the person.","Do not put anything in their mouth.","Do not give food or drink until fully alert."], seek:"Get emergency help for a first seizure, a prolonged seizure, repeated seizures without recovery, serious injury, breathing problems, or other concerning circumstances." },
  { id:"stroke", title:"Possible Stroke", category:"Emergency", icon:"🧑‍⚕️", summary:"Recognize sudden stroke warning signs and act quickly.", measures:["Look for sudden facial weakness, arm weakness, or speech difficulty.","Note when symptoms started or when the person was last known well.","Call emergency services immediately.","Monitor the person while help is arranged."], avoid:["Do not wait to see if symptoms disappear.","Do not give food or drink to someone who has difficulty swallowing."], seek:"Possible stroke is an emergency. Get emergency medical help immediately." },
  { id:"heart-attack", title:"Possible Heart Attack", category:"Emergency", icon:"❤️", summary:"Recognize serious chest symptoms and get urgent medical help.", measures:["Call emergency services for suspected heart attack symptoms.","Help the person rest in a comfortable position.","Monitor responsiveness and breathing.","Follow the emergency dispatcher's instructions."], avoid:["Do not make the person drive themselves to care.","Do not delay emergency help while trying home remedies."], seek:"Serious chest pressure or pain with shortness of breath, sweating, nausea, or pain spreading elsewhere can be an emergency." },
  { id:"heavy-bleeding", title:"Heavy Bleeding", category:"Emergency", icon:"🩸", summary:"Treat serious external bleeding as an emergency.", measures:["Make sure the scene is safe.","Call emergency services immediately.","Apply firm direct pressure with suitable clean material while waiting for help.","Continue monitoring the person and follow emergency-dispatch instructions."], avoid:["Do not remove an embedded object; apply pressure around it instead.","Do not delay emergency care."], seek:"Continuous or spurting bleeding, a large amount of blood loss, signs of shock, or severe injury requires immediate emergency help." }
];

export const firstAidTopics = [
  {
    id: "minor-cuts",
    title: "Minor Cuts & Scrapes",
    category: "Wounds",
    icon: "🩹",
    summary: "Simple care for small, superficial cuts and scrapes.",
    measures: [
      "Wash your hands before helping if possible.",
      "Gently rinse a minor wound with clean running water.",
      "Protect it with a clean dressing or plaster.",
      "Change the dressing if it becomes wet or dirty."
    ],
    avoid: [
      "Do not use harsh household chemicals on an open wound.",
      "Do not pick at the wound or repeatedly disturb a forming scab."
    ],
    seek: "Get medical help for heavy or uncontrolled bleeding, a deep or large wound, a wound caused by a serious accident, or signs of infection."
  },
  {
    id: "minor-burns",
    title: "Minor Burns",
    category: "Burns",
    icon: "🔥",
    summary: "Basic immediate care for a small, minor thermal burn.",
    measures: [
      "Move away from the heat source safely.",
      "Cool the affected area with cool running water.",
      "Remove nearby tight items such as rings if they are not stuck.",
      "Cover the area loosely with a clean, non-fluffy dressing."
    ],
    avoid: [
      "Do not apply butter, toothpaste, oil, or other household substances.",
      "Do not deliberately break blisters."
    ],
    seek: "Urgent medical assessment is appropriate for extensive, deep, chemical/electrical burns, burns affecting sensitive areas, or serious symptoms."
  },
  {
    id: "nosebleed",
    title: "Nosebleed",
    category: "Common Symptoms",
    icon: "👃",
    summary: "A calm first-aid approach for a typical nosebleed.",
    measures: [
      "Sit upright and lean slightly forward.",
      "Breathe through your mouth.",
      "Gently pinch the soft part of the nose continuously for several minutes.",
      "Spit out blood rather than swallowing it."
    ],
    avoid: [
      "Do not tilt the head backward.",
      "Do not repeatedly release pressure to check too early."
    ],
    seek: "Seek urgent medical help if bleeding is heavy, follows a significant injury, causes weakness or breathing problems, or does not settle with appropriate first aid."
  },
  {
    id: "sprain",
    title: "Minor Sprain",
    category: "Injury",
    icon: "🦶",
    summary: "Supportive measures for a minor soft-tissue injury.",
    measures: [
      "Stop the activity and protect the injured area from further strain.",
      "Rest it comfortably and use a wrapped cool pack for short periods.",
      "Elevate the area when practical.",
      "Return to activity gradually as symptoms improve."
    ],
    avoid: [
      "Do not force painful movement.",
      "Do not continue sports or strenuous activity through significant pain."
    ],
    seek: "Medical assessment is important when there is severe pain, obvious deformity, inability to use the limb normally, numbness, or a suspected fracture."
  },
  {
    id: "mild-fever",
    title: "Fever: Basic Support",
    category: "Home Care",
    icon: "🌡️",
    summary: "Comfort-focused measures while monitoring a fever.",
    measures: [
      "Rest and drink fluids regularly.",
      "Wear comfortable clothing and avoid overheating.",
      "Monitor symptoms and temperature when useful.",
      "Follow the label or professional advice for any age-appropriate medicine."
    ],
    avoid: [
      "Do not use someone else's prescription medicine.",
      "Do not combine medicines unless you know they are compatible and appropriately dosed."
    ],
    seek: "Get urgent help for severe difficulty breathing, confusion, a seizure, severe dehydration, a serious rash, or other alarming symptoms. For infants or persistent/high fever, seek professional advice."
  },
  {
    id: "heat-exhaustion",
    title: "Heat Exhaustion",
    category: "Environment",
    icon: "☀️",
    summary: "Early supportive steps when someone may be overheated.",
    measures: [
      "Move to a cooler place and stop strenuous activity.",
      "Loosen unnecessary outer clothing.",
      "Cool the person with cool cloths or airflow.",
      "If fully alert and able to swallow, offer small amounts of water."
    ],
    avoid: [
      "Do not leave a severely unwell person alone.",
      "Do not delay emergency care when there are signs of a heat emergency."
    ],
    seek: "Confusion, fainting, seizure, severe weakness, or a very hot person who is becoming less responsive can indicate a medical emergency."
  },
  { id:"fainting", title:"Fainting", category:"Emergency Signs", icon:"💫", summary:"Basic safety steps while checking responsiveness and breathing.", measures:["Check that the area is safe.","Check responsiveness and normal breathing.","If the person is breathing normally, keep them safe and monitor them.","Help them sit or stand slowly only after they have recovered."], avoid:["Do not give food or drink to an unconscious person.","Do not leave a person who has not fully recovered alone."], seek:"Emergency help is needed for unresponsiveness, abnormal breathing, serious injury, chest pain, severe breathing difficulty, or other alarming symptoms." },
  { id:"choking", title:"Choking", category:"Emergency", icon:"🫁", summary:"Recognize a choking emergency and get help promptly.", measures:["Encourage a person who can cough effectively to keep coughing.","If they cannot breathe, speak, or cough effectively, call emergency services immediately.","Follow local emergency-dispatch instructions and use first-aid techniques appropriate to your training."], avoid:["Do not blindly put fingers into the mouth.","Do not delay emergency assistance."], seek:"A person who cannot breathe, speak, or cough effectively needs immediate emergency assistance." },
  { id:"allergic-reaction", title:"Severe Allergic Reaction", category:"Emergency", icon:"⚠️", summary:"Recognize possible anaphylaxis and treat it as an emergency.", measures:["Call emergency services for signs of a severe allergic reaction.","Help the person use their own prescribed emergency medicine if they have one and you can safely assist.","Monitor breathing and responsiveness while help is coming."], avoid:["Do not wait for severe symptoms to simply pass."], seek:"Face or tongue swelling, severe breathing difficulty, fainting, or rapidly worsening symptoms require emergency care." },
  { id:"asthma", title:"Asthma Attack", category:"Breathing", icon:"🌬️", summary:"Support someone having asthma symptoms while arranging help when needed.", measures:["Help the person sit comfortably and stay calm.","Help them use their own prescribed reliever inhaler according to their action plan.","Monitor breathing and responsiveness.","Get emergency help if symptoms are severe or not improving."], avoid:["Do not give another person's prescription inhaler.","Do not leave a severely breathless person alone."], seek:"Severe breathing difficulty, inability to speak normally, blue/gray lips, collapse, or worsening symptoms require urgent emergency care." },
  { id:"dehydration", title:"Dehydration", category:"Home Care", icon:"💧", summary:"Recognize dehydration signs and support safe fluid intake.", measures:["Rest in a comfortable environment.","Offer fluids in small, regular amounts if the person is awake and can swallow safely.","Monitor for worsening weakness or dizziness.","Seek professional advice when dehydration is significant or persistent."], avoid:["Do not give fluids to someone who is unconscious or cannot swallow safely."], seek:"Severe weakness, confusion, fainting, very little urine, inability to keep fluids down, or worsening symptoms need medical attention." },
  { id:"fracture", title:"Suspected Fracture", category:"Injury", icon:"🦴", summary:"Protect a potentially broken bone until professional care is available.", measures:["Keep the injured area as still and comfortable as possible.","Avoid unnecessary movement.","Get professional medical assessment.","Follow emergency instructions for severe injury or circulation problems."], avoid:["Do not try to straighten a visibly deformed limb.","Do not force the person to walk on a suspected serious injury."], seek:"Severe pain, deformity, numbness, loss of movement, or an open injury requires urgent medical assessment." },
  { id:"poison-exposure", title:"Poison Exposure", category:"Emergency", icon:"☣️", summary:"Get expert help quickly rather than guessing at home treatment.", measures:["Move away from the source if safe.","Keep the product or container information available for professionals.","Contact local emergency or poison-control services as appropriate.","Follow professional instructions."], avoid:["Do not make someone vomit unless a qualified professional specifically tells you to.","Do not give a home remedy without professional guidance."], seek:"Breathing difficulty, seizures, loss of consciousness, severe symptoms, or suspected serious poisoning require emergency help." },
  { id:"seizure", title:"Seizure", category:"Emergency", icon:"🧠", summary:"Keep the person safe and monitor them while the seizure passes.", measures:["Clear nearby hazards and protect the person from injury.","Time the seizure if possible.","When movements stop, monitor breathing and keep the person safe.","Stay with them and seek help when needed."], avoid:["Do not restrain the person.","Do not put anything in their mouth.","Do not give food or drink until fully alert."], seek:"Get emergency help for a first seizure, a prolonged seizure, repeated seizures without recovery, serious injury, breathing problems, or other concerning circumstances." },
  { id:"stroke", title:"Possible Stroke", category:"Emergency", icon:"🧑‍⚕️", summary:"Recognize sudden stroke warning signs and act quickly.", measures:["Look for sudden facial weakness, arm weakness, or speech difficulty.","Note when symptoms started or when the person was last known well.","Call emergency services immediately.","Monitor the person while help is arranged."], avoid:["Do not wait to see if symptoms disappear.","Do not give food or drink to someone who has difficulty swallowing."], seek:"Possible stroke is an emergency. Get emergency medical help immediately." },
  { id:"heart-attack", title:"Possible Heart Attack", category:"Emergency", icon:"❤️", summary:"Recognize serious chest symptoms and get urgent medical help.", measures:["Call emergency services for suspected heart attack symptoms.","Help the person rest in a comfortable position.","Monitor responsiveness and breathing.","Follow the emergency dispatcher's instructions."], avoid:["Do not make the person drive themselves to care.","Do not delay emergency help while trying home remedies."], seek:"Serious chest pressure or pain with shortness of breath, sweating, nausea, or pain spreading elsewhere can be an emergency." },
  { id:"heavy-bleeding", title:"Heavy Bleeding", category:"Emergency", icon:"🩸", summary:"Treat serious external bleeding as an emergency.", measures:["Make sure the scene is safe.","Call emergency services immediately.","Apply firm direct pressure with suitable clean material while waiting for help.","Continue monitoring the person and follow emergency-dispatch instructions."], avoid:["Do not remove an embedded object; apply pressure around it instead.","Do not delay emergency care."], seek:"Continuous or spurting bleeding, a large amount of blood loss, signs of shock, or severe injury requires immediate emergency help." }
];
