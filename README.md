# CuraNet — One Website for Every Health Decision (MERN)

## MongoDB Atlas Provisioning
Connection string in `db.txt` → copied to `.env` as `MONGO_URI` (never hardcoded).

### Quick Start
```bash
npm install
npm run seed   # provisions schemas, indexes, demo data
npm run verify # checks counts & indexes
```

### Collections (11)
`users` (shared identity) → `doctorProfiles`, `donorProfiles`, `patientProfiles` (extension via userId) → `bloodRequests`, `bloodDonations`, `appointments`, `reviews`, `courses` (lessons embedded), `enrollments`, `articles`.

See `SCHEMA.md` for full fields/validation, `ER_DIAGRAM.md` for Mermaid/text diagram, `samples/sample-documents.json` for sample docs.

### Key Indexes
- Unique `users.email`, `doctorProfiles.licenseNumber`, `courses.slug`, `articles.slug`
- `2dsphere` on all location fields (donor/doctor/bloodRequest geospatial)
- Text indexes on doctor search, courses, articles
- Unique `doctorId+appointmentDate+timeSlot.startTime` prevents double booking
- Unique `userId+courseId` prevents duplicate enrollments

### Transparent Rule-Based Matching (not AI black-box)
- Doctor: `specialty + location $near + availabilitySlots + isVerifiedByAdmin` sorted by rating/fee
- Blood: `bloodGroup + isAvailable + healthStatus + location $near`
- See seed end logs for demo queries.

### Embed vs Reference — Summary
Embed: `availabilitySlots` in doctor, `emergencyContact` in patient, `lessons` in course, `timeSlot/ruleMatchMeta` in appointment.
Reference: all cross-module entities via ObjectId (users, doctors, courses, requests).

### Env
```
MONGO_URI=mongodb://curanetdb:***@ac-lw1esrd-shard-00-*.mongodb.net:27017,.../?ssl=true&replicaSet=atlas-y2z4bu-shard-0&authSource=admin&appName=Cluster0
DB_NAME=curanet
```
