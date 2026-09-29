import React, { useState, useRef, useEffect } from 'react';
import { GatePass } from '../types';
import { apiRequest } from '../services/api';
import { X, Camera, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Shield } from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
  onActionComplete: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onActionComplete }) => {
  const [manualCode, setManualCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    reason?: string;
    message?: string;
    gatePass?: GatePass;
  } | null>(null);
  const [gateNumber, setGateNumber] = useState<string>('Main Gate 1');
  const [remarks, setRemarks] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera access not supported on this browser device.');
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera permission was denied or unavailable. Please use manual code entry.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleVerify = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setActionSuccess(null);

    try {
      const res = await apiRequest('/api/gatepasses/verify', {
        method: 'POST',
        body: JSON.stringify({ codeOrPayload: codeToVerify.trim() })
      });
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        reason: err.message || 'Verification failed.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRecordAction = async (action: 'exit' | 'entry') => {
    if (!verificationResult?.gatePass) return;

    setIsVerifying(true);
    try {
      await apiRequest('/api/gatepasses/record-action', {
        method: 'POST',
        body: JSON.stringify({
          passCode: verificationResult.gatePass.passCode,
          action,
          gateNumber,
          remarks: remarks || `Authorized ${action} recorded by security`
        })
      });

      setActionSuccess(`Student ${action.toUpperCase()} recorded successfully!`);
      setTimeout(() => {
        onActionComplete();
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to record entry/exit.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0D222B] border border-[#35D6E8]/30 rounded-2xl p-6 shadow-2xl text-[#D9F7FA] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#91B8C0] hover:text-white hover:bg-[#12313B] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-[#12313B]">
          <div className="w-10 h-10 rounded-xl bg-[#35D6E8]/10 flex items-center justify-center text-[#35D6E8] border border-[#35D6E8]/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">QR Gate Verification Station</h3>
            <p className="text-xs text-[#91B8C0]">Scan student pass or enter identifier manually</p>
          </div>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="my-4">
          {isCameraActive ? (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-[#35D6E8]/40">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
              <div className="absolute inset-8 border-2 border-[#35D6E8] border-dashed rounded-lg pointer-events-none animate-pulse opacity-75" />
              <button
                type="button"
                onClick={stopCamera}
                className="absolute bottom-2 right-2 text-xs bg-black/70 hover:bg-black px-2.5 py-1 rounded text-[#91B8C0] hover:text-white"
              >
                Turn Camera Off
              </button>
            </div>
          ) : (
            <div className="bg-[#12313B]/50 border border-dashed border-[#35D6E8]/30 rounded-xl p-5 text-center">
              <Camera className="w-8 h-8 text-[#35D6E8] mx-auto mb-2 opacity-70" />
              <p className="text-xs text-[#91B8C0] mb-3">Live optical camera scanner for mobile and tablet security desks</p>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#12313B] hover:bg-[#1a4452] text-xs font-semibold text-[#D9F7FA] border border-white/10"
              >
                <Camera className="w-4 h-4 text-[#35D6E8]" /> Activate Camera Stream
              </button>
              {cameraError && (
                <p className="text-[11px] text-amber-400 mt-2">{cameraError}</p>
              )}
            </div>
          )}
        </div>

        {/* Manual Pass Code Entry */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#91B8C0] uppercase tracking-wider">
            Manual Pass Code Verification
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              placeholder="e.g. CN-GP-84920"
              className="flex-1 bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8] font-mono"
            />
            <button
              onClick={() => handleVerify(manualCode)}
              disabled={isVerifying || !manualCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] font-bold text-xs transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
            >
              {isVerifying ? 'Checking...' : 'Verify Pass'}
            </button>
          </div>
        </div>

        {/* Quick Demo Passes */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#91B8C0]">
          <span>Quick test:</span>
          <button
            onClick={() => {
              setManualCode('CN-GP-84920');
              handleVerify('CN-GP-84920');
            }}
            className="px-2 py-0.5 rounded bg-[#12313B] text-[#6EEAF5] font-mono hover:bg-[#1a4452]"
          >
            CN-GP-84920
          </button>
        </div>

        {/* Verification Result Card */}
        {verificationResult && (
          <div className={`mt-4 p-4 rounded-xl border ${
            verificationResult.valid
              ? 'bg-emerald-950/40 border-emerald-500/40'
              : 'bg-rose-950/40 border-rose-500/40'
          }`}>
            <div className="flex items-start gap-3">
              {verificationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="font-bold text-sm text-white mb-1">
                  {verificationResult.valid ? 'VALID & AUTHORIZED PASS' : 'PASS DENIED / INVALID'}
                </div>
                {verificationResult.reason && (
                  <p className="text-rose-300 mb-2">{verificationResult.reason}</p>
                )}

                {verificationResult.gatePass && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/10 text-[#D9F7FA]">
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Student:</span>
                      <span className="font-semibold text-white">
                        {verificationResult.gatePass.studentName} ({verificationResult.gatePass.rollNumber})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Destination:</span>
                      <span>{verificationResult.gatePass.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Approved By:</span>
                      <span className="text-emerald-300">{verificationResult.gatePass.approverName || 'Authorized Warden'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Expected Return:</span>
                      <span className="font-mono">{new Date(verificationResult.gatePass.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Checkpoint Action Controls */}
            {verificationResult.valid && (
              <div className="mt-4 pt-3 border-t border-emerald-500/30 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#91B8C0] mb-1">Checkpoint Gate</label>
                    <select
                      value={gateNumber}
                      onChange={e => setGateNumber(e.target.value)}
                      className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Main Gate 1">Main Gate 1</option>
                      <option value="North Gate 2">North Gate 2</option>
                      <option value="Hostel Gate 3">Hostel Gate 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#91B8C0] mb-1">Officer Notes</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Optional notes"
                      className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRecordAction('exit')}
                    disabled={isVerifying}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" /> Record Student EXIT
                  </button>
                  <button
                    onClick={() => handleRecordAction('entry')}
                    disabled={isVerifying}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" /> Record Student ENTRY
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {actionSuccess && (
          <div className="mt-4 p-3 bg-emerald-900/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 text-center font-semibold animate-fade-in">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
};
