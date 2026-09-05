export const ORGAN_TYPES = ["Kidney", "Liver", "Heart", "Lungs", "Pancreas", "Cornea", "Bone Marrow", "Skin Tissue"];

// At least one registered donor per organ type so a request for any organ
// always finds a potential match.
export const ORGAN_DONORS = [
  { id: 1, name: "Fahim Reza", organType: "Kidney", location: "Dhanmondi", registeredOn: "2025-11-02" },
  { id: 2, name: "Nadia Islam", organType: "Liver", location: "Uttara", registeredOn: "2025-09-18" },
  { id: 3, name: "Shafiul Azam", organType: "Heart", location: "Mirpur", registeredOn: "2026-01-05" },
  { id: 4, name: "Ruma Chowdhury", organType: "Lungs", location: "Gulshan", registeredOn: "2025-12-20" },
  { id: 5, name: "Kamal Hossain", organType: "Pancreas", location: "Banani", registeredOn: "2026-02-14" },
  { id: 6, name: "Afsana Mimi", organType: "Cornea", location: "Bashundhara", registeredOn: "2026-03-01" },
  { id: 7, name: "Wasim Akram", organType: "Bone Marrow", location: "Mohammadpur", registeredOn: "2025-10-27" },
  { id: 8, name: "Lubna Sultana", organType: "Skin Tissue", location: "Dhanmondi", registeredOn: "2026-01-30" },
  { id: 9, name: "Rakibul Hasan", organType: "Kidney", location: "Uttara", registeredOn: "2026-04-08" },
  { id: 10, name: "Tahmina Akter", organType: "Cornea", location: "Gulshan", registeredOn: "2025-08-22" },
];
