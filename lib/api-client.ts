/**
 * API Client for Spring Boot Backend
 * Handles all HTTP requests to the Spring Boot server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Alumni Endpoints
  async getAllAlumni() {
    const response = await fetch(`${this.baseUrl}/alumni`);
    return this.handleResponse(response);
  }

  async getAlumniById(id: string) {
    const response = await fetch(`${this.baseUrl}/alumni/${id}`);
    return this.handleResponse(response);
  }

  async createAlumni(data: any) {
    const response = await fetch(`${this.baseUrl}/alumni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateAlumni(id: string, data: any) {
    const response = await fetch(`${this.baseUrl}/alumni/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteAlumni(id: string) {
    const response = await fetch(`${this.baseUrl}/alumni/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  async uploadAlumniCSV(file: File) {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${this.baseUrl}/alumni/upload`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Events Endpoints
  async getAllEvents() {
    const response = await fetch(`${this.baseUrl}/events`);
    return this.handleResponse(response);
  }

  async getEventById(id: string) {
    const response = await fetch(`${this.baseUrl}/events/${id}`);
    return this.handleResponse(response);
  }

  async createEvent(data: any) {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateEvent(id: string, data: any) {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteEvent(id: string) {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  async getAlumniByBranch(branch: string) {
    const response = await fetch(`${this.baseUrl}/alumni/branch/${branch}`);
    return this.handleResponse(response);
  }

  async getAlumniByYear(year: number) {
    const response = await fetch(`${this.baseUrl}/alumni/year/${year}`);
    return this.handleResponse(response);
  }

  async searchAlumni(query: string) {
    const response = await fetch(`${this.baseUrl}/alumni/search?query=${encodeURIComponent(query)}`);
    return this.handleResponse(response);
  }

  async getAlumniStatistics() {
    const response = await fetch(`${this.baseUrl}/alumni/stats/overview`);
    return this.handleResponse(response);
  }

  // Events Endpoints (Extended)
  async getUpcomingEvents() {
    const response = await fetch(`${this.baseUrl}/events/upcoming`);
    return this.handleResponse(response);
  }

  async getPastEvents() {
    const response = await fetch(`${this.baseUrl}/events/past`);
    return this.handleResponse(response);
  }

  async getEventsByType(type: string) {
    const response = await fetch(`${this.baseUrl}/events/type/${type}`);
    return this.handleResponse(response);
  }

  async getEventsByStatus(status: string) {
    const response = await fetch(`${this.baseUrl}/events/status/${status}`);
    return this.handleResponse(response);
  }

  async searchEvents(query: string) {
    const response = await fetch(`${this.baseUrl}/events/search?query=${encodeURIComponent(query)}`);
    return this.handleResponse(response);
  }

  async getEventStatistics() {
    const response = await fetch(`${this.baseUrl}/events/stats/overview`);
    return this.handleResponse(response);
  }

  async getPendingApprovalEvents() {
    const response = await fetch(`${this.baseUrl}/events/pending-approval`);
    return this.handleResponse(response);
  }

  async approveEvent(id: string) {
    const response = await fetch(`${this.baseUrl}/events/${id}/approve`, { method: 'PUT' });
    return this.handleResponse(response);
  }

  async rejectEvent(id: string) {
    const response = await fetch(`${this.baseUrl}/events/${id}/reject`, { method: 'PUT' });
    return this.handleResponse(response);
  }

  // Attendance Endpoints
  async registerForEvent(eventId: string, alumniId: string) {
    const response = await fetch(`${this.baseUrl}/attendance/register?eventId=${eventId}&alumniId=${alumniId}`, {
      method: 'POST',
    });
    return this.handleResponse(response);
  }

  async markAttendance(eventId: string, alumniId: string) {
    const response = await fetch(`${this.baseUrl}/attendance/check-in?eventId=${eventId}&alumniId=${alumniId}`, {
      method: 'POST',
    });
    return this.handleResponse(response);
  }

  async getEventAttendance(eventId: string) {
    const response = await fetch(`${this.baseUrl}/attendance/event/${eventId}`);
    return this.handleResponse(response);
  }

  async getAttendedEventsByAlumni(alumniId: string) {
    const response = await fetch(`${this.baseUrl}/attendance/alumni/${alumniId}`);
    return this.handleResponse(response);
  }

  async getAttendanceRate(eventId: string) {
    const response = await fetch(`${this.baseUrl}/attendance/event/${eventId}/rate`);
    return this.handleResponse(response);
  }

  async getEventAttendanceStats(eventId: string) {
    const response = await fetch(`${this.baseUrl}/attendance/event/${eventId}/stats`);
    return this.handleResponse(response);
  }

  async getAllAttendance() {
    const response = await fetch(`${this.baseUrl}/attendance`);
    return this.handleResponse(response);
  }

  async updateAttendanceStatus(id: string, status: string) {
    const response = await fetch(`${this.baseUrl}/attendance/${id}/status?status=${status}`, {
      method: 'PUT',
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
