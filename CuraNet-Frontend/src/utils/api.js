const API_BASE = "/api";

/**
 * Get stored auth token
 */
function getToken() {
  return localStorage.getItem("curanet_token");
}

/**
 * Build headers with optional auth
 */
function headers(extra = {}) {
  const h = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/**
 * Generic fetch wrapper — returns parsed JSON, throws on error
 */
async function request(method, path, body = null) {
  const opts = { method, headers: headers() };
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Convenience methods
const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};

// Auth helpers
api.auth = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  google: (data) => api.post("/auth/google", data),
  me: () => api.get("/auth/me"),
  sendVerification: () => api.post("/auth/verify/send"),
  confirmVerification: (code) => api.post("/auth/verify/confirm", { code }),
};

// Doctors
api.doctors = {
  list: (params = "") => api.get(`/doctors${params ? `?${params}` : ""}`),
  get: (id) => api.get(`/doctors/${id}`),
  getMe: () => api.get("/doctors/me"),
  updateMe: (data) => api.put("/doctors/me", data),
  updateProfile: (id, data) => api.put(`/doctors/${id}`, data),
  match: (symptoms) => api.get(`/doctors/match?symptoms=${encodeURIComponent(symptoms)}`),
  locations: () => api.get("/doctors/locations"),
};

// Appointments
api.appointments = {
  create: (data) => api.post("/appointments", data),
  list: (params = "") => api.get(`/appointments${params ? `?${params}` : ""}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id, data = {}) => api.put(`/appointments/${id}/cancel`, data),
  getDoctorSlots: (doctorId, date) => api.get(`/appointments/doctor/${doctorId}/slots?date=${date}`),
  createPaymentIntent: (data) => api.post("/appointments/payment-intent", data),
  confirmPayment: (data) => api.post("/appointments/confirm-payment", data),
};

// Reviews
api.reviews = {
  create: (data) => api.post("/reviews", data),
  forDoctor: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
};

// Blood
api.blood = {
  stats: () => api.get("/blood/stats"),
  requests: (params = "") => api.get(`/blood/requests${params ? `?${params}` : ""}`),
  myRequests: () => api.get("/blood/requests/mine"),
  createRequest: (data) => api.post("/blood/requests", data),
  donors: (params = "") => api.get(`/blood/donors${params ? `?${params}` : ""}`),
  myDonorProfile: () => api.get("/blood/donors/me"),
  registerDonor: (data) => api.post("/blood/donors", data),
};

// Courses
api.courses = {
  list: (params = "") => api.get(`/courses${params ? `?${params}` : ""}`),
  get: (idOrSlug) => api.get(`/courses/${idOrSlug}`),
  create: (data) => api.post("/courses", data),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  completeLesson: (courseId, lessonId) => api.put(`/courses/${courseId}/lessons/${lessonId}/complete`),
  myEnrollments: () => api.get("/courses/enrollments/me"),
};

// Articles
api.articles = {
  list: (params = "") => api.get(`/articles${params ? `?${params}` : ""}`),
  get: (slug) => api.get(`/articles/${slug}`),
  create: (data) => api.post("/articles", data),
  like: (id) => api.post(`/articles/${id}/like`),
};

// Users & Profile
api.users = {
  profile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
};

// Admin Management
api.admin = {
  stats: () => api.get("/users/admin/stats"),
  users: (params = "") => api.get(`/users${params ? `?${params}` : ""}`),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
};

export default api;
