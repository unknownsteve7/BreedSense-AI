import React, { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, RotateCcw, Zap, ZapOff, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';


interface CameraProps {
  onCapture: (imageData: string) => void;
  onFileUpload: (file: File) => void;
}

export function Camera({ onCapture, onFileUpload }: CameraProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);


  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        toast.success('Camera started successfully');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
    toast.success('Image captured successfully');
  }, [onCapture]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(startCamera, 100);
  }, [startCamera, stopCamera]);

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current) return;
    
    const rect = videoRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setFocusPoint({ x, y });
    setTimeout(() => setFocusPoint(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
      toast.success('Image uploaded successfully');
    } else {
      toast.error('Please select a valid image file');
    }
  };





  React.useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      {/* Camera Capture Interface */}
      <Card className="w-full max-w-2xl mx-auto bg-card/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">Camera Capture</CardTitle>
          <p className="text-sm text-green-300">Capture high-quality images for breed analysis</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
            {isStreaming ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover cursor-crosshair"
                  onClick={handleVideoClick}
                />
                {focusPoint && (
                  <div
                    className="absolute w-20 h-20 border-2 border-green-400 rounded-full animate-ping"
                    style={{
                      left: `${focusPoint.x}%`,
                      top: `${focusPoint.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-black/70 text-green-400 border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    {t('camera.live')}
                  </Badge>
                  {flashEnabled && (
                    <Badge variant="secondary" className="bg-black/70 text-green-400 border-green-500/30">
                      <Zap className="w-3 h-3 mr-1" />
                      {t('camera.flash')}
                    </Badge>
                  )}
                </div>
                
                {/* Camera guide overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-green-400/50 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                  </div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <p className="text-green-400 text-sm bg-black/70 px-3 py-1 rounded border border-green-500/30">
                      {t('camera.guidance')}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-green-400">
                <div className="text-center">
                  <CameraIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-white">Camera preview will appear here</p>
                  <p className="text-sm mt-2 text-green-300">Click "Start Camera" to begin</p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex flex-wrap gap-2 justify-center">
            {!isStreaming ? (
              <Button onClick={startCamera} className="min-w-32 bg-green-500 hover:bg-green-400 text-black">
                <CameraIcon className="w-4 h-4 mr-2" />
                {t('camera.startCamera')}
              </Button>
            ) : (
              <>
                <Button onClick={captureImage} size="lg" className="min-w-32 bg-green-500 hover:bg-green-400 text-black">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {t('camera.capture')}
                </Button>
                <Button onClick={stopCamera} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50">
                  {t('camera.stopCamera')}
                </Button>
              </>
            )}
            
            <Button
              onClick={switchCamera}
              variant="outline"
              disabled={!isStreaming}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 disabled:opacity-50 disabled:border-green-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('camera.flip')}
            </Button>
            
            <Button
              onClick={() => setFlashEnabled(!flashEnabled)}
              variant="outline"
              disabled={!isStreaming}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 disabled:opacity-50 disabled:border-green-500/10"
            >
              {flashEnabled ? <Zap className="w-4 h-4 mr-2" /> : <ZapOff className="w-4 h-4 mr-2" />}
              {t('camera.flash')}
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload & Analyze
            </Button>

          </div>

          <div className="mt-4 text-center text-sm text-green-300">
            <p>{t('camera.formats')}</p>
            <p>{t('camera.tips')}</p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}