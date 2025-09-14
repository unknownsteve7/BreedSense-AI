import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  Camera,
  Video,
  Database,
  FileText,
  TrendingUp,
  Users,
  Eye,

  BarChart3,
  Activity,
  Upload
} from 'lucide-react';
import { loadIdentifications } from '../utils/storage';
import { getBuffaloBreeds } from '../utils/api';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadModal } from './UploadModal';
import { ProcessingModal } from './ProcessingModal';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onImageAnalysis?: (file: File) => void;
}

export function Dashboard({ onNavigate, onImageAnalysis }: DashboardProps) {
  const { t } = useLanguage();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const persisted = loadIdentifications();

  // Derived statistics from persisted data and backend
  const [breedsCount, setBreedsCount] = useState<number>(51); // default to 51 as requested

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const names = await getBuffaloBreeds();
        if (mounted && Array.isArray(names) && names.length > 0) setBreedsCount(names.length);
      } catch (e) {
        // keep default 51
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalIdentifications = persisted.length;

  // Normalize confidence values: if confidences look like 0..1, convert to percent
  const normalizedConfs = persisted.map(p => {
    const v = typeof p.confidence === 'number' ? p.confidence : 0;
    return v > 1 ? v : v * 100;
  });
  const avgConfidence = normalizedConfs.length > 0 ? (normalizedConfs.reduce((a, b) => a + b, 0) / normalizedConfs.length) : 0;

  const accuracyRate = 89; // default model accuracy as requested



  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleStartAnalysis = (file: File) => {
    setShowUploadModal(false);
    setShowProcessingModal(true);
    setSelectedFile(file);
  };

  const handleProcessingComplete = () => {
    setShowProcessingModal(false);
    if (selectedFile && onImageAnalysis) {
      onImageAnalysis(selectedFile);
    }
    // Navigate to results page
    onNavigate('results');
  };

  const handleCameraCapture = () => {
    setShowUploadModal(false);
    onNavigate('camera');
  };

  const quickActions = [
    {
      title: t('actions.captureImage'),
      description: t('actions.captureImageDesc'),
      icon: Camera,
      color: 'bg-green-600',
      action: () => onNavigate('camera')
    },
    {
      title: t('actions.processVideo'),
      description: t('actions.processVideoDesc'),
      icon: Video,
      color: 'bg-green-500',
      action: () => onNavigate('video')
    },
    {
      title: t('actions.browseBreds'),
      description: t('actions.browseBredsDesc'),
      icon: Database,
      color: 'bg-green-400',
      action: () => onNavigate('breeds')
    },
    {
      title: t('actions.createReport'),
      description: t('actions.createReportDesc'),
      icon: FileText,
      color: 'bg-green-300',
      action: () => onNavigate('reports')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-green-400">{t('dashboard.welcome')}</h1>
              <p className="text-green-300">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-400">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
              <Badge variant="default" className="mt-1 bg-green-500 text-black hover:bg-green-400">
                <Activity className="w-3 h-3 mr-1" />
                {t('dashboard.systemActive')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">{t('dashboard.totalIdentifications')}</p>
                <p className="text-2xl font-bold text-white">{totalIdentifications}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">{t('dashboard.accuracyRate')}</p>
                <p className="text-2xl font-bold text-white">{accuracyRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={accuracyRate} className="h-2 bg-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">{t('Total Breeds')}</p>
                <p className="text-2xl font-bold text-white">{breedsCount}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">{t('dashboard.avgConfidence')}</p>
                <p className="text-2xl font-bold text-white">{avgConfidence ? avgConfidence.toFixed(1) : 'N/A'}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={avgConfidence} className="h-2 bg-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Breed Analysis Section */}
      <Card className="bg-card/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Upload className="w-5 h-5 text-green-500" />
            Quick Breed Analysis
          </CardTitle>
          <p className="text-sm text-green-300">
            Upload an image or capture from camera for instant breed identification
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Start Breed Analysis</h3>
            <p className="text-sm text-gray-400 mb-6">
              Upload images of cattle or buffalo for AI-powered breed identification
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button
                onClick={() => onNavigate('camera')}
                className="border-green-400/30 text-green-400 bg-black hover:bg-green-500/10  border hover:border-green-400"
              >
                <Camera className="w-4 h-4 mr-2" />
                Use Camera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">{t('dashboard.quickActions')}</CardTitle>
          <p className="text-sm text-green-300">
            Common tasks for Field Level Workers
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer bg-card/30 border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5" onClick={action.action}>
                <CardContent className="pt-6 text-center">
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <action.icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="font-medium mb-2 text-white">{action.title}</h3>
                  <p className="text-sm text-green-300">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Removed Recent Activity and Breed Distribution as requested */}

      {/* System Status */}
      <Card className="bg-card/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Activity className="w-5 h-5 text-green-500" />
            {t('dashboard.systemStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">AI Model</p>
                <p className="text-xs text-green-300">Online & Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">BPA Integration</p>
                <p className="text-xs text-green-300">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">Offline Mode</p>
                <p className="text-xs text-green-300">Ready for Low Connectivity</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload and Processing Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleFileSelect}
        onCameraCapture={handleCameraCapture}
        onStartAnalysis={handleStartAnalysis}
      />

      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        onCancel={() => setShowProcessingModal(false)}
        onComplete={handleProcessingComplete}
      />
    </div>
  );
}