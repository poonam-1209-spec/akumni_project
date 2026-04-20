'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, MapPin, Users, RefreshCw, AlertCircle, Link, Copy, Check, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Event } from '@/lib/types';
import { EventPoster, PosterData } from '@/components/event-poster';

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'REUNION' as const,
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    location: '',
    capacity: '',
    targetAudience: 'BOTH',
  });
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventsRes, pendingRes] = await Promise.all([
        apiClient.getAllEvents(),
        apiClient.getPendingApprovalEvents(),
      ]);
      setEvents(eventsRes.data || []);
      setPendingEvents(pendingRes.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Combine date and startTime into a single ISO datetime string
      const eventDateTime = `${formData.date}T${formData.startTime}:00`;
      
      const newEvent = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        eventDate: eventDateTime,
        location: formData.location,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        status: 'DRAFT',
        targetAudience: formData.targetAudience,
      };

      const response = await apiClient.createEvent(newEvent);
      setEvents([...events, response.data]);
      // Show poster
      setPosterData({
        title: formData.title,
        eventType: formData.eventType,
        date: new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: `${formData.startTime} – ${formData.endTime}`,
        location: formData.location || 'TBD',
        organizer: 'Admin',
        description: formData.description,
      });
      setFormData({
        title: '',
        description: '',
        eventType: 'REUNION',
        date: '',
        startTime: '10:00',
        endTime: '12:00',
        location: '',
        capacity: '',
        targetAudience: 'BOTH',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create event:', err);
      alert(`Failed to create event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await apiClient.deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const event = events.find(e => e.id === id);
      if (!event) return;
      await apiClient.updateEvent(id, {
        title: event.title,
        description: event.description,
        eventDate: event.eventDate || event.date,
        eventType: event.eventType,
        location: event.location,
        capacity: event.capacity,
        status,
      });
      setEvents(events.map(e => (e.id === id ? { ...e, status } : e)));
    } catch (err) {
      console.error('Failed to update event status:', err);
      alert('Failed to update event status');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await apiClient.approveEvent(id);
      const approved = res.data || pendingEvents.find(e => e.id === id);
      setPendingEvents(prev => prev.filter(e => e.id !== id));
      await loadEvents();
      if (approved) {
        setPosterData({
          title: approved.title,
          eventType: approved.eventType as string,
          date: new Date(approved.eventDate || (approved as any).date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          time: (approved as any).startTime ? `${(approved as any).startTime}` : 'See event details',
          location: approved.location || 'TBD',
          organizer: (approved as any).createdBy || 'Alumni',
          description: approved.description,
        });
      }
    } catch (err) {
      alert('Failed to approve event');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this event?')) return;
    try {
      await apiClient.rejectEvent(id);
      setPendingEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to reject event');
    }
  };

  const copyLink = (eventId: string, eventTitle: string) => {
    const link = `${window.location.origin}/student-dashboard?tab=events&highlight=${eventId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(eventId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={loadEvents}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.eventDate || e.date) > new Date()).sort((a, b) => 
    new Date(a.eventDate || a.date).getTime() - new Date(b.eventDate || b.date).getTime()
  );

  const pastEvents = events.filter(e => new Date(e.eventDate || e.date) <= new Date()).sort((a, b) => 
    new Date(b.eventDate || b.date).getTime() - new Date(a.eventDate || a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {posterData && <EventPoster data={posterData} onClose={() => setPosterData(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Create Event Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="REUNION">Reunion</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="WEBINAR">Webinar</option>
                <option value="NETWORKING">Networking</option>
                <option value="SEMINAR">Seminar</option>
              </select>
            </div>

            <textarea
              placeholder="Event Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BOTH">For Everyone (Students & Alumni)</option>
              <option value="STUDENT">Students Only</option>
              <option value="ALUMNI">Alumni Only</option>
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create Event
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Approvals */}
      {pendingEvents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pending Approval ({pendingEvents.length})
          </h2>
          <div className="space-y-3">
            {pendingEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg border border-amber-100 p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{event.eventType?.toLowerCase()}</span>
                    <span>{new Date(event.eventDate || (event as any).date).toLocaleDateString()}</span>
                    {event.location && <span>{event.location}</span>}
                    {(event as any).createdBy && <span>by {(event as any).createdBy}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(event.id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(event.id)}
                    className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="space-y-6">
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-blue-600 capitalize">{event.eventType}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.eventDate || event.date).toLocaleDateString()} • {event.startTime}-{event.endTime}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4" />
                      <span>{event.registeredCount}{event.capacity ? `/${event.capacity}` : ''} registered</span>
                    </div>
                  </div>

                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event.id, e.target.value as Event['status'])}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ONGOING">Ongoing</option>
                  </select>

                  {/* Share Link */}
                  <button
                    onClick={() => copyLink(event.id, event.title)}
                    className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      copiedId === event.id
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {copiedId === event.id ? (
                      <><Check className="w-4 h-4" /> Link Copied!</>
                    ) : (
                      <><Link className="w-4 h-4" /> Copy Share Link</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
              {pastEvents.map(event => (
                <div key={event.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{new Date(event.eventDate || event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{event.description}</p>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 text-lg">No events created yet</p>
            <p className="text-gray-500">Create your first event to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
