import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { GateActivity, GatePass } from '../../types';
import { QRScannerModal } from '../../components/QRScannerModal';
import {
  Shield,
  QrCode,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Camera,
  RefreshCw,
  Search,
  ArrowRight
} from 'lucide-react';

interface SecurityDashboardProps {
  currentTab: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ currentTab }) => {
  const { user } = useAuth();
  const [activity, setActivity] = useState<GateActivity[]>([]);
  const [approvedPasses, setApprovedPasses] = useState<GatePass[]>([]);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [incidentReport, setIncidentReport] = useState<string>('');
  const [incidentStudentId, setIncidentStudentId] = useState<string>('');
  const [incidentSuccess, setIncidentSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [actRes, passesRes] = await Promise.all([
        apiRequest<{ activity: GateActivity[] }>('/api/gatepasses/activity'),
        apiRequest<{ gatePasses: GatePass[] }>('/api/gatepasses')
      ]);
      setActivity(actRes.activity || []);
      setApprovedPasses((passesRes.gatePasses || []).filter(g => g.status === 'approved'));
    } catch (err) {
      console.error('Failed to load security data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentReport) return;

    try {
      await apiRequest('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          category: 'security',
          subject: `Security Incident: Pass Violation / Alert`,
          description: `Flagged by ${user?.name} at Checkpoint: ${incidentReport} (Ref: ${incidentStudentId || 'Unidentified'})`,
          priority: 'urgent'
        })
      });
      setIncidentSuccess('Security incident logged and transmitted to Registrar & Warden.');
      setIncidentReport('');
      setIncidentStudentId('');
      setTimeout(() => setIncidentSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12313B]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campus Security Command & Gate Terminal</h1>
          <p className="text-xs text-[#91B8C0] mt-0.5">
            Officer {user?.name} · {user?.department || 'Vigilance Cell'} · Checkpoint: Main Gate 1
          </p>
        </div>

        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Launch QR Gate Scanner</span>
        </button>
      </div>

      {/* Main Gate Control Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
          <div className="text-xs text-[#91B8C0]">Approved Movement Passes</div>
          <div className="text-3xl font-bold text-white font-mono mt-1">{approvedPasses.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Authorized for Departure</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
          <div className="text-xs text-[#91B8C0]">Total Recorded Movements Today</div>
          <div className="text-3xl font-bold text-white font-mono mt-1">{activity.length}</div>
          <div className="text-[11px] text-[#35D6E8] mt-1">Ingress & Egress Combined</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
          <div className="text-xs text-[#91B8C0]">Evening Curfew Warning</div>
          <div className="text-3xl font-bold text-amber-300 font-mono mt-1">21:30</div>
          <div className="text-[11px] text-amber-400 mt-1">Strict Entry Check Required</div>
        </div>
      </div>

      {/* Scanner Prompt Box */}
      <div className="bg-[#0D222B] border border-[#35D6E8]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#35D6E8]/10 flex items-center justify-center text-[#35D6E8] border border-[#35D6E8]/30 shrink-0">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Student QR Verification Console</h3>
            <p className="text-xs text-[#91B8C0] mt-0.5">
              Direct verification against central student database. Instantly detects expired, forged, or unapproved passes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowScanner(true)}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" /> Open Verification Camera / Manual Entry
        </button>
      </div>

      {/* Activity Log */}
      <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#12313B] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Verified Perimeter Activity Stream
          </h3>
          <span className="text-[11px] text-[#91B8C0] font-mono">Live Sync</span>
        </div>

        <div className="divide-y divide-[#12313B]">
          {activity.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#66848C]">
              No gate crossings recorded yet. Use the QR Scanner to log entry and exit.
            </div>
          ) : (
            activity.map(act => (
              <div key={act.id} className="p-4 hover:bg-[#12313B]/30 flex items-center justify-between text-xs transition-colors">
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{act.studentName}</span>
                    <span className="font-mono text-[11px] text-[#35D6E8]">({act.rollNumber})</span>
                    <span className="text-[#91B8C0]">· Pass: <span className="font-mono text-white">{act.passCode}</span></span>
                  </div>
                  <div className="text-[11px] text-[#91B8C0] mt-0.5">
                    Checkpoint: {act.gateNumber} · Staff: {act.securityStaffName}
                    {act.remarks && ` · Remarks: ${act.remarks}`}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase font-mono ${
                    act.action === 'entry' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {act.action}
                  </span>
                  <div className="text-[10px] text-[#66848C] font-mono mt-1">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Incident Reporting Section */}
      <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-[#12313B]">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-white text-sm">Security Incident Report Desk</h3>
        </div>

        {incidentSuccess && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {incidentSuccess}
          </div>
        )}

        <form onSubmit={handleReportIncident} className="space-y-3">
          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Student Roll Number or Identifier (If known)</label>
            <input
              type="text"
              value={incidentStudentId}
              onChange={e => setIncidentStudentId(e.target.value)}
              placeholder="e.g. CSE-2023-042 or Unknown"
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Incident Report Details</label>
            <textarea
              required
              rows={3}
              value={incidentReport}
              onChange={e => setIncidentReport(e.target.value)}
              placeholder="Describe unapproved exit attempt, curfew violation, or security breach..."
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors"
          >
            Transmit Incident Report
          </button>
        </form>
      </div>

      {/* Modal */}
      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onActionComplete={loadData}
        />
      )}
    </div>
  );
};
