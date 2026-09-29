import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Hostel, HostelRoom, HostelResident, StudentBranch, detectBranch } from '../types';
import {
  Building2,
  Users,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
  Filter,
  GraduationCap
} from 'lucide-react';

interface HostelManagementViewProps {
  userRole: 'admin' | 'warden';
  userName?: string;
}

export const HostelManagementView: React.FC<HostelManagementViewProps> = ({ userRole, userName }) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [residents, setResidents] = useState<HostelResident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Active view mode: 'rooms' | 'allocate' | 'directory'
  const [activeSection, setActiveSection] = useState<'rooms' | 'allocate' | 'directory'>('rooms');

  // Allocation Form State
  const [selectedHostelId, setSelectedHostelId] = useState<string>('hostel_b1');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('A-203');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Search & Filter for Directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allocationFilter, setAllocationFilter] = useState<'all' | 'allocated' | 'unallocated'>('all');
  const [branchFilter, setBranchFilter] = useState<'all' | StudentBranch>('all');

  // Selected Hostel for Room Grid view
  const [activeHostelId, setActiveHostelId] = useState<string>('hostel_b1');

  const loadHostelData = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [hRes, rRes] = await Promise.all([
        apiRequest<{ hostels: Hostel[] }>('/api/hostels'),
        apiRequest<{ residents: HostelResident[] }>('/api/hostels/residents')
      ]);

      setHostels(hRes.hostels || []);
      setResidents(rRes.residents || []);

      if (hRes.hostels && hRes.hostels.length > 0) {
        // Set defaults if not set
        if (!selectedHostelId) setSelectedHostelId(hRes.hostels[0].id);
        if (!activeHostelId) setActiveHostelId(hRes.hostels[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load hostel records:', err);
      setErrorNotice(err.message || 'Failed to load hostel data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHostelData();
  }, []);

  const triggerFeedback = (msg: string) => {
    setActionNotice(msg);
    setErrorNotice(null);
    setTimeout(() => setActionNotice(null), 3500);
    loadHostelData();
  };

  // Perform room allocation
  const handleAllocate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedHostelId || !selectedRoomNumber || !selectedStudentId) {
      setErrorNotice('Please select hostel, room number, and student.');
      return;
    }

    try {
      const res = await apiRequest('/api/hostels/allocate', {
        method: 'POST',
        body: JSON.stringify({
          hostelId: selectedHostelId,
          roomNumber: selectedRoomNumber,
          studentId: selectedStudentId
        })
      });

      triggerFeedback(res.message || 'Room allocated successfully!');
      setSelectedStudentId('');
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to allocate room.');
    }
  };

  // Perform bed deallocation / vacate
  const handleDeallocate = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to vacate the hostel bed for ${studentName}?`)) return;

    try {
      const res = await apiRequest('/api/hostels/deallocate', {
        method: 'POST',
        body: JSON.stringify({ studentId })
      });
      triggerFeedback(res.message || 'Bed vacated successfully.');
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to vacate bed.');
    }
  };

  // Quick action from room card or resident table: select student and room, then open allocate form
  const handleQuickAssignToRoom = (hostelId: string, roomNumber: string) => {
    setSelectedHostelId(hostelId);
    setSelectedRoomNumber(roomNumber);
    setActiveSection('allocate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAssignStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveSection('allocate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active hostel rooms
  const currentHostel = hostels.find(h => h.id === activeHostelId) || hostels[0];
  const targetHostel = hostels.find(h => h.id === selectedHostelId) || hostels[0];
  const availableRoomsInTarget = targetHostel?.rooms || [];

  // Filtered residents list
  const filteredResidents = residents.filter(r => {
    const studentBranch = detectBranch(r.course, r.department, r.rollNumber);
    if (branchFilter !== 'all' && studentBranch !== branchFilter) return false;

    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.roomNumber && r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.course && r.course.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (allocationFilter === 'allocated') return r.isAllocated;
    if (allocationFilter === 'unallocated') return !r.isAllocated;
    return true;
  });

  const totalCapacity = hostels.reduce((acc, h) => acc + h.rooms.reduce((rAcc, r) => rAcc + r.capacity, 0), 0);
  const totalOccupied = hostels.reduce((acc, h) => acc + h.rooms.reduce((rAcc, r) => rAcc + r.occupied, 0), 0);
  const totalVacant = Math.max(0, totalCapacity - totalOccupied);
  const occupancyPercentage = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Feedback Alerts */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 font-semibold flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {errorNotice}
          </span>
          <button onClick={() => setErrorNotice(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Occupancy KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
          <div className="text-[11px] text-[#91B8C0]">Total Bed Capacity</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">{totalCapacity} Beds</div>
          <div className="text-[10px] text-[#35D6E8] mt-0.5">{hostels.length} Residence Halls</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
          <div className="text-[11px] text-[#91B8C0]">Occupied Beds</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">{totalOccupied} Beds</div>
          <div className="text-[10px] text-[#6EEAF5] mt-0.5">{occupancyPercentage}% Occupancy</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
          <div className="text-[11px] text-[#91B8C0]">Available / Vacant Beds</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">{totalVacant} Beds</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Ready for Allocation</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
          <div className="text-[11px] text-[#91B8C0]">Students Needing Room</div>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1 tabular-nums">
            {residents.filter(r => !r.isAllocated).length}
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5">Unallocated Students</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#12313B]">
        <div className="flex items-center gap-1.5 p-1 bg-[#0D222B] border border-[#12313B] rounded-xl text-xs">
          <button
            onClick={() => setActiveSection('rooms')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSection === 'rooms'
                ? 'bg-[#12313B] text-[#35D6E8] shadow-sm'
                : 'text-[#91B8C0] hover:text-white'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Room Roster & Occupants</span>
          </button>

          <button
            onClick={() => setActiveSection('allocate')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSection === 'allocate'
                ? 'bg-[#12313B] text-[#35D6E8] shadow-sm'
                : 'text-[#91B8C0] hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign Student to Bed</span>
          </button>

          <button
            onClick={() => setActiveSection('directory')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSection === 'directory'
                ? 'bg-[#12313B] text-[#35D6E8] shadow-sm'
                : 'text-[#91B8C0] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Resident Directory ({residents.length})</span>
          </button>
        </div>

        <button
          onClick={loadHostelData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] hover:bg-[#1a4452] text-xs font-semibold text-[#D9F7FA] border border-white/5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#35D6E8] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Beds</span>
        </button>
      </div>

      {/* SECTION 1: ROOM ROSTER & OCCUPANTS VIEW */}
      {activeSection === 'rooms' && (
        <div className="space-y-5">
          {/* Hostel Hall Selector */}
          <div className="flex gap-2">
            {hostels.map(h => {
              const isSelected = h.id === activeHostelId;
              const hOccupied = h.rooms.reduce((sum, r) => sum + r.occupied, 0);
              const hCapacity = h.rooms.reduce((sum, r) => sum + r.capacity, 0);

              return (
                <button
                  key={h.id}
                  onClick={() => setActiveHostelId(h.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#12313B] border-[#35D6E8] text-white shadow-md'
                      : 'bg-[#0D222B] border-[#12313B] text-[#91B8C0] hover:text-white hover:border-white/10'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${isSelected ? 'text-[#35D6E8]' : 'text-[#66848C]'}`} />
                  <span>{h.name}</span>
                  <span className="font-mono text-[11px] text-[#6EEAF5] bg-[#081820] px-2 py-0.5 rounded">
                    {hOccupied}/{hCapacity} Beds
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentHostel?.rooms.map(room => {
              const isFull = room.occupied >= room.capacity;
              const isVacant = room.occupied === 0;

              return (
                <div
                  key={room.roomNumber}
                  className={`bg-[#0D222B] border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    isFull
                      ? 'border-[#12313B] opacity-90'
                      : 'border-[#35D6E8]/30 shadow-md hover:border-[#35D6E8]/60'
                  }`}
                >
                  <div>
                    {/* Room Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#12313B] mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#12313B] flex items-center justify-center font-mono font-bold text-white text-xs border border-white/5">
                          {room.roomNumber}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Floor {room.floor}</div>
                          <div className="text-[10px] text-[#91B8C0]">Capacity: {room.capacity} Beds</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                          isFull
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isVacant
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isFull ? 'FULL' : isVacant ? 'VACANT' : `${room.capacity - room.occupied} BED OPEN`}
                      </span>
                    </div>

                    {/* Occupants List with Student Names */}
                    <div className="space-y-2">
                      <div className="text-[11px] text-[#91B8C0] font-semibold flex items-center justify-between">
                        <span>Current Occupants:</span>
                        <span className="font-mono text-white">
                          {room.occupied}/{room.capacity}
                        </span>
                      </div>

                      {(!room.occupants || room.occupants.length === 0) ? (
                        <div className="p-3 bg-[#081820]/60 rounded-xl text-center text-xs text-[#66848C]">
                          No students allocated to this room.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {room.occupants.map(student => {
                            const studentBranch = detectBranch(undefined, student.department, student.rollNumber);
                            return (
                              <div
                                key={student.id}
                                className="p-2.5 bg-[#12313B]/70 rounded-xl border border-white/5 flex items-center justify-between gap-2"
                              >
                                <div className="truncate">
                                  <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                      studentBranch === 'MBA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                      studentBranch === 'MCA' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                      'bg-[#35D6E8]/20 text-[#6EEAF5] border border-[#35D6E8]/30'
                                    }`}>
                                      {studentBranch}
                                    </span>
                                    <span>{student.name}</span>
                                  </div>
                                  <div className="text-[10px] text-[#91B8C0] font-mono truncate mt-0.5">
                                    {student.rollNumber} · {student.department}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeallocate(student.id, student.name)}
                                  className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-semibold transition-colors shrink-0"
                                  title="Vacate student from bed"
                                >
                                  Vacate
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  {!isFull && (
                    <div className="mt-4 pt-3 border-t border-[#12313B]">
                      <button
                        onClick={() => handleQuickAssignToRoom(currentHostel.id, room.roomNumber)}
                        className="w-full py-2 px-3 rounded-xl bg-[#35D6E8]/10 hover:bg-[#35D6E8] text-[#35D6E8] hover:text-[#081820] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#35D6E8]/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Student to Vacant Bed</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ASSIGN STUDENT TO BED (Interactive Allocation Form) */}
      {activeSection === 'allocate' && (
        <div className="max-w-2xl mx-auto bg-[#0D222B] border border-[#35D6E8]/30 rounded-2xl p-6 shadow-xl text-xs space-y-5">
          <div className="pb-3 border-b border-[#12313B]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#35D6E8]" />
              <h3 className="text-base font-bold text-white">Student Room Allocation Console</h3>
            </div>
            <p className="text-[#91B8C0] text-[11px] mt-0.5">
              Assign or re-allocate enrolled students to hostel rooms with automated capacity checking.
            </p>
          </div>

          <form onSubmit={handleAllocate} className="space-y-4">
            {/* Step 1: Select Hostel */}
            <div>
              <label className="block text-[11px] text-[#91B8C0] font-semibold mb-1">
                1. Select Residence Hall
              </label>
              <select
                value={selectedHostelId}
                onChange={e => {
                  setSelectedHostelId(e.target.value);
                  const h = hostels.find(x => x.id === e.target.value);
                  if (h && h.rooms.length > 0) {
                    setSelectedRoomNumber(h.rooms[0].roomNumber);
                  }
                }}
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
              >
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Room */}
            <div>
              <label className="block text-[11px] text-[#91B8C0] font-semibold mb-1">
                2. Select Room (Showing Live Vacancy)
              </label>
              <select
                value={selectedRoomNumber}
                onChange={e => setSelectedRoomNumber(e.target.value)}
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D6E8] font-mono"
              >
                {availableRoomsInTarget.map(r => {
                  const isFull = r.occupied >= r.capacity;
                  const vacancies = r.capacity - r.occupied;
                  return (
                    <option key={r.roomNumber} value={r.roomNumber} disabled={isFull}>
                      Room {r.roomNumber} (Floor {r.floor}) — {isFull ? 'FULL (0 Vacant)' : `${vacancies} of ${r.capacity} Beds Open`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step 3: Select Student */}
            <div>
              <label className="block text-[11px] text-[#91B8C0] font-semibold mb-1">
                3. Select Enrolled Student (All Branches: B.Tech, MBA, MCA)
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                required
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
              >
                <option value="">-- Choose a student to allocate --</option>
                {residents.map(s => {
                  const sBranch = detectBranch(s.course, s.department, s.rollNumber);
                  return (
                    <option key={s.id} value={s.id}>
                      [{sBranch}] {s.name} ({s.rollNumber}) · {s.department} — {s.isAllocated ? `[Allocated: ${s.roomNumber || 'Assigned'}]` : '★ [NOT ALLOCATED - NEEDS BED]'}
                    </option>
                  );
                })}
              </select>
              <p className="text-[10px] text-[#91B8C0] mt-1">
                Tip: If the student already has a room, assigning them to this room will automatically vacate their previous bed.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedStudentId}
                className="w-full py-3 px-4 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] font-bold text-xs transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Bed Allocation</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 3: RESIDENT DIRECTORY (Table of all students & their rooms) */}
      {activeSection === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#66848C] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student name, roll number, department, or room number..."
                className="w-full bg-[#0D222B] border border-[#12313B] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Branch Filter */}
              <div className="flex items-center gap-1 p-1 bg-[#0D222B] border border-[#12313B] rounded-xl text-xs">
                {(['all', 'B.Tech', 'MBA', 'MCA'] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setBranchFilter(b)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      branchFilter === b
                        ? 'bg-[#35D6E8] text-[#081820] font-bold shadow-sm'
                        : 'text-[#91B8C0] hover:text-white'
                    }`}
                  >
                    {b === 'all' ? 'All Branches' : b}
                  </button>
                ))}
              </div>

              {/* Allocation Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-[#0D222B] border border-[#12313B] rounded-xl text-xs shrink-0">
                <button
                  onClick={() => setAllocationFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    allocationFilter === 'all' ? 'bg-[#12313B] text-white shadow-sm' : 'text-[#91B8C0] hover:text-white'
                  }`}
                >
                  All ({residents.length})
                </button>
                <button
                  onClick={() => setAllocationFilter('allocated')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    allocationFilter === 'allocated' ? 'bg-[#12313B] text-emerald-400 shadow-sm' : 'text-[#91B8C0] hover:text-white'
                  }`}
                >
                  Allocated ({residents.filter(r => r.isAllocated).length})
                </button>
                <button
                  onClick={() => setAllocationFilter('unallocated')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    allocationFilter === 'unallocated' ? 'bg-[#12313B] text-amber-400 shadow-sm' : 'text-[#91B8C0] hover:text-white'
                  }`}
                >
                  Unallocated ({residents.filter(r => !r.isAllocated).length})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#081820] text-[#91B8C0] border-b border-[#12313B]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Name & Roll No</th>
                    <th className="py-3 px-4 font-semibold">Department & Degree</th>
                    <th className="py-3 px-4 font-semibold">Allocated Hostel</th>
                    <th className="py-3 px-4 font-semibold">Room Number</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Room Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#12313B] text-[#D9F7FA]">
                  {filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#66848C]">
                        No student residents match the current search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map(res => {
                      const resBranch = detectBranch(res.course, res.department, res.rollNumber);
                      return (
                        <tr key={res.id} className="hover:bg-[#12313B]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                resBranch === 'MBA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                resBranch === 'MCA' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                'bg-[#35D6E8]/20 text-[#6EEAF5] border border-[#35D6E8]/30'
                              }`}>
                                {resBranch}
                              </span>
                              <span>{res.name}</span>
                            </div>
                            <div className="font-mono text-[11px] text-[#6EEAF5] mt-0.5">{res.rollNumber}</div>
                          </td>
                        <td className="py-3 px-4 text-[#91B8C0]">
                          <div>{res.department}</div>
                          <div className="text-[10px]">{res.course} (Yr {res.year})</div>
                        </td>
                        <td className="py-3 px-4">
                          {res.hostelName ? (
                            <span className="text-white font-medium">{res.hostelName}</span>
                          ) : (
                            <span className="text-[#66848C]">Not Assigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm">
                          {res.roomNumber ? (
                            <span className="text-[#35D6E8]">{res.roomNumber}</span>
                          ) : (
                            <span className="text-[#66848C] font-normal text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              res.isAllocated
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {res.isAllocated ? 'Allocated' : 'Unallocated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {res.isAllocated ? (
                            <>
                              <button
                                onClick={() => handleQuickAssignStudent(res.id)}
                                className="px-2.5 py-1 rounded bg-[#12313B] hover:bg-[#1a4452] text-[#35D6E8] text-xs font-semibold border border-white/5 transition-colors"
                              >
                                Change Room
                              </button>
                              <button
                                onClick={() => handleDeallocate(res.id, res.name)}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                              >
                                Vacate
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleQuickAssignStudent(res.id)}
                              className="px-3 py-1 rounded bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-colors shadow-sm"
                            >
                              Assign Room
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
