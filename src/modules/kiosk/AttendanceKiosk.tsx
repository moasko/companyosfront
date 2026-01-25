import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  ShieldCheck,
  UserCheck,
  Clock,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import * as faceapi from 'face-api.js';

export const AttendanceKiosk: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading_ai' | 'detecting' | 'recognizing' | 'success' | 'error'
  >('loading_ai');
  const [isAILoaded, setIsAILoaded] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState("Initialisation de l'IA...");
  const [stats, setStats] = useState({ present: 0, total: 0 });
  const [faceDetected, setFaceDetected] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);

  useEffect(() => {
    if (employees.length > 0 && isAILoaded) {
      const labeledDescriptors = employees
        .filter((e) => e.faceDescriptor)
        .map((e) => {
          try {
            const descriptor = new Float32Array(JSON.parse(e.faceDescriptor));
            return new faceapi.LabeledFaceDescriptors(e.id, [descriptor]);
          } catch (err) {
            return null;
          }
        })
        .filter((d) => d !== null) as faceapi.LabeledFaceDescriptors[];

      if (labeledDescriptors.length > 0) {
        setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
        console.log('AI Matcher initialized with ' + labeledDescriptors.length + ' profiles');
      }
    }
  }, [employees, isAILoaded]);

  const loadModels = async () => {
    const MODEL_URL =
      'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setIsAILoaded(true);
    } catch (err) {
      console.error('Failed to load AI models', err);
      setMessage("Erreur de chargement de l'IA. Mode manuel activé.");
    }
  };

  const fetchData = async () => {
    try {
      // Public endpoint to get employee names for the kiosk
      const data = await apiFetch(`/kiosk/${companyId}/employees`);
      setEmployees(data);

      const attendances = await apiFetch(`/kiosk/${companyId}/stats`);
      setStats(attendances);
    } catch (err) {
      console.error('Failed to fetch kiosk data', err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied', err);
      setMessage('Caméra non accessible. Veuillez vérifier les permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startAIDetection = () => {
    const detectionInterval = setInterval(async () => {
      if (videoRef.current && isAILoaded && status === 'idle') {
        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          setFaceDetected(true);
          setAiConfidence(Math.round(detection.detection.score * 100));

          // Match Face with increased distance threshold (more lenient)
          if (faceMatcher) {
            const match = faceMatcher.findBestMatch(detection.descriptor);

            // Default threshold is 0.6, we accept up to 0.55 distance (lower is better match)
            if (match.label !== 'unknown' && match.distance < 0.55) {
              const matchedEmployee = employees.find((e) => e.id === match.label);
              if (matchedEmployee) {
                // We found a match!
                setFaceDetected(true);
                setAiConfidence(Math.round((1 - match.distance) * 100));

                // Prevent spamming
                if (status === 'idle') {
                  setSelectedEmployee(matchedEmployee);
                  clearInterval(detectionInterval);
                  // STOP here. Logic changed: Show Info -> Wait for Manual Validation
                  setMessage(`Bonjour ${matchedEmployee.fullName}. Veuillez valider.`);
                  // handleAutoValidate(matchedEmployee); <-- REMOVED
                  return;
                }
              }
            } else {
              // Feedback for unknown face
              // console.log("Unknown face detected");
            }
          }

          // Fallback: If someone is manually selected and face is stable
          if (selectedEmployee && detection.detection.score > 0.8) {
            // Strict check if no biometric match but manual selection
            // For now we allow it as "Semi-Automatic"
          }
        } else {
          setFaceDetected(false);
          setAiConfidence(0);
        }
      }
    }, 200);

    return () => clearInterval(detectionInterval);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const init = async () => {
      await loadModels();
      await fetchData();
      await startCamera();
      setStatus('idle');
      setMessage('');
      startAIDetection();
    };

    init();

    return () => {
      clearInterval(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAutoValidate = async (employee: any) => {
    setStatus('recognizing');
    setMessage(`Identification de ${employee.fullName}...`);

    await new Promise((resolve) => setTimeout(resolve, 800)); // UX delay

    try {
      await apiFetch(`/kiosk/${companyId}/attendance`, {
        method: 'POST',
        body: JSON.stringify({
          employeeId: employee.id,
          status: 'Présent',
          date: new Date().toISOString().split('T')[0],
          checkIn: new Date().toISOString(),
        }),
      });

      setStatus('success');
      setMessage(`Pointage validé pour ${employee.fullName} !`);
      setStats((prev) => ({ ...prev, present: prev.present + 1 }));

      setTimeout(() => {
        setStatus('idle');
        setSelectedEmployee(null);
        setMessage('');
        startAIDetection(); // Restart loop
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage('Erreur validation.');
      setTimeout(() => {
        setStatus('idle');
        startAIDetection();
      }, 3000);
    }
  };

  const handleIdentify = async () => {
    if (!selectedEmployee) return;

    setStatus('detecting');
    setMessage('Validation du pointage...');

    // Directly validate since we already identified via AI or manual select
    setTimeout(async () => {
      try {
        await apiFetch(`/kiosk/${companyId}/attendance`, {
          method: 'POST',
          body: JSON.stringify({
            employeeId: selectedEmployee.id,
            status: 'Présent',
            date: new Date().toISOString().split('T')[0],
            checkIn: new Date().toISOString(),
          }),
        });

        setStatus('success');
        setMessage(`Pointage réussi pour ${selectedEmployee.fullName} !`);
        setStats((prev) => ({ ...prev, present: prev.present + 1 }));

        // Reset after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setSelectedEmployee(null);
          setMessage('');
          startAIDetection(); // Restart AI Loop
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage("Erreur lors de l'enregistrement.");
        setTimeout(() => {
          setStatus('idle');
          startAIDetection();
        }, 3000);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-sky-500 rounded-full blur-[160px]"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full blur-[160px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-8 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-600/20">
            <Smartphone className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">
              KIOSQUE{' '}
              <span className="text-sky-500 text-sm ml-1 font-bold uppercase tracking-widest">
                ENEA ERP
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              Espace Public de Pointage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Présences Aujourd&apos;hui
            </p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-black text-sky-500">{stats.present}</span>
              <span className="text-slate-600">/</span>
              <span className="text-xl font-bold text-slate-400">{stats.total}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">
              {currentTime.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex p-8 gap-8 overflow-hidden">
        {/* Left: Camera View */}
        <div className="flex-[1.5] flex flex-col gap-6">
          <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover grayscale brightness-110 contrast-125 ${status === 'recognizing' || status === 'detecting' ? 'opacity-50 blur-[2px]' : ''} transition-all duration-700`}
            />

            {/* Data Stream Overlay (Matrix-like) */}
            <div className="absolute top-10 left-10 text-[8px] font-mono text-sky-500/40 space-y-1 pointer-events-none hidden lg:block">
              <p>SYS_INIT: {status.toUpperCase()}</p>
              <p>AI_ENGINE: FACE-API.JS</p>
              <p>MODELS: {isAILoaded ? 'LOADED' : 'WAITING'}</p>
              <p>FACE_DETECTED: {faceDetected ? 'YES' : 'NO'}</p>
              <p>CONFIDENCE: {aiConfidence}%</p>
            </div>

            {/* AI Status Bar (Bottom of Video) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 z-20">
              <div
                className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'} animate-pulse`}
              ></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {faceDetected
                  ? selectedEmployee
                    ? 'Sujet Identifié'
                    : 'Visage détecté (Inconnu)'
                  : 'Recherche de Sujet...'}
              </p>
              {faceDetected && (
                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300"
                      style={{ width: `${aiConfidence}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400">{aiConfidence}%</span>
                </div>
              )}
            </div>

            {/* Camera Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning frame */}
              <div
                className={`absolute inset-[15%] border-2 rounded-[40px] transition-all duration-500 ${faceDetected ? 'border-sky-500/50 border-solid scale-105' : 'border-white/10 border-dashed'}`}
              >
                {status === 'idle' && !faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-sky-500/10 border border-sky-500/20 backdrop-blur-md px-6 py-4 rounded-2xl text-center animate-pulse">
                      <p className="text-sky-400 font-black uppercase tracking-[0.2em] text-xs">
                        Approchez-vous de la caméra
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Corner Accents */}
              <div
                className={`absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 rounded-tl-3xl transition-all duration-500 ${status === 'success' ? 'border-green-500' : faceDetected ? 'border-sky-500 scale-110' : 'border-slate-700'}`}
              ></div>
              <div
                className={`absolute top-10 right-10 w-20 h-20 border-t-4 border-r-4 rounded-tr-3xl transition-all duration-500 ${status === 'success' ? 'border-green-500' : faceDetected ? 'border-sky-500 scale-110' : 'border-slate-700'}`}
              ></div>
              <div
                className={`absolute bottom-10 left-10 w-20 h-20 border-b-4 border-l-4 rounded-bl-3xl transition-all duration-500 ${status === 'success' ? 'border-green-500' : faceDetected ? 'border-sky-500 scale-110' : 'border-slate-700'}`}
              ></div>
              <div
                className={`absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 rounded-br-3xl transition-all duration-500 ${status === 'success' ? 'border-green-500' : faceDetected ? 'border-sky-500 scale-110' : 'border-slate-700'}`}
              ></div>

              {/* Scan Line */}
              {(status === 'detecting' ||
                status === 'recognizing' ||
                (status === 'idle' && faceDetected)) && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-scan-line"></div>
              )}

              {/* Face Recognition Points (Real-time points) */}
              {faceDetected && status === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-80">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse"></div>
                    <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message Overlay */}
            {(status !== 'idle' || status === 'loading_ai') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in zoom-in duration-300 z-30">
                <div className="text-center p-12 bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl scale-110">
                  {status === 'loading_ai' ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-16 h-16 border-4 border-sky-500/20 rounded-full border-t-sky-500 animate-spin"></div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-white">CHARGEMENT DE L'IA</p>
                        <p className="text-sky-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                          Initialisation des modèles neuronaux...
                        </p>
                      </div>
                    </div>
                  ) : status === 'detecting' || status === 'recognizing' ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-sky-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-t-4 border-sky-500 rounded-full animate-spin"></div>
                        <Camera className="absolute inset-0 m-auto text-sky-500" size={32} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-white">
                          {status === 'detecting' ? 'DÉTECTION...' : 'IDENTIFICATION...'}
                        </p>
                        <p className="text-sky-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                          {message}
                        </p>
                      </div>
                    </div>
                  ) : status === 'success' ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                        <UserCheck className="text-white" size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-black text-white">BIENVENU(E)</p>
                        <p className="text-green-400 font-bold text-xl">
                          {selectedEmployee?.fullName}
                        </p>
                        <p className="text-slate-400 text-sm font-medium mt-4 flex items-center justify-center gap-2">
                          <Clock size={16} /> {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
                        <AlertCircle className="text-white" size={40} />
                      </div>
                      <p className="text-xl font-black text-white">{message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-400">
              <ShieldCheck size={20} className="text-sky-500" />
              <p className="text-sm font-medium">
                Système sécurisé par reconnaissance faciale biométrique
              </p>
            </div>
            <button
              onClick={() => {
                stopCamera();
                navigate('/');
              }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={14} /> Quitter le Kiosque
            </button>
          </div>
        </div>

        {/* Right: Employee Selection */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 flex">
            <div className="flex-1 py-3 text-center text-xs font-black uppercase tracking-widest bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-600/20">
              Sélectionner Nom
            </div>
            <div className="flex-1 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
              Scanner Badge
            </div>
          </div>

          <div className="flex-1 bg-slate-900/30 rounded-3xl border border-white/5 overflow-hidden flex flex-col p-4">
            <div className="mb-6 px-2 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Collaborateurs
              </h2>
              <button
                onClick={fetchData}
                className="p-2 hover:bg-white/5 rounded-lg active:rotate-180 transition-transform duration-500"
              >
                <RefreshCw size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                    selectedEmployee?.id === emp.id
                      ? 'bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/5'
                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300 ${selectedEmployee?.id === emp.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {emp.fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div className="text-left flex-1">
                    <p
                      className={`font-bold transition-colors ${selectedEmployee?.id === emp.id ? 'text-sky-400' : 'text-slate-200'}`}
                    >
                      {emp.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {emp.position}
                    </p>
                  </div>
                  <div
                    className={`transition-all duration-300 ${selectedEmployee?.id === emp.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}
                  >
                    <ChevronRight size={20} className="text-sky-500" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <button
                disabled={!selectedEmployee || status !== 'idle'}
                onClick={handleIdentify}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 overflow-hidden group relative ${
                  !selectedEmployee || status !== 'idle'
                    ? 'bg-slate-800 text-slate-600 grayscale'
                    : 'bg-sky-600 text-white hover:bg-sky-500 shadow-2xl shadow-sky-600/30 active:scale-95'
                }`}
              >
                <Camera size={20} />
                {status === 'idle'
                  ? selectedEmployee
                    ? `CONFIRMER ${selectedEmployee.fullName.split(' ')[0]}`
                    : 'Valider Présence'
                  : 'En cours...'}

                <div className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>

              {/* Rescan Option */}
              {status === 'idle' && selectedEmployee && (
                <button
                  onClick={() => {
                    setSelectedEmployee(null);
                    setMessage('');
                    startAIDetection();
                  }}
                  className="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-sky-400 transition-colors"
                >
                  Ce n&apos;est pas vous ? Scanner à nouveau
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
                @keyframes scan-line {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scan-line {
                    animation: scan-line 3s infinite linear;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
    </div>
  );
};
