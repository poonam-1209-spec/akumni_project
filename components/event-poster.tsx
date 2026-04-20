'use client';

import { Share2, X } from 'lucide-react';

export const TYPE_THEMES: Record<string, { bg: string; accent: string; badge: string; style: string }> = {
  WORKSHOP:   { bg: 'from-blue-700 to-blue-900',       accent: '#60a5fa', badge: 'bg-blue-400/20 text-blue-200',     style: 'Modern Tech' },
  WEBINAR:    { bg: 'from-violet-700 to-violet-900',   accent: '#a78bfa', badge: 'bg-violet-400/20 text-violet-200', style: 'Corporate' },
  NETWORKING: { bg: 'from-emerald-700 to-emerald-900', accent: '#34d399', badge: 'bg-emerald-400/20 text-emerald-200', style: 'Professional' },
  SEMINAR:    { bg: 'from-slate-700 to-slate-900',     accent: '#94a3b8', badge: 'bg-slate-400/20 text-slate-200',   style: 'Minimal Dark' },
  REUNION:    { bg: 'from-rose-600 to-pink-900',       accent: '#fb7185', badge: 'bg-rose-400/20 text-rose-200',     style: 'Festive' },
};

export const TYPE_ICONS: Record<string, string> = {
  WORKSHOP: '🛠️', WEBINAR: '💻', NETWORKING: '🤝', SEMINAR: '🎓', REUNION: '🎉',
};

export const TAGLINES: Record<string, string> = {
  WORKSHOP:   'Hands-on learning. Real-world skills.',
  WEBINAR:    'Connect, learn & grow — from anywhere.',
  NETWORKING: 'Build connections that build careers.',
  SEMINAR:    'Knowledge shared is knowledge multiplied.',
  REUNION:    'Relive memories. Create new ones.',
};

export interface PosterData {
  title: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  description: string;
}

// ── Inline poster card shown on dashboards ──────────────────────────────────
interface EventPosterCardProps {
  event: any;
  onRegister?: () => void;
  registered?: boolean;
  userRole?: 'ALUMNI' | 'STUDENT';
}

export function EventPosterCard({ event, onRegister, registered, userRole }: EventPosterCardProps) {
  const type = event.eventType || 'SEMINAR';
  const theme = TYPE_THEMES[type] || TYPE_THEMES['SEMINAR'];
  const icon = TYPE_ICONS[type] || '📌';
  const tagline = TAGLINES[type] || "An event you don't want to miss.";

  const dateStr = event.eventDate || event.date
    ? new Date(event.eventDate || event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBD';

  const handleShare = () => {
    const text = `${icon} ${event.title}\n✨ ${tagline}\n\n📅 ${dateStr}\n📍 ${event.location || 'TBD'}\n\n${event.description || ''}\n\n👤 Organized by: ${event.createdBy || 'Admin'}\n\n🚀 Don't miss this — Register now!`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`bg-gradient-to-br ${theme.bg} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}>
      {/* Top bar */}
      <div className="h-1 w-full" style={{ background: theme.accent }} />

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>
              {icon} {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
            {event.targetAudience && event.targetAudience !== 'BOTH' && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/15 text-white/80">
                {event.targetAudience === 'STUDENT' ? '🎓 Students' : '👔 Alumni'}
              </span>
            )}
            {event.targetAudience === 'BOTH' && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/15 text-white/80">🌐 All</span>
            )}
          </div>
          <button onClick={handleShare}
            className="text-white/50 hover:text-white transition-colors"
            title="Copy to share">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-white font-extrabold text-lg leading-tight mb-1 tracking-tight">
          {event.title}
        </h3>

        {/* Tagline */}
        <p className="text-xs mb-4" style={{ color: theme.accent }}>✨ {tagline}</p>

        {/* Divider */}
        <div className="h-px w-full mb-4 opacity-20" style={{ background: theme.accent }} />

        {/* Details */}
        <div className="space-y-1.5 mb-4 text-white/80 text-xs">
          <div className="flex items-center gap-2"><span>📅</span><span>{dateStr}</span></div>
          {event.location && <div className="flex items-center gap-2"><span>📍</span><span>{event.location}</span></div>}
          {event.capacity && (
            <div className="flex items-center gap-2"><span>👥</span>
              <span>{event.registeredCount || 0}/{event.capacity} registered</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="rounded-xl px-3 py-2.5 mb-4 text-white/70 text-xs leading-relaxed line-clamp-2"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            {event.description}
          </div>
        )}

        {/* Divider */}
        <div className="h-px w-full mb-3 opacity-20" style={{ background: theme.accent }} />

        {/* Organizer + Register */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-white/40 text-xs">Organized by</p>
            <p className="text-white text-xs font-semibold">👤 {event.createdBy || 'Admin'}</p>
          </div>
          {onRegister && (
            <button
              disabled={registered}
              onClick={onRegister}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                registered
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'text-white hover:opacity-90'
              }`}
              style={!registered ? { background: theme.accent + 'cc' } : {}}>
              {registered ? '✓ Registered' : '🚀 Register Now'}
            </button>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-1 w-full" style={{ background: theme.accent }} />
    </div>
  );
}

// ── Modal poster (used after admin creates/approves) ─────────────────────────
interface EventPosterProps {
  data: PosterData;
  onClose: () => void;
}

export function EventPoster({ data, onClose }: EventPosterProps) {
  const theme = TYPE_THEMES[data.eventType] || TYPE_THEMES['SEMINAR'];
  const icon = TYPE_ICONS[data.eventType] || '📌';
  const tagline = TAGLINES[data.eventType] || "An event you don't want to miss.";

  const handleCopyText = () => {
    const text = `${icon} ${data.title}\n✨ ${tagline}\n\n📅 ${data.date}  ⏰ ${data.time}\n📍 ${data.location}\n\n${data.description}\n\n👤 Organized by: ${data.organizer}\n📌 ${data.eventType}\n\n🚀 Don't miss this — Register now!`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">Event Poster Preview</span>
          <div className="flex gap-2">
            <button onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Copy Text
            </button>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${theme.bg} rounded-2xl overflow-hidden shadow-2xl`}>
          <div className="h-1.5 w-full" style={{ background: theme.accent }} />
          <div className="p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme.badge}`}>{icon} {data.eventType}</span>
              <span className={`text-xs px-3 py-1 rounded-full ${theme.badge}`}>{theme.style}</span>
            </div>
            <h1 className="text-white text-2xl font-extrabold leading-tight mb-2 tracking-tight">{data.title}</h1>
            <p className="text-sm mb-6" style={{ color: theme.accent }}>✨ {tagline}</p>
            <div className="h-px w-full mb-5 opacity-20" style={{ background: theme.accent }} />
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-3 text-white/90 text-sm"><span>📅</span><span>{data.date}</span></div>
              <div className="flex items-center gap-3 text-white/90 text-sm"><span>⏰</span><span>{data.time}</span></div>
              <div className="flex items-center gap-3 text-white/90 text-sm"><span>📍</span><span>{data.location || 'TBD'}</span></div>
            </div>
            {data.description && (
              <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-white/80 text-xs leading-relaxed">{data.description}</p>
              </div>
            )}
            <div className="h-px w-full mb-4 opacity-20" style={{ background: theme.accent }} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs mb-0.5">Organized by</p>
                <p className="text-white font-semibold text-sm">👤 {data.organizer}</p>
              </div>
              <p className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: theme.accent + '33', color: theme.accent }}>
                🚀 Register Now
              </p>
            </div>
          </div>
          <div className="h-1.5 w-full" style={{ background: theme.accent }} />
        </div>
        <p className="text-white/40 text-xs text-center mt-3">Click "Copy Text" to share on WhatsApp, LinkedIn or Instagram</p>
      </div>
    </div>
  );
}
