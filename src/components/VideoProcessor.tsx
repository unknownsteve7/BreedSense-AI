import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, Play, Pause, SkipBack, SkipForward, Download, Eye, Clock, Users } from 'lucide-react';
import type { BreedInfo } from '../types';
// fallback breed names used for mock video analysis when API data isn't available
const fallbackBreedNames = ['murrah', 'sahiwal', 'gir', 'crossbred', 'nili-ravi'];

function makeMinimalBreed(id: string): BreedInfo {
  return {
    id,
    name: id,
    englishName: id,
    category: 'buffalo',
    origin: 'Unknown',
    characteristics: { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] },
    conservation: 'common',
    description: '',
    management: { diet: [], commonDiseases: [], careNotes: [] },
    image: ''
  };
}
import { toast } from 'sonner';
import { UploadModal } from './UploadModal';
import { saveIdentification, sendToBackend } from '../utils/storage';
import { ProcessingModal } from './ProcessingModal';

interface VideoProcessorProps {
  onVideoUpload?: (file: File) => void;
}

interface VideoAnalysisResult {
  totalAnimals: number;
  breedCounts: Record<string, number>;
  detections: Array<{
    timestamp: number;
    frame: number;
    animals: Array<{
      id: string;
      breed: BreedInfo;
      confidence: number;
      boundingBox: { x: number; y: number; width: number; height: number };
    }>;
  }>;
  processingTime: number;
}

export function VideoProcessor({ onVideoUpload }: VideoProcessorProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // removed unused selectedFrame state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock analysis function - in real implementation, this would call the AI service
  const analyzeVideo = async (_file: File): Promise<VideoAnalysisResult> => {
    // Simulate processing with progress updates
    const duration = 5000; // 5 seconds simulation
    const interval = 100;
    let progress = 0;

    return new Promise((resolve) => {
      const progressInterval = setInterval(() => {
        progress += (interval / duration) * 100;
        setProcessingProgress(Math.min(progress, 100));

        if (progress >= 100) {
          clearInterval(progressInterval);

          // Mock results
          const mockResult: VideoAnalysisResult = {
            totalAnimals: 8,
            breedCounts: {
              'gir': 3,
              'sahiwal': 2,
              'murrah': 2,
              'crossbred': 1
            },
            detections: Array.from({ length: 20 }, (_, i) => ({
              timestamp: i * 0.5,
              frame: i * 15,
              animals: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
                id: `animal_${i}_${j}`,
                breed: makeMinimalBreed(fallbackBreedNames[Math.floor(Math.random() * fallbackBreedNames.length)]),
                confidence: 0.75 + Math.random() * 0.24,
                boundingBox: {
                  x: Math.random() * 0.6,
                  y: Math.random() * 0.6,
                  width: 0.2 + Math.random() * 0.2,
                  height: 0.2 + Math.random() * 0.2
                }
              }))
            })),
            processingTime: 4.2
          };

          resolve(mockResult);
        }
      }, interval);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      onVideoUpload?.(file);
      toast.success('Video uploaded successfully');
    } else {
      toast.error('Please select a valid video file');
    }
  };

  const handleProcessVideo = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const result = await analyzeVideo(videoFile);
      setAnalysisResult(result);

      // Persist a summary of the video analysis to localStorage.
      try {
        let imageData = '';
        if (videoRef.current) {
          const v = videoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = v.videoWidth || 640;
          canvas.height = v.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            imageData = canvas.toDataURL('image/jpeg', 0.7);
          }
        }

        const topBreed = Object.keys(result.breedCounts).sort((a, b) => (result.breedCounts as any)[b] - (result.breedCounts as any)[a])[0] || 'unknown';
        const confidence = 0.75; // mock average
        const stored = saveIdentification({
          prediction: topBreed,
          imagePath: imageData || '',
          timestamp: new Date().toISOString(),
          confidence
        });

        // send to backend and update record
        try {
          const server = await sendToBackend({ imagePath: imageData || '', prediction: topBreed, confidence, timestamp: stored.timestamp, id: stored.id });
          if (server?.ok && server.data) {
            toast.success(`Server prediction: ${server.data.predicted_class} (${Math.round(server.data.confidence_score * 100)}%)`);
          }
        } catch (e) {
          // non-blocking
        }
      } catch (e) {
        console.warn('Failed to persist video analysis summary', e);
      }

      toast.success(`Video processed successfully! Found ${result.totalAnimals} animals`);
    } catch (error) {
      toast.error('Error processing video');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seekToDetection = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const handleModalFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleStartAnalysis = (file: File) => {
    setShowUploadModal(false);
    setShowProcessingModal(true);
    setSelectedFile(file);
  };

  const handleProcessingComplete = () => {
    setShowProcessingModal(false);
    if (selectedFile) {
      // Check if it's a video file
      if (selectedFile.type.startsWith('video/')) {
        setVideoFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setVideoUrl(url);
        onVideoUpload?.(selectedFile);
        toast.success('Video uploaded successfully');

        // Auto-start video processing
        setTimeout(() => {
          handleProcessVideo();
        }, 500);
      } else {
        toast.error('Please select a valid video file');
      }
    }
  };

  const exportResults = () => {
    if (!analysisResult) return;

    const report = {
      timestamp: new Date().toISOString(),
      videoFile: videoFile?.name,
      totalAnimals: analysisResult.totalAnimals,
      breedDistribution: analysisResult.breedCounts,
      detections: analysisResult.detections,
      processingTime: analysisResult.processingTime
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `video-analysis-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Analysis results exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-card/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">Video Upload & Processing</CardTitle>
          <p className="text-sm text-green-300">Upload and analyze videos for comprehensive breed identification</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              {videoUrl ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-w-md mx-auto rounded-lg"
                    controls={false}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setCurrentTime(0);
                      }
                    }}
                  />
                  <div className="flex justify-center gap-2">
                    <Button onClick={togglePlayPause} variant="outline">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button onClick={() => seekToDetection(0)} variant="outline">
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => seekToDetection(currentTime + 5)} variant="outline">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-green-300">
                    {videoFile?.name} • {videoFile?.size ? (videoFile.size / 1024 / 1024).toFixed(1) : 'N/A'} MB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg mb-2 text-white">Upload Video for Analysis</p>
                  <p className="text-sm text-green-300 mb-4">
                    Supports MP4, MOV, AVI, MKV formats • Max 100MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant={videoUrl ? "outline" : "default"}
                  className={videoUrl ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "bg-green-500 hover:bg-green-600 text-black"}
                >
                  {videoUrl ? 'Change Video' : 'Select Video'}
                </Button>

                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-black"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </Button>

                {videoUrl && !isProcessing && !analysisResult && (
                  <Button onClick={handleProcessVideo} className="bg-green-500 hover:bg-green-600 text-black">
                    <Eye className="w-4 h-4 mr-2" />
                    Process Video
                  </Button>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-green-400">
                  <span>Processing video...</span>
                  <span>{processingProgress.toFixed(0)}%</span>
                </div>
                <Progress value={Number.isFinite(processingProgress) ? Math.max(0, Math.min(100, processingProgress)) : 0} className="bg-green-500/20" />
                <p className="text-xs text-green-300 text-center">
                  Analyzing frames, detecting animals, and identifying breeds...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="bg-card/50 border-green-500/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-green-400">Analysis Results</CardTitle>
              <Button onClick={exportResults} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger value="summary" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Summary</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Timeline</TabsTrigger>
                <TabsTrigger value="breeds" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Breed Analysis</TabsTrigger>
                <TabsTrigger value="tracking" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Animal Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{analysisResult.totalAnimals}</div>
                        <p className="text-sm text-muted-foreground">Total Animals Detected</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{analysisResult.processingTime}s</div>
                        <p className="text-sm text-muted-foreground">Processing Time</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{analysisResult.detections.length}</div>
                        <p className="text-sm text-muted-foreground">Analyzed Frames</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertDescription>
                    Analysis complete! The AI system detected and tracked {analysisResult.totalAnimals} animals
                    across {analysisResult.detections.length} frames with breed classification for each detection.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysisResult.detections.map((detection, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {detection.timestamp.toFixed(1)}s
                          </Badge>
                          <span className="text-sm">
                            Frame {detection.frame} • {detection.animals.length} animal(s)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => seekToDetection(detection.timestamp)}
                        >
                          Jump to Frame
                        </Button>
                      </div>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {detection.animals.map((animal, animalIdx) => (
                          <Badge key={animalIdx} variant="secondary" className="text-xs">
                            {animal.breed.englishName} ({(animal.confidence * 100).toFixed(0)}%)
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="breeds" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysisResult.breedCounts).map(([breedId, count]) => {
                    const breed = makeMinimalBreed(breedId);

                    return (
                      <Card key={breedId}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={breed.image}
                              alt={breed.englishName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{breed.name}</h4>
                              <p className="text-sm text-muted-foreground">{breed.englishName}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{count}</div>
                              <p className="text-xs text-muted-foreground">detected</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-4">
                <div className="text-center py-8">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Animal Tracking Visualization</h3>
                  <p className="text-muted-foreground mb-4">
                    Interactive tracking view showing individual animal paths and IDs across frames
                  </p>
                  <Badge variant="outline">Available in full implementation</Badge>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Upload and Processing Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleModalFileSelect}
        onStartAnalysis={handleStartAnalysis}
        title="Upload Video"
        description="Select a video file containing cattle or buffalo for video analysis and breed identification"
      />

      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        onCancel={() => setShowProcessingModal(false)}
        onComplete={handleProcessingComplete}
        title="Processing Video"
        description="BreedSense AI is analyzing your video for breed identification and animal counting"
      />
    </div>
  );
}