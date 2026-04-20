const BASE = 'http://localhost:8080/api';

async function req(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const interactionApi = {
  // Users
  getAlumni: () => req('/users/alumni'),
  getStudents: () => req('/users/students'),
  getProfile: (email: string) => req(`/users/${encodeURIComponent(email)}`),
  updateProfile: (email: string, data: any) =>
    req(`/users/${encodeURIComponent(email)}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Mentorship
  sendMentorshipRequest: (studentEmail: string, alumniEmail: string, message: string) =>
    req('/mentorship/request', { method: 'POST', body: JSON.stringify({ studentEmail, alumniEmail, message }) }),
  updateMentorshipStatus: (id: string, status: string, scheduledAt?: string) =>
    req(`/mentorship/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, scheduledAt }) }),
  getStudentMentorships: (email: string) => req(`/mentorship/student/${encodeURIComponent(email)}`),
  getAlumniMentorships: (email: string) => req(`/mentorship/alumni/${encodeURIComponent(email)}`),

  // Chat
  sendMessage: (senderEmail: string, senderName: string, receiverEmail: string, content: string) =>
    req('/chat/send', { method: 'POST', body: JSON.stringify({ senderEmail, senderName, receiverEmail, content }) }),
  getConversation: (user1: string, user2: string) =>
    req(`/chat/conversation?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`),
  getChatPartners: (email: string) => req(`/chat/partners/${encodeURIComponent(email)}`),
  markRead: (senderEmail: string, receiverEmail: string) =>
    req('/chat/read', { method: 'PUT', body: JSON.stringify({ senderEmail, receiverEmail }) }),

  // Jobs
  getJobs: () => req('/jobs'),
  getAlumniJobs: (email: string) => req(`/jobs/alumni/${encodeURIComponent(email)}`),
  postJob: (data: any) => req('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  applyJob: (jobId: string, studentEmail: string) =>
    req(`/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify({ studentEmail }) }),

  // Events
  getEvents: () => req('/events'),
  getPublishedEvents: () => req('/events/status/PUBLISHED'),
  submitAlumniEvent: (data: any) => req('/events', { method: 'POST', body: JSON.stringify({ ...data, status: 'PENDING_APPROVAL' }) }),
  getMySubmittedEvents: (createdBy: string) => req(`/events`).then((r: any) => ({
    ...r,
    data: (r.data || []).filter((e: any) => e.createdBy === createdBy)
  })),

  // Event Registrations
  registerForEvent: (eventId: string, userEmail: string, userName: string, userRole: string) =>
    req('/event-registrations/register', { method: 'POST', body: JSON.stringify({ eventId, userEmail, userName, userRole }) }),
  getEventRegistrations: (eventId: string) => req(`/event-registrations/event/${encodeURIComponent(eventId)}`),
  checkEventRegistration: (eventId: string, userEmail: string) =>
    req(`/event-registrations/check?eventId=${encodeURIComponent(eventId)}&userEmail=${encodeURIComponent(userEmail)}`),
};
