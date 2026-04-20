'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { interactionApi } from '@/lib/interaction-api';
import { AlumniChatbot } from '@/components/alumni-chatbot';
import { EventPoster, PosterData, EventPosterCard } from '@/components/event-poster';
import {
  LogOut, User, MessageCircle, Briefcase, GraduationCap, Users,
  Bell, Send, CheckCircle, XCircle, Clock, Plus, X, Calendar,
  TrendingUp, MapPin, Sparkles, ArrowRight, Zap, Star
} from 'lucide-react';
type Tab = 'dashboard' | 'requests' | 'chat' | 'jobs' | 'profile' | 'events';

const AVATARS = ['🧑‍💻','👩‍💼','👨‍🔬','👩‍🎓','🧑‍🏫','👨‍💻','👩‍💻','🧑‍🎓'];
const getAvatar = (email: string) => AVATARS[email.charCodeAt(0) % AVATARS.length];
const getBg = (email: string) => {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-indigo-500','bg-teal-500'];
  return colors[email.charCodeAt(0) % colors.length];
};

export default function AlumniDashboard() {
  const { user, checking, logout } = useAuth('ALUMNI');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [requests, setRequests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [chatPartners, setChatPartners] = useState<string[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [sending, setSending] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', description: '', location: '', skills: '', type: 'Full-time' });
  const [events, setEvents] = useState<any[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [mySubmittedEvents, setMySubmittedEvents] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventType: 'WORKSHOP', date: '', startTime: '10:00', location: '', capacity: '', targetAudience: 'BOTH' });
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const [viewStudentProfile, setViewStudentProfile] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({ name: '', phone: '', branch: '', graduationYear: '' });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`photo_${user.email}`);
      if (saved) setProfilePhoto(saved);
    }
  }, [user?.email]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    interactionApi.getAlumniJobs(user.email).then(r => setJobs(r.data || []));
    interactionApi.getChatPartners(user.email).then(r => setChatPartners(r.data || []));
    interactionApi.getEvents().then(r => setEvents((r.data || []).filter((e: any) => e.targetAudience === 'ALUMNI' || e.targetAudience === 'BOTH' || !e.targetAudience)));
    interactionApi.getMySubmittedEvents(user.email).then(r => setMySubmittedEvents(r.data || []));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    interactionApi.getAlumniMentorships(user.email).then(r => setRequests(r.data || []));
  }, [user, tab]);

  useEffect(() => {
    if (activeChat && user) {
      interactionApi.getConversation(user.email, activeChat).then(r => {
        setMessages(r.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
    }
  }, [activeChat, user]);

  const updateRequest = async (id: string, status: string, scheduledAt?: string) => {
    const r = await interactionApi.updateMentorshipStatus(id, status, scheduledAt);
    if (r.success) {
      showToast(`Request ${status.toLowerCase()}`);
      interactionApi.getAlumniMentorships(user!.email).then(r => setRequests(r.data || []));
      setScheduleId(null); setScheduleTime('');
    }
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChat || !user || sending) return;
    setSending(true);
    await interactionApi.sendMessage(user.email, user.name, activeChat, msgInput);
    setMsgInput('');
    setSending(false);
    interactionApi.getConversation(user.email, activeChat).then(r => {
      setMessages(r.data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    if (!chatPartners.includes(activeChat)) setChatPartners(p => [...p, activeChat]);
  };

  const postJob = async () => {
    if (!user || !jobForm.title || !jobForm.company) { showToast('Title and company are required', 'error'); return; }
    const r = await interactionApi.postJob({ ...jobForm, alumniEmail: user.email });
    if (r.success) {
      showToast('Job posted successfully!');
      setShowJobForm(false);
      setJobForm({ title: '', company: '', description: '', location: '', skills: '', type: 'Full-time' });
      interactionApi.getAlumniJobs(user.email).then(r => setJobs(r.data || []));
    }
  };

  const pending = requests.filter(r => r.status === 'PENDING');
  const accepted = requests.filter(r => r.status === 'ACCEPTED');

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-blue-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Home', icon: Sparkles },
    { id: 'requests' as Tab, label: 'Mentorship', icon: Users, badge: pending.length },
    { id: 'chat' as Tab, label: 'Messages', icon: MessageCircle },
    { id: 'jobs' as Tab, label: 'Jobs', icon: Briefcase },
    { id: 'events' as Tab, label: 'Events', icon: Calendar },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-60 bg-slate-900 flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Alumni Portal</p>
              <p className="text-slate-400 text-xs">Alumni Network</p>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${getBg(user?.email || '')} rounded-xl flex items-center justify-center text-lg overflow-hidden`}>
                {profilePhoto
                  ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                  : getAvatar(user?.email || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-3">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 ml-60">
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-2xl text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        <div className="p-6 max-w-6xl mx-auto">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-7 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
                  <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-blue-200 text-sm">Help students grow — review mentorship requests and post opportunities</p>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setTab('requests')}
                      className="flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                      View Requests <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowJobForm(true)}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                      <Plus className="w-4 h-4" /> Post a Job
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Pending Requests', value: pending.length, icon: Clock, color: 'from-amber-500 to-orange-500', sub: 'awaiting response' },
                  { label: 'Active Mentorships', value: accepted.length, icon: CheckCircle, color: 'from-blue-500 to-blue-700', sub: 'students mentoring' },
                  { label: 'Jobs Posted', value: jobs.length, icon: Briefcase, color: 'from-slate-500 to-slate-700', sub: 'opportunities shared' },
                ].map(c => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-lg p-5 text-white`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/20 p-2.5 rounded-xl"><Icon className="w-5 h-5" /></div>
                        <TrendingUp className="w-4 h-4 text-white/60" />
                      </div>
                      <p className="text-3xl font-bold">{c.value}</p>
                      <p className="text-white/80 text-xs mt-1">{c.label}</p>
                      <p className="text-white/60 text-xs">{c.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Pending requests */}
              {pending.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900">Pending Requests</h2>
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">{pending.length}</span>
                    </div>
                    <button onClick={() => setTab('requests')} className="text-xs text-blue-600 hover:underline">View all →</button>
                  </div>
                  <div className="space-y-3">
                    {pending.slice(0, 3).map((r: any) => (
                      <div key={r.id} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className={`w-11 h-11 ${getBg(r.studentEmail)} rounded-xl flex items-center justify-center text-xl shrink-0`}>
                          {getAvatar(r.studentEmail)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{r.studentName}</p>
                          <p className="text-xs text-gray-500 truncate">{r.message?.slice(0, 60)}...</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => updateRequest(r.id, 'ACCEPTED')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button onClick={() => updateRequest(r.id, 'REJECTED')}
                            className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MENTORSHIP REQUESTS ── */}
          {tab === 'requests' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentorship Requests</h1>
                <p className="text-gray-500 text-sm mt-1">{requests.length} total · {pending.length} pending</p>
              </div>
              {requests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">No requests yet</h3>
                  <p className="text-gray-400 text-sm">Students will reach out to you for mentorship</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r: any) => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${getBg(r.studentEmail)} rounded-2xl flex items-center justify-center text-xl shrink-0 overflow-hidden`}>
                          {typeof window !== 'undefined' && localStorage.getItem(`photo_${r.studentEmail}`)
                            ? <img src={localStorage.getItem(`photo_${r.studentEmail}`)!} alt={r.studentName} className="w-full h-full object-cover" />
                            : getAvatar(r.studentEmail)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{r.studentName}</p>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              r.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                              r.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {r.status === 'ACCEPTED' ? '✓ Accepted' : r.status === 'REJECTED' ? '✗ Rejected' : '⏳ Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{r.studentEmail}</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{r.message}</p>
                          <button onClick={async () => {
                            const res = await interactionApi.getProfile(r.studentEmail);
                            setViewStudentProfile(res.data || { name: r.studentName, email: r.studentEmail });
                          }} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            <User className="w-3 h-3" /> View Profile
                          </button>
                          {r.scheduledAt && (
                            <div className="flex items-center gap-2 mt-3 bg-blue-50 rounded-xl px-3 py-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <p className="text-xs text-blue-700 font-medium">
                                Session: {new Date(r.scheduledAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {scheduleId === r.id && (
                            <div className="mt-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                              <p className="text-sm font-semibold text-blue-800 mb-2">📅 Schedule Session</p>
                              <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                                className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <div className="flex gap-2">
                                <button onClick={() => updateRequest(r.id, 'ACCEPTED', scheduleTime)}
                                  className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-blue-700">Confirm</button>
                                <button onClick={() => setScheduleId(null)}
                                  className="flex-1 border border-gray-200 text-xs font-medium py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                        {r.status === 'PENDING' && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => updateRequest(r.id, 'ACCEPTED')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button onClick={() => setScheduleId(r.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Schedule
                            </button>
                            <button onClick={() => updateRequest(r.id, 'REJECTED')}
                              className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {r.status === 'ACCEPTED' && (
                          <button onClick={() => { setActiveChat(r.studentEmail); setTab('chat'); }}
                            className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5" /> Chat
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Student Profile Modal */}
          {viewStudentProfile && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">Student Profile</h3>
                  <button onClick={() => setViewStudentProfile(null)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-16 h-16 ${getBg(viewStudentProfile.email)} rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden`}>
                    {typeof window !== 'undefined' && localStorage.getItem(`photo_${viewStudentProfile.email}`)
                      ? <img src={localStorage.getItem(`photo_${viewStudentProfile.email}`)!} alt={viewStudentProfile.name} className="w-full h-full object-cover" />
                      : getAvatar(viewStudentProfile.email)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{viewStudentProfile.name}</p>
                    <p className="text-xs text-gray-500">{viewStudentProfile.email}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Student</span>
                  </div>
                </div>
                <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                  {[
                    { label: 'Branch', value: viewStudentProfile.branch },
                    { label: 'Graduation Year', value: viewStudentProfile.graduationYear },
                    { label: 'Phone', value: viewStudentProfile.phone },
                    { label: 'Location', value: viewStudentProfile.location },
                    { label: 'Skills', value: viewStudentProfile.skills },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{f.label}</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{String(f.value)}</span>
                    </div>
                  ))}
                  {!viewStudentProfile.branch && !viewStudentProfile.phone && !viewStudentProfile.location && (
                    <p className="text-xs text-gray-400 text-center">No additional details available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CHAT ── */}
          {tab === 'chat' && (
            <div className="h-[calc(100vh-7rem)] flex gap-4">
              <div className="w-72 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="p-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900">Messages</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{chatPartners.length} conversations</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {chatPartners.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No conversations yet</p>
                    </div>
                  ) : chatPartners.map(p => (
                    <button key={p} onClick={() => setActiveChat(p)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        activeChat === p ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
                      }`}>
                      <div className={`w-10 h-10 ${getBg(p)} rounded-xl flex items-center justify-center text-lg shrink-0`}>
                        {getAvatar(p)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.split('@')[0]}</p>
                        <p className="text-xs text-gray-400 truncate">{p}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                {!activeChat ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-10 h-10 text-blue-300" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">Select a conversation</h3>
                      <p className="text-sm text-gray-400">Choose a student to start chatting</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                      <div className={`w-10 h-10 ${getBg(activeChat)} rounded-xl flex items-center justify-center text-lg`}>
                        {getAvatar(activeChat)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{activeChat.split('@')[0]}</p>
                        <p className="text-xs text-gray-400">{activeChat}</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                      {messages.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
                        </div>
                      )}
                      {messages.map((m: any) => (
                        <div key={m.id} className={`flex ${m.senderEmail === user?.email ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-sm flex flex-col gap-1 ${m.senderEmail === user?.email ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                              m.senderEmail === user?.email
                                ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}>{m.content}</div>
                            <p className="text-xs text-gray-400 px-1">
                              {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex gap-2 bg-gray-50 rounded-2xl p-2">
                        <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-800 placeholder-gray-400" />
                        <button onClick={sendMessage} disabled={!msgInput.trim() || sending}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── JOBS ── */}
          {tab === 'jobs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Job Posts</h1>
                  <p className="text-gray-500 text-sm mt-1">{jobs.length} jobs posted</p>
                </div>
                <button onClick={() => setShowJobForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md">
                  <Plus className="w-4 h-4" /> Post a Job
                </button>
              </div>
              {jobs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-400 text-sm mb-5">Share opportunities with students</p>
                  <button onClick={() => setShowJobForm(true)}
                    className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                    Post First Job
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((j: any) => (
                    <div key={j.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{j.title}</p>
                            <p className="text-sm text-gray-600">{j.company}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          j.type === 'Internship' ? 'bg-blue-100 text-blue-700' :
                          j.type === 'Part-time' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>{j.type}</span>
                      </div>
                      {j.location && <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{j.location}</p>}
                      {j.skills && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {j.skills.split(',').map((s: string) => (
                            <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{s.trim()}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <p className="text-xs text-gray-400">{j.applicants?.length || 0} applicant(s)</p>
                        <span className="text-xs text-blue-600 font-medium">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post job modal */}
              {showJobForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">Post a Job</h3>
                      <button onClick={() => setShowJobForm(false)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: 'title', placeholder: 'Job Title *', required: true },
                        { key: 'company', placeholder: 'Company *', required: true },
                        { key: 'location', placeholder: 'Location (e.g. Bangalore / Remote)' },
                        { key: 'skills', placeholder: 'Skills (e.g. React, Java, Python)' },
                      ].map(f => (
                        <input key={f.key} placeholder={f.placeholder}
                          value={(jobForm as any)[f.key]}
                          onChange={e => setJobForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ))}
                      <select value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        {['Full-time','Part-time','Internship','Contract'].map(t => <option key={t}>{t}</option>)}
                      </select>
                      <textarea placeholder="Job description..." rows={3}
                        value={jobForm.description}
                        onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      <button onClick={postJob}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-all shadow-lg">
                        Post Job ✨
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <button onClick={() => {
                  setProfileForm({ name: user?.name || '', phone: user?.phone || '', branch: user?.branch || '', graduationYear: user?.graduationYear?.toString() || '' });
                  setShowEditProfile(true);
                }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Edit Profile
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-5 mb-6">
                  <div className={`w-20 h-20 ${getBg(user?.email || '')} rounded-3xl flex items-center justify-center text-4xl shadow-lg overflow-hidden`}>
                    {profilePhoto
                      ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                      : getAvatar(user?.email || '')}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="mt-1.5 inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Alumni</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Role', value: 'Alumni' },
                    { label: 'Mentorships', value: `${accepted.length} active` },
                    { label: 'Jobs Posted', value: `${jobs.length} jobs` },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{f.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Profile Modal */}
              {showEditProfile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3>
                      <button onClick={() => setShowEditProfile(false)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {/* Photo Upload */}
                      <div className="flex flex-col items-center gap-2 pb-3 border-b border-gray-100">
                        <div className={`w-20 h-20 ${getBg(user?.email || '')} rounded-2xl overflow-hidden flex items-center justify-center text-4xl shadow`}>
                          {profilePhoto
                            ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                            : getAvatar(user?.email || '')}
                        </div>
                        <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          Upload Photo
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const result = ev.target?.result as string;
                                setProfilePhoto(result);
                                if (user?.email) localStorage.setItem(`photo_${user.email}`, result);
                              };
                              reader.readAsDataURL(file);
                            }} />
                        </label>
                        {profilePhoto && (
                          <button onClick={() => {
                            setProfilePhoto(null);
                            if (user?.email) localStorage.removeItem(`photo_${user.email}`);
                          }} className="text-xs text-red-500 hover:text-red-600">Remove photo</button>
                        )}
                      </div>
                      {[
                        { key: 'name', label: 'Full Name', placeholder: user?.name || '' },
                        { key: 'graduationYear', label: 'Graduation Year', placeholder: 'e.g. 2020' },
                        { key: 'branch', label: 'Degree & Branch', placeholder: 'e.g. CS, IT, ENTC' },
                        { key: 'currentPosition', label: 'Current Job Role', placeholder: 'e.g. Senior Engineer' },
                        { key: 'company', label: 'Company / Organization', placeholder: 'e.g. Infosys' },
                        { key: 'workExperience', label: 'Work Experience (years)', placeholder: 'e.g. 5' },
                        { key: 'location', label: 'Location', placeholder: 'e.g. Mumbai, India' },
                        { key: 'linkedinUrl', label: 'LinkedIn / Professional Profile', placeholder: 'https://linkedin.com/in/...' },
                        { key: 'skills', label: 'Skills & Expertise', placeholder: 'e.g. Java, Spring Boot, AWS' },
                        { key: 'phone', label: 'Phone', placeholder: 'Your phone number' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                          <input placeholder={f.placeholder}
                            value={(profileForm as any)[f.key] || ''}
                            onChange={e => setProfileForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      ))}
                      <button onClick={async () => {
                        if (!user) return;
                        try {
                          const r = await interactionApi.updateProfile(user.email, profileForm);
                          if (r.success || r.id) { showToast('Profile updated!'); setShowEditProfile(false); }
                          else showToast(r.message || 'Failed to update', 'error');
                        } catch (e) {
                          showToast('Failed to update', 'error');
                        }
                      }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── EVENTS ── */}
          {tab === 'events' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Events</h1>
                  <p className="text-gray-500 text-sm mt-1">{events.length} event(s) available</p>
                </div>
                <button
                  onClick={() => setShowCreateEvent(v => !v)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Propose Event
                </button>
              </div>

              {/* Create Event Form */}
              {showCreateEvent && (
                <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Propose a New Event</h2>
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">Your event will be sent to admin for approval before it appears on the student board.</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" placeholder="Event Title" value={eventForm.title}
                        onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <select value={eventForm.eventType}
                        onChange={e => setEventForm(f => ({ ...f, eventType: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="WORKSHOP">Workshop</option>
                        <option value="WEBINAR">Webinar</option>
                        <option value="NETWORKING">Networking</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="REUNION">Reunion</option>
                      </select>
                    </div>
                    <textarea placeholder="Event Description" value={eventForm.description}
                      onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="date" value={eventForm.date}
                        onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <input type="time" value={eventForm.startTime}
                        onChange={e => setEventForm(f => ({ ...f, startTime: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <input type="number" placeholder="Capacity" value={eventForm.capacity}
                        onChange={e => setEventForm(f => ({ ...f, capacity: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <input type="text" placeholder="Location" value={eventForm.location}
                      onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <select value={eventForm.targetAudience}
                      onChange={e => setEventForm(f => ({ ...f, targetAudience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="BOTH">For Everyone (Students & Alumni)</option>
                      <option value="STUDENT">Students Only</option>
                      <option value="ALUMNI">Alumni Only</option>
                    </select>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!user || !eventForm.title || !eventForm.description || !eventForm.date) {
                            showToast('Title, description and date are required', 'error'); return;
                          }
                          const payload = {
                            title: eventForm.title,
                            description: eventForm.description,
                            eventType: eventForm.eventType,
                            eventDate: `${eventForm.date}T${eventForm.startTime}:00`,
                            location: eventForm.location,
                            capacity: eventForm.capacity ? parseInt(eventForm.capacity) : null,
                            createdBy: user.email,
                            targetAudience: eventForm.targetAudience,
                          };
                          const r = await interactionApi.submitAlumniEvent(payload);
                          if (r.success || r.id) {
                            showToast('Event submitted for admin approval!');
                            setPosterData({
                              title: eventForm.title,
                              eventType: eventForm.eventType,
                              date: new Date(eventForm.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                              time: eventForm.startTime,
                              location: eventForm.location || 'TBD',
                              organizer: user.name || user.email,
                              description: eventForm.description,
                            });
                            setShowCreateEvent(false);
                            setEventForm({ title: '', description: '', eventType: 'WORKSHOP', date: '', startTime: '10:00', location: '', capacity: '', targetAudience: 'BOTH' });
                            interactionApi.getMySubmittedEvents(user.email).then(r => setMySubmittedEvents(r.data || []));
                          } else {
                            showToast(r.message || 'Failed to submit event', 'error');
                          }
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                        Submit for Approval
                      </button>
                      <button onClick={() => setShowCreateEvent(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* My Submitted Events */}
              {mySubmittedEvents.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-700 mb-3">My Submitted Events</h2>
                  <div className="space-y-2">
                    {mySubmittedEvents.map((e: any) => (
                      <div key={e.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{e.title}</p>
                          <p className="text-xs text-gray-400">{new Date(e.eventDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          e.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                          e.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          e.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{e.status === 'PENDING_APPROVAL' ? 'Pending Approval' : e.status?.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Events */}
              {events.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">No events yet</h3>
                  <p className="text-gray-400 text-sm">Check back later for upcoming events</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((e: any) => {
                    const registered = e._registered;
                    return (
                      <EventPosterCard
                        key={e.id}
                        event={e}
                        registered={registered}
                        userRole="ALUMNI"
                        onRegister={async () => {
                          if (!user) return;
                          const r = await interactionApi.registerForEvent(e.id, user.email, user.name, 'ALUMNI');
                          if (r.success) {
                            showToast('Registered successfully!');
                            setEvents(prev => prev.map(ev => ev.id === e.id ? { ...ev, _registered: true } : ev));
                          } else {
                            showToast(r.message || 'Already registered', 'error');
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <AlumniChatbot />
      {posterData && <EventPoster data={posterData} onClose={() => setPosterData(null)} />}
    </div>
  );
}