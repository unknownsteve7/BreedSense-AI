import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Camera } from './components/Camera';
import { BreedIdentification } from './components/BreedIdentification';
import { VideoProcessor } from './components/VideoProcessor';
import { BreedDatabase } from './components/BreedDatabase';
import { FLWReporting } from './components/FLWReporting';
import { ContactDirectory } from './components/ContactDirectory';
import { History } from './components/History';
import { Profile } from './components/Profile';
import type { DetectionResult } from './types';
import { toast } from 'sonner';
import { saveIdentification, sendToBackend } from './utils/storage';
import { getBuffaloBreedDetail } from './utils/api';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Bell, BellRing, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [identificationResults, setIdentificationResults] = useState<DetectionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);


  // Minimal placeholder identification until server response arrives
  const identifyBreed = async (_imageData: string): Promise<DetectionResult[]> => {
    // quick placeholder so UI has something while server call completes
    return [
      {
        breed: {
          id: 'unknown',
          name: 'Unknown',
          englishName: 'Unknown',
          category: 'buffalo',
          origin: 'Unknown',
          characteristics: { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] },
          conservation: 'common',
          description: '',
          management: { diet: [], commonDiseases: [], careNotes: [] },
          image: ''
        } as any,
        confidence: 0.5,
        boundingBox: { x: 0, y: 0, width: 1, height: 1 }
      }
    ];
  };

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setShowResults(false);

    toast.loading('Analyzing image with AI...', { id: 'identification' });

    try {
      const results = await identifyBreed(imageData);
      setIdentificationResults(results);
      setShowResults(true);
      setCurrentPage('results');

      // Persist to localStorage in unified format and call backend placeholder
      if (results && results.length > 0) {
        const top = results[0];
        const stored = saveIdentification({
          prediction: top.breed.id || top.breed.englishName || 'unknown',
          imagePath: imageData,
          timestamp: new Date().toISOString(),
          confidence: top.confidence || 0
        });

        // send to backend and update local record with server response
        try {
          const server = await sendToBackend({ imagePath: imageData, prediction: top.breed.id, confidence: top.confidence, timestamp: stored.timestamp, id: stored.id });

          if (!server?.ok) {
            // If server rejected the image (400), show a persistent in-app error box and ask user to upload another image
            if (server.status === 400) {
              const message = server.message || 'Invalid image. Please upload a clearer image showing the animal.';
              // show persistent error in UI instead of transient toast
              setServerError(message);
              // clear any tentative results
              setIdentificationResults([]);
              setShowResults(false);
              return; // stop processing
            }
            // otherwise non-blocking failure
            return;
          }

          if (server.data) {
            toast.success(`Server prediction: ${server.data.predicted_class} (${Math.round(server.data.confidence_score * 100)}%)`);
            try {
              // Try to fetch breed detail from API and show in UI
              const breedDetail = await getBuffaloBreedDetail(server.data.predicted_class);

              const serverResult: DetectionResult = {
                breed: {
                  id: breedDetail?.id || server.data.predicted_class,
                  name: breedDetail?.name || breedDetail?.englishName || server.data.predicted_class,
                  englishName: breedDetail?.englishName || breedDetail?.name || server.data.predicted_class,
                  image: breedDetail?.image || '',
                  origin: breedDetail?.origin || '',
                  category: breedDetail?.category || 'buffalo',
                  characteristics: breedDetail?.characteristics || {},
                  productionData: breedDetail?.productionData,
                  genderCharacteristics: breedDetail?.genderCharacteristics,
                  management: breedDetail?.management || { diet: [], commonDiseases: [], careNotes: [] },
                  conservation: breedDetail?.conservation || 'common',
                  description: breedDetail?.description || '',
                  history: breedDetail?.history || ''
                } as any,
                confidence: server.data.confidence_score || 0,
                boundingBox: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 }
              };

              setIdentificationResults([serverResult]);
              // Ensure the image displayed is the one persisted in localStorage
              setCapturedImage(stored.imagePath);
              // clear any previous server errors on success
              setServerError(null);
              setShowResults(true);
              setCurrentPage('results');
            } catch (e) {
              // If fetching detail fails, still show prediction text via toast
            }
          }
        } catch (e) {
          // non-blocking
        }
      }

      toast.success(`Breed identified: ${results[0]?.breed.name}`, { id: 'identification' });
    } catch (error) {
      toast.error('Failed to identify breed. Please try again.', { id: 'identification' });
    }
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      handleImageCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (file: File) => {
    toast.success(`Video uploaded: ${file.name}`);
    // Video processing would be handled in VideoProcessor component
  };

  const handleBreedCorrection = (correctedBreed: string) => {
    // In a real app, this would send feedback to improve the AI model
    console.log('Breed correction:', correctedBreed);
    toast.success('Thank you for the correction! This helps improve our AI.');
  };

  const handleNotificationClick = () => {
    setCurrentPage('notifications');
    setUnreadNotifications(0);
    setShowNotificationPanel(false);
  };


  const handleProfileClick = () => {
    setCurrentPage('profile');
    setShowProfileDropdown(false);
  };



  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications (for demo purposes)
      if (Math.random() > 0.8 && unreadNotifications < 9) {
        setUnreadNotifications(prev => prev + 1);
        toast.info('New notification received');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [unreadNotifications]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} onImageAnalysis={handleFileUpload} />;

      case 'camera':
        return (
          <div className="space-y-6">
            <Camera
              onCapture={handleImageCapture}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'results':
        return showResults && capturedImage ? (
          <BreedIdentification
            image={capturedImage}
            results={identificationResults}
            onCorrection={handleBreedCorrection}
            showHeatmap={true}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No identification results to display.</p>
          </div>
        );

      case 'video':
        return <VideoProcessor onVideoUpload={handleVideoUpload} />;

      case 'breeds':
        return <BreedDatabase />;

      case 'reports':
        return <FLWReporting />;

      case 'contacts':
        return <ContactDirectory />;

      case 'history':
        return <History />;


      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;

      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-black">
        <div className="flex h-screen">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
          </div>

          {/* Mobile Navigation (simplified) */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-green-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-400 rounded-md flex items-center justify-center">
                  <span className="text-black text-sm font-bold">AI</span>
                </div>
                <h1 className="font-semibold text-green-400">Cattle Recognition</h1>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Notification Bell */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNotificationClick}
                    className="relative text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8 p-0"
                  >
                    {unreadNotifications > 0 ? (
                      <BellRing className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    {unreadNotifications > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white border-0 flex items-center justify-center"
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Mobile Profile Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileClick}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8 p-0"
                >
                  <User className="w-4 h-4" />
                </Button>

                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="px-3 py-1 border border-green-500/30 rounded-md text-sm bg-black text-white"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="camera">Camera</option>
                  <option value="video">Video</option>
                  <option value="breeds">Breeds</option>
                  <option value="reports">Reports</option>
                  <option value="contacts">Contacts</option>
                  <option value="history">History</option>
                  <option value="notifications">Notifications</option>
                  <option value="settings">Settings</option>
                  <option value="profile">Profile</option>
                </select>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Desktop Header with Notifications */}
            <div className="hidden lg:flex items-center justify-between px-2 py-10 border-b border-green-500/20 text-xs h-12">
              <div>
                <h1 className="text-green-400 font-medium">
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                </h1>
                <p className="text-sm text-green-400 mt-1">
                  {currentPage === 'dashboard' && 'AI-Powered Cattle & Buffalo Recognition System'}
                  {currentPage === 'camera' && 'Capture images for breed identification'}
                  {currentPage === 'video' && 'Process video files for animal counting'}
                  {currentPage === 'breeds' && 'Comprehensive breed database'}
                  {currentPage === 'reports' && 'Field worker reporting system'}
                  {currentPage === 'contacts' && 'Veterinary support directory'}
                  {currentPage === 'history' && 'Analysis history and records'}
                  {currentPage === 'notifications' && 'System notifications and alerts'}
                  {currentPage === 'settings' && 'Application settings and preferences'}
                  {currentPage === 'profile' && 'User profile and account settings'}
                  {currentPage === 'results' && 'Breed identification results'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <LanguageSwitcher />

              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 lg:p-8 pt-20 lg:pt-6">
                {/* If backend returned a persistent server error (e.g., 400), show an error box */}
                {serverError ? (
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-red-200">Image rejected</h3>
                      <p className="mt-2 text-sm text-red-100">{serverError}</p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => {
                            setServerError(null);
                            setCurrentPage('camera');
                          }}
                          className="bg-red-700 hover:bg-red-600"
                        >
                          Upload another image
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setServerError(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  renderCurrentPage()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />

        {/* Click outside to close dropdowns */}
        {(showNotificationPanel || showProfileDropdown) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowNotificationPanel(false);
              setShowProfileDropdown(false);
            }}
          />
        )}
      </div>
    </LanguageProvider>
  );
}