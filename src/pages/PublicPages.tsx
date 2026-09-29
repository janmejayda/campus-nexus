import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Notice, TimetableEntry, MessMenuDay } from '../types';
import { Megaphone, CalendarDays, UtensilsCrossed, ArrowLeft } from 'lucide-react';

interface PublicPagesProps {
  page: 'notices' | 'timetable' | 'dining';
  onBack: () => void;
}

export const PublicPages: React.FC<PublicPagesProps> = ({ page, onBack }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [menu, setMenu] = useState<MessMenuDay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    if (page === 'notices') {
      apiRequest<{ notices: Notice[] }>('/api/notices')
        .then(r => setNotices(r.notices || []))
        .finally(() => setIsLoading(false));
    } else if (page === 'timetable') {
      apiRequest<{ timetable: TimetableEntry[] }>('/api/timetable')
        .then(r => setTimetable(r.timetable || []))
        .finally(() => setIsLoading(false));
    } else if (page === 'dining') {
      apiRequest<{ menu: MessMenuDay[] }>('/api/mess/menu')
        .then(r => setMenu(r.menu || []))
        .finally(() => setIsLoading(false));
    }
  }, [page]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#91B8C0] hover:text-[#35D6E8] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {page === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#12313B]">
            <Megaphone className="w-5 h-5 text-[#35D6E8]" />
            <h1 className="text-xl font-bold text-white">Campus Institutional Bulletins & Notices</h1>
          </div>

          <div className="divide-y divide-[#12313B] bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden text-xs">
            {notices.map(n => (
              <div key={n.id} className="p-5 hover:bg-[#12313B]/30 space-y-1.5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-sm">{n.title}</h3>
                  <span className="text-[10px] font-mono text-[#35D6E8] uppercase bg-[#12313B] px-2 py-0.5 rounded">
                    {n.category}
                  </span>
                </div>
                <p className="text-[#D9F7FA] leading-relaxed">{n.content}</p>
                <div className="text-[11px] text-[#91B8C0] pt-1">
                  Published by {n.publishedByName} ({n.publishedRole.toUpperCase()}) · {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'timetable' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#12313B]">
            <CalendarDays className="w-5 h-5 text-[#35D6E8]" />
            <h1 className="text-xl font-bold text-white">Institutional Class Timetables</h1>
          </div>

          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden divide-y divide-[#12313B] text-xs">
            {timetable.map(t => (
              <div key={t.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-sm">{t.subjectName} ({t.subjectCode})</div>
                  <div className="text-[11px] text-[#91B8C0]">
                    {t.dayOfWeek} · Room {t.roomNumber} · Faculty: {t.facultyName}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-[#6EEAF5] bg-[#12313B] px-2.5 py-1 rounded-lg">
                  {t.timeSlot}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'dining' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#12313B]">
            <UtensilsCrossed className="w-5 h-5 text-[#35D6E8]" />
            <h1 className="text-xl font-bold text-white">Campus 7-Day Weekly Dining Schedule</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu.map(day => (
              <div key={day.dayOfWeek} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-3">
                <div className="font-bold text-white text-sm pb-2 border-b border-[#12313B] flex justify-between">
                  <span>{day.dayOfWeek}</span>
                  {day.specialItem && <span className="text-[10px] text-[#35D6E8] font-mono">Special: {day.specialItem}</span>}
                </div>
                <div>
                  <span className="font-semibold text-[#35D6E8]">Breakfast:</span>
                  <div className="text-[#D9F7FA] mt-0.5">{day.breakfast.join(', ')}</div>
                </div>
                <div>
                  <span className="font-semibold text-[#35D6E8]">Lunch:</span>
                  <div className="text-[#D9F7FA] mt-0.5">{day.lunch.join(', ')}</div>
                </div>
                <div>
                  <span className="font-semibold text-[#35D6E8]">Dinner:</span>
                  <div className="text-[#D9F7FA] mt-0.5">{day.dinner.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
