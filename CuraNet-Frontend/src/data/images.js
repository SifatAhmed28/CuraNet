// All images are free-license (Unsplash License: free for commercial use, no
// attribution required) and chosen to avoid any identifiable faces.
// Source photo pages, for reference:
//  doctor:   https://unsplash.com/photos/doctor-holding-red-stethoscope-hIgeoQjS_iE
//  blood:    https://unsplash.com/photos/gray-blood-bag-CKzto29PAAY
//  organ:    https://unsplash.com/photos/human-heart-illustration-z8_-Fmfz06c
//  firstAid: https://unsplash.com/photos/first-aid-kit-contents-with-bandages-and-medical-supplies-nGfxoclUgSI

const base = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  doctor: base("photo-1532938911079-1b06ac7ceec7"),
  blood: base("photo-1578348105417-7fe97a10842d"),
  organ: base("photo-1530026186672-2cd00ffc50fe"),
  firstAid: base("photo-1765996796562-ce301df337a0"),
};
