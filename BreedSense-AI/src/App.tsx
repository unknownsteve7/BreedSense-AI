import { useState } from 'react';
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
import type { DetectionResult } from './types';
import { toast } from 'sonner';
import { saveIdentification, sendToBackend } from './utils/storage';
import { getBuffaloBreedDetail, recognizeBreed } from './utils/api';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Button } from './components/ui/button';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [identificationResults, setIdentificationResults] = useState<DetectionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);


  // Convert data URL to File for API call
  const dataURLtoFile = (dataurl: string, filename = 'capture.jpg'): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Real API-based breed identification
  const identifyBreed = async (imageData: string): Promise<DetectionResult[]> => {
    try {
      // Convert data URL to File
      const file = dataURLtoFile(imageData, `capture-${Date.now()}.jpg`);

      // Call the API
      const result = await recognizeBreed(file);

      // Check if we got a valid result
      if (!result || !result.predicted_class) {
        throw new Error('Invalid API response: missing predicted_class');
      }

      // Get breed details
      let breedDetail;
      try {
        breedDetail = await getBuffaloBreedDetail(result.predicted_class);
      } catch (error) {
        breedDetail = {
          id: result.predicted_class,
          name: result.predicted_class,
          englishName: result.predicted_class,
          category: 'buffalo',
          origin: 'Unknown',
          characteristics: { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] },
          conservation: 'common',
          description: '',
          management: { diet: [], commonDiseases: [], careNotes: [] },
          image: ''
        };
      }

      return [
        {
          breed: breedDetail,
          confidence: result.confidence_score,
          boundingBox: { x: 0, y: 0, width: 1, height: 1 }
        }
      ];
    } catch (error) {
      // Check if it's a network error
      if (error && (error as any).isNetworkError) {
        toast.error('Network error: ' + (error as any).message);
      }

      // Check if it's an API error
      if (error && (error as any).status) {

        // Handle specific API errors
        if ((error as any).status === 400) {
          const errorBody = (error as any).body;
          let errorMessage = 'No buffalo or cow detected in the image.';

          try {
            const errorData = JSON.parse(errorBody);
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (e) {
            // Use default message if parsing fails
          }

          toast.error(errorMessage);

          // Return a specific "no detection" result
          return [
            {
              breed: {
                id: 'no_detection',
                name: 'No Animal Detected',
                englishName: 'No Animal Detected',
                category: 'buffalo',
                origin: 'Unknown',
                characteristics: { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] },
                conservation: 'common',
                description: 'Please ensure the image contains a clear view of a buffalo or cow. Make sure the animal is well-lit and takes up a significant portion of the frame.',
                management: { diet: [], commonDiseases: [], careNotes: [] },
                image: ''
              } as any,
              confidence: 0.0,
              boundingBox: { x: 0, y: 0, width: 1, height: 1 }
            }
          ];
        } else {
          toast.error('API error: ' + (error as any).status + ' - ' + (error as any).body);
        }
      }

      // Return fallback result on error
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
          confidence: 0.1,
          boundingBox: { x: 0, y: 0, width: 1, height: 1 }
        }
      ];
    }
  };

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setShowResults(false);

    // Store analysis data in sessionStorage
    const analysisData = {
      imageData: imageData,
      timestamp: new Date().toISOString(),
      status: 'analyzing'
    };
    sessionStorage.setItem('current_analysis', JSON.stringify(analysisData));

    toast.loading('Processing...', { id: 'identification' });

    try {
      const results = await identifyBreed(imageData);
      setIdentificationResults(results);
      setShowResults(true);
      setCurrentPage('results');

      // Update analysis status in sessionStorage
      const updatedAnalysisData = {
        ...analysisData,
        status: 'completed',
        results: results
      };
      sessionStorage.setItem('current_analysis', JSON.stringify(updatedAnalysisData));

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
              // Dismiss the loading toast
              toast.dismiss('identification');
              return; // stop processing
            }
            // otherwise non-blocking failure
            toast.error('Error processing image', { id: 'identification' });
            // Dismiss the loading toast in case of network errors
            toast.dismiss('identification');
            return;
          }
          // Dismiss the loading toast in case of network errors
          toast.dismiss('identification');

          if (server.data) {
            // Update toast with server prediction instead of creating a new one
            toast.success(`Server prediction: ${server.data.predicted_class} (${Math.round(server.data.confidence_score)}%)`, { id: 'identification' });
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
          } else {
            // If no server data, update toast with local results
            toast.success(`Breed identified: ${results[0]?.breed.name}`, { id: 'identification' });
          }
        } catch (e) {
          // If server request fails, update toast with local results
          if (results && results.length > 0) {
            toast.success(`Breed identified: ${results[0]?.breed.name}`, { id: 'identification' });
          } else {
            toast.error('Error processing image', { id: 'identification' });
          }
        }
      } else {
        // If no results, update toast with generic success message
        toast.success('Analysis complete', { id: 'identification' });
      }
    } catch (error) {
      toast.error('Failed to identify breed. Please try again.', { id: 'identification' });

      // Update analysis status in sessionStorage
      const errorAnalysisData = {
        imageData: imageData,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      sessionStorage.setItem('current_analysis', JSON.stringify(errorAnalysisData));
      
      // Make sure we dismiss the loading toast in case of errors
      toast.dismiss('identification');
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
            showHeatmap={true}
            onNavigate={setCurrentPage}
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
                </select>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Desktop Header */}
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
                          onClick={() => {
                            setServerError(null);
                            setCurrentPage('camera');
                          }}
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
      </div>
    </LanguageProvider>
  );
}