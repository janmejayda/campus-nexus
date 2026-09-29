import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { GatePass } from '../types';
import { X, Download, ShieldCheck, Clock, MapPin, User, FileText } from 'lucide-react';

interface QRPassModalProps {
  pass: GatePass | null;
  onClose: () => void;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({ pass, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (pass) {
      const payload = pass.qrPayload || pass.passCode;
      QRCode.toDataURL(payload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#081820',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [pass]);

  if (!pass) return null;

  const isExpired = new Date(pass.expectedReturnTime).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0D222B] border border-[#35D6E8]/30 rounded-2xl p-6 shadow-2xl text-[#D9F7FA]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#91B8C0] hover:text-white hover:bg-[#12313B] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-[#12313B]">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#35D6E8]">
            <ShieldCheck className="w-4 h-4 text-[#35D6E8]" />
            Official Institutional Gate Pass
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Campus Nexus Security Pass</h3>
          <p className="text-xs text-[#91B8C0]">Pass Code: <span className="font-mono text-[#6EEAF5]">{pass.passCode}</span></p>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="flex flex-col items-center justify-center my-5 p-4 bg-white rounded-xl shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for pass ${pass.passCode}`}
              className="w-48 h-48 rounded"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-sm">
              Rendering QR...
            </div>
          )}
          <span className="text-[11px] text-slate-600 font-mono mt-2 font-medium">
            Scan at Security Checkpoint
          </span>
        </div>

        {/* Pass Details */}
        <div className="space-y-2.5 text-xs bg-[#12313B]/60 p-3.5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[#91B8C0] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#35D6E8]" /> Student
            </span>
            <span className="font-semibold text-white">{pass.studentName} ({pass.rollNumber})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#91B8C0] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#35D6E8]" /> Destination
            </span>
            <span className="font-semibold text-white">{pass.destination}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#91B8C0] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#35D6E8]" /> Departure
            </span>
            <span className="font-mono text-white">{new Date(pass.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#91B8C0] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#35D6E8]" /> Expected Return
            </span>
            <span className="font-mono text-white">{new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <span className="text-[#91B8C0]">Pass Status</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
              pass.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              pass.status === 'used' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {isExpired && pass.status === 'approved' ? 'EXPIRED' : pass.status}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex gap-2">
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`GatePass_${pass.passCode}.png`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#12313B] hover:bg-[#1a4452] text-[#D9F7FA] text-xs font-semibold transition-all border border-white/10 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#35D6E8]" /> Download QR Pass
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
