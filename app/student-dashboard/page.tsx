'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { interactionApi } from '@/lib/interaction-api';
import { HelpChatbot } from '@/components/help-chatbot';
import { EventPosterCard } from '@/components/event-poster';
import {
  LogOut, User, Search, MessageCircle, Briefcase, GraduationCap,
  Users, Bell, Send, X, CheckCircle, Clock, XCircle, ChevronRight,
  BookOpen, Sparkles, TrendingUp, MapPin, Calendar, Star, Filter,
  ArrowRight, Zap, Award, Heart
} from 'lucide-react';
type Tab = 'dashboard' | 'alumni' | 'mentorship' | 'chat' | 'jobs' | 'events' | 'profile';

const BRANCH_COLORS: Record<string, string> = {
  CS: 'bg-blue-100 text-blue-700',
  IT: 'bg-purple-100 text-purple-700',
  ENTC: 'bg-orange-100 text-orange-700',
  ECE: 'bg-green-100 text-green-700',
  AIDS: 'bg-pink-100 text-pink-700',
};

const AVATARS = ['🧑‍💻','👩‍💼','👨‍🔬','👩‍🎓','🧑‍🏫','👨‍💻','👩‍💻','🧑‍🎓'];
const getAvatar = (email: string) => AVATARS[email.charCodeAt(0) % AVATARS.length];
const getBg = (email: string) => {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-indigo-500','bg-teal-500'];
  return colors[email.charCodeAt(0) % colors.length];
};

export default function StudentDashboard() {
  const { user, checking, logout } = useAuth('STUDENT');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [chatPartners, setChatPartners] = useState<string[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [mentorMsg, setMentorMsg] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [viewProfile, setViewProfile] = useState<any>(null);
  const [viewProfileLoading, setViewProfileLoading] = useState(false);

  const openProfile = async (a: any) => {
    setViewProfileLoading(true);
    setViewProfile(a); // show immediately with cached data
    try {
      const r = await interactionApi.getProfile(a.email);
      if (r.data || r.success) setViewProfile(r.data || r);
    } catch (_) {}
    setViewProfileLoading(false);
  };
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', branch: '', graduationYear: '' });
  const [sending, setSending] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`photo_${user.email}`);
      if (saved) setProfilePhoto(saved);
    }
  }, [user?.email]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    interactionApi.getAlumni().then(r => setAlumniList(r.data || []));
    interactionApi.getJobs().then(r => setJobs(r.data || []));
    interactionApi.getChatPartners(user.email).then(r => setChatPartners(r.data || []));
    interactionApi.getPublishedEvents().then(r => setEvents((r.data || []).filter((e: any) => e.targetAudience === 'STUDENT' || e.targetAudience === 'BOTH' || !e.targetAudience)));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    interactionApi.getStudentMentorships(user.email).then(r => setMentorships(r.data || []));
    if (tab === 'alumni') interactionApi.getAlumni().then(r => setAlumniList(r.data || []));
  }, [user, tab]);

  useEffect(() => {
    if (activeChat && user) {
      interactionApi.getConversation(user.email, activeChat).then(r => {
        setMessages(r.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
    }
  }, [activeChat, user]);

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

  const requestMentorship = async (alumniEmail: string) => {
    if (!user || !mentorMsg.trim()) { showToast('Please enter a message', 'error'); return; }
    const r = await interactionApi.sendMentorshipRequest(user.email, alumniEmail, mentorMsg);
    if (r.success) {
      showToast('Mentorship request sent!');
      setMentorMsg('');
      setSelectedAlumni(null);
      interactionApi.getStudentMentorships(user.email).then(r => setMentorships(r.data || []));
    } else {
      showToast(r.message || 'Failed to send request', 'error');
    }
  };

  const applyJob = async (jobId: string) => {
    if (!user) return;
    const r = await interactionApi.applyJob(jobId, user.email);
    if (r.success) showToast('Applied successfully!');
    else showToast(r.message || 'Already applied', 'error');
    interactionApi.getJobs().then(r => setJobs(r.data || []));
  };

  const filteredAlumni = alumniList.filter(a => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.branch?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'ALL' || a.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  const pendingCount = mentorships.filter(m => m.status === 'PENDING').length;

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
    { id: 'alumni' as Tab, label: 'Find Alumni', icon: Users },
    { id: 'mentorship' as Tab, label: 'Mentorship', icon: BookOpen, badge: pendingCount },
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
              <p className="text-white font-bold text-sm">Student Portal</p>
              <p className="text-slate-400 text-xs">Alumni Network</p>
            </div>
          </div>
          {/* User card */}
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

      {/* Main content */}
      <div className="flex-1 ml-60">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-2xl text-sm font-medium transition-all ${
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
              {/* Hero */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-7 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative">
                  <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
                  <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-blue-200 text-sm">Connect with alumni, find mentors, and explore opportunities</p>
                  <button onClick={() => setTab('alumni')}
                    className="mt-4 flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                    Find a Mentor <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Alumni Network', value: alumniList.length, icon: Users, color: 'from-blue-500 to-blue-700', sub: 'professionals' },
                  { label: 'My Mentorships', value: mentorships.length, icon: BookOpen, color: 'from-blue-400 to-cyan-500', sub: 'requests sent' },
                  { label: 'Open Jobs', value: jobs.length, icon: Briefcase, color: 'from-slate-500 to-slate-700', sub: 'opportunities' },
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

              <div className="grid grid-cols-2 gap-5">
                {/* Recent mentorships */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Mentorship Requests</h2>
                    <button onClick={() => setTab('mentorship')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {mentorships.length === 0 ? (
                    <div className="text-center py-6">
                      <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No requests yet</p>
                      <button onClick={() => setTab('alumni')} className="mt-2 text-xs text-blue-600 hover:underline">Find alumni →</button>
                    </div>
                  ) : mentorships.slice(0, 3).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className={`w-9 h-9 ${getBg(m.alumniEmail)} rounded-xl flex items-center justify-center text-sm`}>
                        {getAvatar(m.alumniEmail)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{m.alumniName}</p>
                        <p className="text-xs text-gray-400 truncate">{m.message?.slice(0, 40)}...</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        m.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        m.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{m.status}</span>
                    </div>
                  ))}
                </div>

                {/* Latest jobs */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Latest Jobs</h2>
                    <button onClick={() => setTab('jobs')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="text-center py-6">
                      <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No jobs posted yet</p>
                    </div>
                  ) : jobs.slice(0, 3).map((j: any) => (
                    <div key={j.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{j.title}</p>
                        <p className="text-xs text-gray-400">{j.company} · {j.location}</p>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{j.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── FIND ALUMNI ── */}
          {tab === 'alumni' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Alumni</h1>
                <p className="text-gray-500 text-sm mt-1">Connect with {alumniList.length} alumni professionals</p>
              </div>

              {/* Search + Filter */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, branch, email..."
                    className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                </div>
                <div className="flex gap-2">
                  {['ALL','CS','IT','ENTC','ECE','AIDS'].map(b => (
                    <button key={b} onClick={() => setBranchFilter(b)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        branchFilter === b ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}>{b}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlumni.length === 0 ? (
                  <div className="col-span-3 text-center py-16">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">No alumni found matching your search</p>
                  </div>
                ) : filteredAlumni.map((a: any) => (
                  <div key={a.email} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 ${getBg(a.email)} rounded-2xl flex items-center justify-center text-xl shrink-0 overflow-hidden`}>
                        {localStorage.getItem(`photo_${a.email}`)
                          ? <img src={localStorage.getItem(`photo_${a.email}`)!} alt={a.name} className="w-full h-full object-cover" />
                          : getAvatar(a.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{a.name}</p>
                        <p className="text-xs text-gray-500 truncate">{a.email}</p>
                        {(a.currentPosition || a.company) && (
                          <p className="text-xs text-blue-600 truncate mt-0.5">
                            {a.currentPosition}{a.currentPosition && a.company ? ' @ ' : ''}{a.company}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BRANCH_COLORS[a.branch] || 'bg-gray-100 text-gray-600'}`}>
                            {a.branch}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {a.graduationYear}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => setSelectedAlumni(a)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Request Mentorship
                      </button>
                      <button onClick={() => { setActiveChat(a.email); setTab('chat'); }}
                        className="w-10 h-10 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-colors">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <button onClick={() => openProfile(a)}
                      className="w-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-xs font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> View Profile
                    </button>
                  </div>
                ))}
              </div>

              {/* Alumni Profile Modal */}
              {viewProfile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">Alumni Profile</h3>
                      <button onClick={() => setViewProfile(null)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-16 h-16 ${getBg(viewProfile.email)} rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden`}>
                        {localStorage.getItem(`photo_${viewProfile.email}`)
                          ? <img src={localStorage.getItem(`photo_${viewProfile.email}`)!} alt={viewProfile.name} className="w-full h-full object-cover" />
                          : getAvatar(viewProfile.email)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{viewProfile.name}</p>
                        <p className="text-xs text-gray-500">{viewProfile.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${BRANCH_COLORS[viewProfile.branch] || 'bg-gray-100 text-gray-600'}`}>
                          {viewProfile.branch} · Class of {viewProfile.graduationYear}
                        </span>
                        {viewProfileLoading && <p className="text-xs text-blue-400 mt-1">Refreshing...</p>}
                      </div>
                    </div>
                    <div className="space-y-3 bg-gray-50 rounded-xl p-4 mb-4">
                      {viewProfile.currentPosition && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-gray-700 font-medium">{viewProfile.currentPosition}</span>
                        </div>
                      )}
                      {viewProfile.company && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-gray-700">{viewProfile.company}</span>
                        </div>
                      )}
                      {viewProfile.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-gray-700">{viewProfile.location}</span>
                        </div>
                      )}
                      {viewProfile.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-gray-700">{viewProfile.phone}</span>
                        </div>
                      )}
                      {!viewProfile.currentPosition && !viewProfile.company && !viewProfile.location && (
                        <p className="text-xs text-gray-400 text-center">No additional details available</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {viewProfile.linkedinUrl && (
                        <a href={viewProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl text-center transition-colors">
                          View LinkedIn
                        </a>
                      )}
                      <button onClick={() => { setSelectedAlumni(viewProfile); setViewProfile(null); }}
                        className="flex-1 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2.5 rounded-xl transition-colors">
                        Request Mentorship
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Mentorship request modal */}
              {selectedAlumni && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">Request Mentorship</h3>
                      <button onClick={() => setSelectedAlumni(null)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 mb-4">
                      <div className={`w-11 h-11 ${getBg(selectedAlumni.email)} rounded-xl flex items-center justify-center text-xl`}>
                        {getAvatar(selectedAlumni.email)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedAlumni.name}</p>
                        <p className="text-xs text-gray-500">{selectedAlumni.branch} · Class of {selectedAlumni.graduationYear}</p>
                      </div>
                    </div>
                    <textarea value={mentorMsg} onChange={e => setMentorMsg(e.target.value)}
                      placeholder="Introduce yourself and explain what guidance you're looking for..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4" />
                    <button onClick={() => requestMentorship(selectedAlumni.email)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-all shadow-lg">
                      Send Request ✨
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MENTORSHIP ── */}
          {tab === 'mentorship' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Mentorships</h1>
                  <p className="text-gray-500 text-sm mt-1">{mentorships.length} total requests</p>
                </div>
                <button onClick={() => setTab('alumni')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  <Users className="w-4 h-4" /> Find Alumni
                </button>
              </div>

              {mentorships.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">No mentorship requests yet</h3>
                  <p className="text-gray-400 text-sm mb-5">Connect with alumni to get guidance on your career</p>
                  <button onClick={() => setTab('alumni')}
                    className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                    Browse Alumni
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mentorships.map((m: any) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${getBg(m.alumniEmail)} rounded-2xl flex items-center justify-center text-xl shrink-0`}>
                          {getAvatar(m.alumniEmail)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{m.alumniName}</p>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              m.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                              m.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {m.status === 'ACCEPTED' ? '✓ Accepted' : m.status === 'REJECTED' ? '✗ Rejected' : '⏳ Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{m.alumniEmail}</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{m.message}</p>
                          {m.scheduledAt && (
                            <div className="flex items-center gap-2 mt-3 bg-blue-50 rounded-xl px-3 py-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <p className="text-xs text-blue-700 font-medium">
                                Session: {new Date(m.scheduledAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                        {m.status === 'ACCEPTED' && (
                          <button onClick={() => { setActiveChat(m.alumniEmail); setTab('chat'); }}
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

          {/* ── CHAT ── */}
          {tab === 'chat' && (
            <div className="h-[calc(100vh-7rem)] flex gap-4">
              {/* Partners */}
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
                      <button onClick={() => setTab('alumni')} className="mt-2 text-xs text-blue-600 hover:underline">Find alumni →</button>
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

              {/* Chat window */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                {!activeChat ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-10 h-10 text-blue-300" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">Start a conversation</h3>
                      <p className="text-sm text-gray-400">Select a chat or find an alumni to message</p>
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
                          <div className={`max-w-xs lg:max-w-sm ${m.senderEmail === user?.email ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                              m.senderEmail === user?.email
                                ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}>
                              {m.content}
                            </div>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
                <p className="text-gray-500 text-sm mt-1">{jobs.length} positions available</p>
              </div>
              {jobs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-400 text-sm">Check back later for new opportunities</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((j: any) => {
                    const applied = j.applicants?.includes(user?.email);
                    return (
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
                          }`}>{j.type || 'Full-time'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location || 'Remote'}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{j.alumniName}</span>
                        </div>
                        {j.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{j.description}</p>}
                        {j.skills && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {j.skills.split(',').map((s: string) => (
                              <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{s.trim()}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{j.applicants?.length || 0} applicant(s)</p>
                          <button onClick={() => applyJob(j.id)} disabled={applied}
                            className={`text-sm font-semibold px-5 py-2 rounded-xl transition-all ${
                              applied
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            }`}>
                            {applied ? '✓ Applied' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── EVENTS ── */}
          {tab === 'events' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
                <p className="text-gray-500 text-sm mt-1">{events.length} event(s) available</p>
              </div>
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
                        userRole="STUDENT"
                        onRegister={async () => {
                          if (!user) return;
                          const r = await interactionApi.registerForEvent(e.id, user.email, user.name, 'STUDENT');
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

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <button onClick={() => {
                  setProfileForm({ name: user?.name || '', phone: user?.phone || '', branch: user?.branch || '', graduationYear: user?.graduationYear?.toString() || '' });
                  setEditProfile(true);
                }}                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Edit Profile
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-5 mb-6">
                  <div className={`w-20 h-20 ${getBg(user?.email || '')} rounded-2xl flex items-center justify-center text-4xl shadow-lg overflow-hidden`}>
                    {profilePhoto
                      ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                      : getAvatar(user?.email || '')}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="mt-1.5 inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Student</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Role', value: 'Student' },
                    { label: 'Mentorships', value: `${mentorships.length} requests` },
                    { label: 'Jobs Applied', value: `${jobs.filter((j: any) => j.applicants?.includes(user?.email)).length}` },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{f.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Profile Modal */}
              {editProfile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3>
                      <button onClick={() => setEditProfile(false)}
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
                        { key: 'graduationYear', label: 'Graduation Year', placeholder: 'e.g. 2025' },
                        { key: 'branch', label: 'Degree & Branch', placeholder: 'e.g. CS, IT, ENTC' },
                        { key: 'currentPosition', label: 'Current Job Role', placeholder: 'e.g. Software Engineer' },
                        { key: 'company', label: 'Company / Organization', placeholder: 'e.g. Google' },
                        { key: 'workExperience', label: 'Work Experience (years)', placeholder: 'e.g. 2' },
                        { key: 'location', label: 'Location', placeholder: 'e.g. Pune, India' },
                        { key: 'linkedinUrl', label: 'LinkedIn / Professional Profile', placeholder: 'https://linkedin.com/in/...' },
                        { key: 'skills', label: 'Skills & Expertise', placeholder: 'e.g. React, Java, Python' },
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
                          if (r.success || r.id) { showToast('Profile updated!'); setEditProfile(false); }
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
        </div>
      </div>
      <HelpChatbot role="STUDENT" />
    </div>
  );
}
