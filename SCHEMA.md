# CuraNet — MongoDB Atlas Schema Design
> One Website for Every Health Decision (MERN) | Single DB `curanet` | Shared `users` identity

## Design Principles
- **Single shared identity**: `users` is the central collection. Every module-specific profile (`doctorProfiles`, `donorProfiles`, `patientProfiles`) stores `userId: ObjectId → users._id` (unique, indexed). No duplication of email/password/role.
- **Role-based access baked into schema**: `users.role` enum `[guest, patient, customer, doctor, donor, admin]` + `users.additionalRoles[]` for multi-role (e.g., patient+donor). Module collections are only created for the relevant role. Middleware checks `users.role` / `users.additionalRoles`.
- **Embed vs Reference**: Embed parent-owned data with no independent lifecycle; Reference reused/independently-queried entities.
- **Extensible**: All demo fields are production-shape. No hard-coded assumptions. Enums allow extension, optional fields tolerate missing production data, GeoJSON ready for real maps.

---

## 1. users — Central Identity (SHARED)
| Field | Type | Required | Validation / Index |
|---|---|---|---|
| _id | ObjectId | auto | PK |
| name | String | Yes | trim, 2–100 |
| email | String | Yes | unique, lowercase, regex `^\S+@\S+\.\S+$`, index unique |
| passwordHash | String | Yes | bcrypt, min 6 |
| phone | String | No | E.164 `^\+?[0-9]{7,15}$` |
| role | String | Yes | enum guest/patient/customer/doctor/donor/admin, default patient, index |
| additionalRoles | [String] | No | enum same, for multi-role users |
| avatarUrl | String | No | URL |
| isVerified | Boolean | No | default false |
| isActive | Boolean | No | default true |
| lastLoginAt | Date | No | — |
| timestamps | Date | auto | createdAt/updatedAt, index createdAt |

Indexes: `email` unique, `role`, `createdAt`.

## 2. doctorProfiles — Doctor Extension
References `users` where role=doctor.

| Field | Type | Required | Validation |
|---|---|---|---|
| userId | ObjectId → users | Yes | unique, ref, index |
| specialization | [String] | Yes | min 1, text-index, e.g. Cardiology |
| qualifications | [String] | Yes | min 1, e.g. MBBS |
| experienceYears | Number | Yes | 0–60 |
| licenseNumber | String | Yes | unique, regex `^[A-Z0-9\-\/]{5,30}$` |
| bio | String | No | max 2000 |
| consultationFee | Number | Yes | 0–100k, index |
| clinicName | String | No | max 200, text-index |
| clinicAddress | String | Yes | max 500 |
| location | GeoJSON Point | Yes | `2dsphere`, coordinates [lng,lat] |
| languages | [String] | No | default [English] |
| ratingAvg | Number | No | 0–5 default 0 |
| ratingCount | Number | No | default 0 |
| isVerifiedByAdmin | Boolean | No | default false, index |
| consultationTypes | [String] | No | enum online/offline/both |
| **availabilitySlots** | [Embedded] | No | see below |
| timestamps | Date | auto | — |

Embedded `availabilitySlots[]` (parent-owned, no independent lifecycle):
- dayOfWeek enum mon–sun required
- startTime HH:MM required regex `^([01]\d|2[0-3]):([0-5]\d)$`
- endTime HH:MM required
- slotDurationMinutes enum 15/20/30/45/60 default 30
- isAvailable Boolean default true

Indexes: `userId` unique, `licenseNumber` unique, `location` 2dsphere, `specialization`, `isVerifiedByAdmin`, text `specialization+bio+clinicName`.

## 3. donorProfiles — Donor Extension
| Field | Type | Required | Validation |
|---|---|---|---|
| userId | ObjectId → users | Yes | unique, ref |
| bloodGroup | String | Yes | enum A+/A-/B+/B-/AB+/AB-/O+/O-, index |
| dateOfBirth | Date | No | — |
| gender | String | No | enum male/female/other/prefer_not_to_say |
| isAvailable | Boolean | No | default true, index |
| lastDonationDate | Date | No | index |
| totalDonations | Number | No | min 0 default 0 |
| location | GeoJSON Point | Yes | 2dsphere |
| address | String | Yes | max 500 |
| healthStatus | String | No | enum eligible/temporarily_deferred/ineligible, default eligible |
| weightKg | Number | No | 45–200 |
| phoneVisible | Boolean | No | default false |

Indexes: `userId` unique, `location` 2dsphere, compound `bloodGroup+isAvailable`.

## 4. patientProfiles — Patient Extension
| Field | Type | Required | Validation |
|---|---|---|---|
| userId | ObjectId → users | Yes | unique, ref |
| dateOfBirth | Date | No | — |
| gender | String | No | enum male/female/other/prefer_not_to_say |
| bloodGroup | String | No | enum BGs, index |
| allergies | [String] | No | default [] |
| chronicConditions | [String] | No | default [] |
| **emergencyContact** | Embedded | Yes | name*, relationship*, phone* (E.164) |
| address | String | No | max 500 |
| location | GeoJSON Point | No | 2dsphere optional |

Embedded `emergencyContact` (tightly-coupled, no lifecycle) justifies embedding.

Indexes: `userId` unique, `location` 2dsphere.

## 5. bloodRequests — Blood Exchange Network
| Field | Type | Required | Validation |
|---|---|---|---|
| requesterId | ObjectId → users | Yes | ref, index |
| patientName | String | Yes | max 100 |
| bloodGroup | String | Yes | enum BGs, index |
| unitsNeeded | Number | Yes | 1–10 |
| urgency | String | Yes | enum low/medium/high/critical, default medium, index |
| status | String | Yes | enum open/matched/fulfilled/cancelled/expired, default open, index |
| hospitalName | String | Yes | max 200 |
| hospitalAddress | String | Yes | max 500 |
| location | GeoJSON Point | Yes | 2dsphere |
| contactPhone | String | Yes | E.164 |
| neededByDate | Date | Yes | — |
| description | String | No | max 500 |
| fulfilledByDonorId | ObjectId → donorProfiles | No | ref |
| fulfilledAt | Date | No | — |
| timestamps | Date | auto | index createdAt |

Indexes: `location` 2dsphere, compound `bloodGroup+status`, `urgency+neededByDate`.

## 6. bloodDonations
| Field | Type | Required | Validation |
|---|---|---|---|
| donorId | ObjectId → donorProfiles | Yes | ref, index |
| donorUserId | ObjectId → users | Yes | ref, index (denormalized for fast lookup) |
| requestId | ObjectId → bloodRequests | Yes | ref, index |
| unitsDonated | Number | Yes | 1–10 |
| donationDate | Date | Yes | default now, index |
| location | GeoJSON Point | No | 2dsphere |
| status | String | Yes | enum scheduled/completed/cancelled/verified, default scheduled |
| notes | String | No | max 500 |
| verifiedBy | ObjectId → users | No | ref admin |

Indexes: `donorId+requestId`, `donationDate`, `location` 2dsphere.

## 7. appointments — AI Doctor Matchmaking (transparent rule-based)
Rule-based matching queries structured fields: specialty, location (geo), availability, fee, rating. No black-box AI. `ruleMatchMeta` stores transparent match reasons.

| Field | Type | Required | Validation |
|---|---|---|---|
| patientId | ObjectId → users | Yes | ref, index |
| doctorId | ObjectId → doctorProfiles | Yes | ref, index |
| doctorUserId | ObjectId → users | Yes | ref, denormalized |
| appointmentDate | Date | Yes | index |
| **timeSlot** | Embedded | Yes | startTime HH:MM*, endTime HH:MM*, dayOfWeek enum |
| consultationType | String | Yes | enum online/offline, default offline |
| status | String | No | enum pending/confirmed/cancelled/completed/no_show, default pending, index |
| reason | String | Yes | max 500 |
| notes | String | No | max 1000 |
| fee | Number | Yes | min 0 |
| prescriptionNotes | String | No | max 2000 |
| **ruleMatchMeta** | Embedded | No | matchedSpecialty String, matchedLocation Bool, matchedAvailability Bool, distanceKm Number, matchedAt Date |
| timestamps | Date | auto | — |

Embedded `timeSlot` and `ruleMatchMeta` are parent-owned, no independent lifecycle.

Indexes: unique `doctorId+appointmentDate+timeSlot.startTime` (prevents double booking), `patientId+appointmentDate`, `status+appointmentDate`.

## 8. reviews
| Field | Type | Required | Validation |
|---|---|---|---|
| patientId | ObjectId → users | Yes | ref |
| doctorId | ObjectId → doctorProfiles | Yes | ref, index |
| appointmentId | ObjectId → appointments | Yes | unique, sparse |
| rating | Number | Yes | 1–5, index |
| comment | String | No | max 1000 |
| isAnonymous | Boolean | No | default false |
| timestamps | Date | auto | — |

Indexes: `doctorId+patientId`, `appointmentId` unique.

## 9. courses — Literacy Hub (lessons embedded)
| Field | Type | Required | Validation |
|---|---|---|---|
| title | String | Yes | max 200, text-index |
| slug | String | Yes | unique, lowercase, regex `^[a-z0-9\-]+$`, index |
| description | String | Yes | max 5000, text-index |
| category | String | Yes | enum nutrition/mental_health/chronic_disease/first_aid/maternal_health/infectious_disease/general_wellness/preventive_care, index |
| level | String | Yes | enum beginner/intermediate/advanced, default beginner |
| instructorId | ObjectId → users | Yes | ref, index |
| thumbnailUrl | String | No | URL |
| tags | [String] | No | lowercase, text-index |
| durationMinutes | Number | No | auto-sum of lessons |
| isPublished | Boolean | No | default false, index |
| isFeatured | Boolean | No | default false |
| enrollmentCount | Number | No | min 0 default 0 |
| ratingAvg | Number | No | 0–5 default 0 |
| **lessons** | [Embedded] | No | see below |
| timestamps | Date | auto | — |

Embedded `lessons[]` (no independent lifecycle, always accessed via course):
- title* max200, description max1000, contentType* enum video/article/quiz/pdf, content max10000, videoUrl URL, durationMinutes* 1–600, order* min1, isPreview default false, resources [URL], quiz { questions[] { question* max500, options* min2, correctIndex* } }

Indexes: `slug` unique, text `title+description+tags`, compound `category+level`, `isPublished+isFeatured`.

## 10. enrollments
| Field | Type | Required | Validation |
|---|---|---|---|
| userId | ObjectId → users | Yes | ref, index |
| courseId | ObjectId → courses | Yes | ref, index |
| progress | Number | No | 0–100 default 0 |
| completedLessonIds | [ObjectId] | No | refs to embedded lesson _id |
| status | String | No | enum enrolled/in_progress/completed/dropped, default enrolled, index |
| enrolledAt | Date | No | default now, index |
| completedAt | Date | No | — |
| lastAccessedAt | Date | No | — |
| certificateUrl | String | No | URL |
| timestamps | Date | auto | — |

Indexes: unique `userId+courseId`, `status`, `enrolledAt`.

## 11. articles — Literacy Hub
| Field | Type | Required | Validation |
|---|---|---|---|
| title | String | Yes | max 300, text-index |
| slug | String | Yes | unique, lowercase, regex |
| excerpt | String | No | max 300 |
| content | String | Yes | max 20000, text-index |
| category | String | Yes | enum same as courses, index |
| tags | [String] | No | text-index |
| authorId | ObjectId → users | Yes | ref, index |
| coverImageUrl | String | No | URL |
| readingTimeMinutes | Number | No | 1–120 |
| views | Number | No | default 0, index |
| likes | Number | No | default 0 |
| isPublished | Boolean | No | default false, index |
| publishedAt | Date | No | index |

Indexes: `slug` unique, text `title+content+tags`, `category+isPublished`, `views`, `publishedAt`.

---

## Embed vs Reference Justification

| Relationship | Decision | Justification |
|---|---|---|
| users → doctorProfiles/donorProfiles/patientProfiles | **Reference** (userId ObjectId) | Shared identity across modules; profiles queried independently; extensible per role; avoids duplication |
| doctorProfiles.availabilitySlots | **Embed** | Parent-owned weekly schedule, no independent lifecycle, always fetched with doctor, bounded array (≤20 slots) |
| patientProfiles.emergencyContact | **Embed** | Tightly-coupled contact, never queried alone, 1:1 with patient |
| courses.lessons | **Embed** | Lessons owned by course, never reused across courses, ordered list, accessed via parent; includes quiz embedded |
| courses.lessons.quiz.questions | **Embed** | Sub-embedded, owned by lesson |
| appointments.timeSlot + ruleMatchMeta | **Embed** | Time slot is parent-owned appointment detail; match meta is transparent audit of rule-based query |
| users → appointments/bloodRequests/enrollments | **Reference** | Reused across modules, independently queried, many-to-many |
| doctorProfiles → appointments/reviews | **Reference** | Doctors reused, queried independently, need population |
| bloodRequests → bloodDonations | **Reference** | Donations link many donors to many requests, independent lifecycle |
| courses → enrollments | **Reference** | Many users enroll many courses, enrollments queried independently |
| users → articles/courses (author/instructor) | **Reference** | Users reused as authors, queried independently |

---

## Indexes Summary (Production)
- Unique `users.email` prevents duplicate accounts.
- `2dsphere` on `doctorProfiles.location`, `donorProfiles.location`, `bloodRequests.location`, `bloodDonations.location`, `patientProfiles.location` enables geo-queries (nearest donor/doctor).
- `text` on `doctorProfiles.specialization+bio+clinicName`, `courses.title+description+tags`, `articles.title+content+tags` for search.
- Compound unique `doctorId+appointmentDate+timeSlot.startTime` enforces rule-based availability (no double booking).
- Compound unique `userId+courseId` prevents duplicate enrollments.
- Unique `licenseNumber`, `slug` enforce business constraints.
