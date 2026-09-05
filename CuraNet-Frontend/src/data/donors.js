export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// At least one donor per blood type so a request of any type always finds a
// compatible match.
export const DONORS = [
  { id: 1, name: "Rakib Hossain", bloodType: "O+", location: "Dhanmondi", lastDonation: "2026-04-12" },
  { id: 2, name: "Anika Tabassum", bloodType: "O-", location: "Uttara", lastDonation: "2026-02-03" },
  { id: 3, name: "Shakil Ahmed", bloodType: "A+", location: "Mirpur", lastDonation: "2026-05-20" },
  { id: 4, name: "Farzana Yeasmin", bloodType: "B+", location: "Gulshan", lastDonation: "2026-03-15" },
  { id: 5, name: "Tanvir Hasan", bloodType: "AB+", location: "Banani", lastDonation: "2026-01-28" },
  { id: 6, name: "Mim Akter", bloodType: "O-", location: "Bashundhara", lastDonation: "2026-06-01" },
  { id: 7, name: "Sadia Islam", bloodType: "A-", location: "Dhanmondi", lastDonation: "2026-04-30" },
  { id: 8, name: "Rezaul Karim", bloodType: "B-", location: "Mohammadpur", lastDonation: "2026-02-19" },
  { id: 9, name: "Nabila Hossain", bloodType: "AB-", location: "Uttara", lastDonation: "2026-05-05" },
  { id: 10, name: "Imran Kabir", bloodType: "O+", location: "Mirpur", lastDonation: "2026-03-22" },
  { id: 11, name: "Sultana Razia", bloodType: "A+", location: "Gulshan", lastDonation: "2026-06-10" },
  { id: 12, name: "Habibur Rahman", bloodType: "B+", location: "Banani", lastDonation: "2026-01-15" },
];
