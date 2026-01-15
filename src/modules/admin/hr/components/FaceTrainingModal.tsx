
import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '@/components/admin/shared/AdminShared';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, ScanFace, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { Employee } from '@/types';

interface FaceTrainingModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    onSave: (descriptor: number[]) => void;
}

export const FaceTrainingModal: React.FC<FaceTrainingModalProps> = ({ isOpen, onClose, employee, onSave }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'captured' | 'error'>('loading');
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const [message, setMessage] = useState('Chargement des modèles IA...');

    useEffect(() => {
        if (isOpen) {
            loadModels();
        } else {
            stopCamera();
            setStatus('loading');
            setDescriptor(null);
        }
    }, [isOpen]);

    const loadModels = async () => {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            startCamera();
        } catch (err) {
            console.error("Failed to load AI models", err);
            setStatus('error');
            setMessage("Erreur de chargement de l'IA. Vérifiez votre connexion.");
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus('ready');
                setMessage("Positionnez le visage au centre");
            }
        } catch (err) {
            console.error("Camera access denied", err);
            setStatus('error');
            setMessage("Accès caméra refusé.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const handleCapture = async () => {
        if (!videoRef.current) return;

        setStatus('detecting');
        setMessage("Analyse biométrique en cours...");

        try {
            // Wait a bit to stabilize
            await new Promise(resolve => setTimeout(resolve, 500));

            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            )
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                setDescriptor(detection.descriptor);
                setStatus('captured');
                setMessage("Empreinte faciale générée avec succès !");
            } else {
                setStatus('ready');
                alert("Aucun visage détecté. Veuillez bien vous positionner face à la caméra.");
                setMessage("Positionnez le visage au centre");
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage("Erreur lors de l'analyse.");
        }
    };

    const handleSave = () => {
        if (descriptor) {
            // Convert Float32Array to regular array for JSON serialization
            onSave(Array.from(descriptor));
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Enrôlement Biométrique - ${employee?.fullName}`}
            size="lg"
            footer={
                status === 'captured' ? (
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={() => { setDescriptor(null); setStatus('ready'); setMessage("Positionnez le visage au centre"); }}
                            className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-sm hover:bg-slate-50 transition-all"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 bg-sky-600 text-white font-black rounded-sm shadow-lg shadow-sky-600/30 hover:bg-sky-700 transition-all active:scale-95"
                        >
                            Enregistrer l'Empreinte
                        </button>
                    </div>
                ) : null
            }
        >
            <div className="flex flex-col items-center gap-6 py-4">
                {/* Video Area */}
                <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-slate-100 ring-1 ring-slate-200">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-500 ${status === 'detecting' ? 'opacity-50 blur-sm' : ''}`}
                    />

                    {/* Overlays */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {status === 'loading' && (
                            <div className="flex flex-col items-center gap-3 text-white">
                                <Loader2 className="animate-spin" size={40} />
                                <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
                            </div>
                        )}

                        {(status === 'ready' || status === 'detecting') && (
                            <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-[40%] relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-white/80 text-[10px] uppercase font-bold tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                    Zone de scanning
                                </div>
                            </div>
                        )}

                        {status === 'captured' && (
                            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                <div className="bg-white p-6 rounded-full shadow-xl">
                                    <CheckCircle2 className="text-green-500 w-16 h-16" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls & Status */}
                <div className="text-center space-y-4 w-full max-w-md">
                    <div className={`p-4 rounded-lg flex items-center justify-center gap-3 ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                        {status === 'detecting' ? <ScanFace className="animate-pulse" /> : <Camera />}
                        <p className="font-medium text-sm">{message}</p>
                    </div>

                    {status === 'ready' && (
                        <button
                            onClick={handleCapture}
                            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            <ScanFace size={20} />
                            Scanner le Visage
                        </button>
                    )}
                </div>

                <p className="text-xs text-slate-400 text-center max-w-xs">
                    L'empreinte faciale est convertie en une signature mathématique chiffrée. Aucune image n'est conservée.
                </p>
            </div>
        </Modal>
    );
};
