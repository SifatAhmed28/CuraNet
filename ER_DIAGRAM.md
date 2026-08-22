# CuraNet — Collection Relationship Diagram

## Mermaid ER Diagram
```mermaid
erDiagram
    users ||--o| doctorProfiles : "1:1 userId (doctor role)"
    users ||--o| donorProfiles : "1:1 userId (donor role)"
    users ||--o| patientProfiles : "1:1 userId (patient role)"
    users ||--o{ bloodRequests : "1:N requesterId"
    users ||--o{ bloodDonations : "1:N donorUserId"
    users ||--o{ appointments : "1:N patientId"
    users ||--o{ enrollments : "1:N userId"
    users ||--o{ courses : "1:N instructorId"
    users ||--o{ articles : "1:N authorId"
    users ||--o{ reviews : "1:N patientId"

    doctorProfiles ||--o{ appointments : "1:N doctorId (rule-based match)"
    doctorProfiles ||--o{ reviews : "1:N doctorId"

    donorProfiles ||--o{ bloodDonations : "1:N donorId"
    donorProfiles ||--o| bloodRequests : "0:1 fulfilledByDonorId"

    bloodRequests ||--o{ bloodDonations : "1:N requestId"

    appointments ||--o| reviews : "1:1 appointmentId (unique)"

    courses ||--o{ enrollments : "1:N courseId"
    courses }o--o{ lessons : "1:N embedded (no ref)"

    %% Embedded (no separate collection)
    doctorProfiles }o--o{ availabilitySlots : "embedded"
    patientProfiles }o--o{ emergencyContact : "embedded"
    appointments }o--o{ timeSlot : "embedded"
    appointments }o--o{ ruleMatchMeta : "embedded"
    courses }o--o{ quizQuestions : "embedded in lessons"

    users {
        ObjectId _id PK
        string email UK
        string role "guest/patient/doctor/donor/admin"
        string additionalRoles
        string passwordHash
        boolean isVerified
    }
    doctorProfiles {
        ObjectId _id PK
        ObjectId userId FK_UK
        string specialization "text index"
        string licenseNumber UK
        GeoPoint location "2dsphere"
        embedded availabilitySlots
    }
    donorProfiles {
        ObjectId _id PK
        ObjectId userId FK_UK
        string bloodGroup
        GeoPoint location "2dsphere"
        boolean isAvailable
    }
    patientProfiles {
        ObjectId _id PK
        ObjectId userId FK_UK
        string bloodGroup
        embedded emergencyContact
    }
    bloodRequests {
        ObjectId _id PK
        ObjectId requesterId FK
        string bloodGroup
        string urgency
        string status
        GeoPoint location "2dsphere"
    }
    bloodDonations {
        ObjectId _id PK
        ObjectId donorId FK
        ObjectId requestId FK
    }
    appointments {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId doctorId FK
        date appointmentDate
        embedded timeSlot
        string status
        embedded ruleMatchMeta
    }
    reviews {
        ObjectId _id PK
        ObjectId doctorId FK
        ObjectId appointmentId FK_UK
        int rating
    }
    courses {
        ObjectId _id PK
        string slug UK
        string category
        ObjectId instructorId FK
        embedded lessons
    }
    enrollments {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId courseId FK
        int progress
    }
    articles {
        ObjectId _id PK
        string slug UK
        ObjectId authorId FK
        string category
    }
```

## Text-Based Diagram
```
[users]──────────────────────────────────────────────────────────┐
  PK _id (ObjectId)                                              │
  UK email            ─────┐                                     │
  role: guest|patient|doctor|donor|admin (discriminator)        │
  additionalRoles[] ─── multi-role support                        │
                                                                 │
  1:1 ──(userId unique)──► [doctorProfiles]                      │
  │                         specialization[] (text)               │
  │                         licenseNumber UK                      │
  │                         location 2dsphere                     │
  │                         availabilitySlots[] EMBEDDED          │
  │                         ◄── appointments (rule-based)        │
  │                                                              │
  1:1 ──(userId unique)──► [donorProfiles]                       │
  │                         bloodGroup + isAvailable (compound)  │
  │                         location 2dsphere ──► geo query      │
  │                         donorId ──► [bloodDonations]         │
  │                                                              │
  1:1 ──(userId unique)──► [patientProfiles]                     │
  │                         emergencyContact EMBEDDED             │
  │                         bloodGroup                           │
  1:N ──(requesterId)──► [bloodRequests] ◄── fulfillment ──┐     │
  │                         status/urgency/bloodGroup      │     │
  │                         location 2dsphere              │     │
  │                         1:N ──► [bloodDonations]──────┘     │
  │                                                              │
  1:N ──(patientId)────► [appointments] ── 1:1 ──► [reviews]     │
  │                         doctorId ──┐                         │
  │                         timeSlot EMBEDDED                    │
  │                         ruleMatchMeta EMBEDDED (transparent) │
  │                                                              │
  1:N ──(instructorId)─► [courses] ── 1:N ──► [enrollments] ◄─┐  │
  │                         lessons[] EMBEDDED  (quiz EMBEDDED)  │ 1:N
  │                         slug UK, category, level             │ (userId)
  1:N ──(authorId)─────► [articles]                              │
                            slug UK, category, text index        │
                                                                 │
  [users] is central hub — all modules share one ObjectId ───────┘
```

## Transparent Rule-Based Matching (No AI Black-Box)
- Doctor matchmaking: `find({ specialization: req, isVerifiedByAdmin:true, location: {$near: patientLoc, maxDistance:10km}, availabilitySlots: {$elemMatch: {dayOfWeek, isAvailable:true}} })` + sort by rating/fee.
- Blood donor search: `find({ bloodGroup: requestedGroup, isAvailable:true, healthStatus:'eligible', location: {$near: hospitalLoc}})`
- Course/articles: text search `{$text: {$search: query}}` + filters category/level.
