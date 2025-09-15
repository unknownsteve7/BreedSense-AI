import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { MapPin, Eye, Volume2, Download, AlertTriangle, Calendar, Scale, Droplets, Award, Heart, Info } from 'lucide-react';
import type { DetectionResult } from '../types';
import { toast } from 'sonner';

interface BreedIdentificationProps {
  image: string;
  results: DetectionResult[];
  onCorrection?: (correctedBreed: string) => void;
  showHeatmap?: boolean;
  onNavigate?: (page: string) => void;
}

export function BreedIdentification({
  image,
  results,
  onNavigate,
}: BreedIdentificationProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const topResult = results[0];
  const isLowConfidence = topResult?.confidence < 0.6;
  const isNoDetection = topResult?.breed?.id === 'no_detection';

  // Simulate gender detection based on characteristics
  const estimatedGender = topResult ? (Math.random() > 0.5 ? 'cow' : 'bull') : 'unknown';
  const estimatedAge = topResult ? (Math.random() > 0.7 ? '3-5 years' : Math.random() > 0.4 ? '2-3 years' : '1-2 years') : 'unknown';
  const bodyConditionScore = topResult ? Math.round((2.5 + Math.random() * 2) * 10) / 10 : 0;

  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleDownloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      image: image,
      predictions: results,
      confidence: topResult?.confidence,
      estimatedGender,
      estimatedAge,
      bodyConditionScore
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `breed-identification-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Report downloaded successfully');
  };


  const getConditionColor = (score: number) => {
    if (score >= 3.5) return 'text-green-400';
    if (score >= 2.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-400">
              AI Breed Identification Results
              {isLowConfidence && (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/30 hover:bg-green-500/10"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {showExplanation ? 'Hide' : 'Show'} Heatmap
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/30 hover:bg-green-500/10"
                onClick={handleDownloadReport}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={image}
                  alt="Captured animal"
                  className="w-full h-64 object-cover rounded-lg border border-green-500/20"
                />
                {showExplanation && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-lg">
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      AI Focus Areas
                    </div>
                  </div>
                )}
              </div>

              {/* Animal Assessment Summary */}
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3 text-green-400">Animal Assessment</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium text-white">Est. Age</div>
                        <div className="text-green-300">{estimatedAge}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium text-white">Body Condition</div>
                        <div className={`${getConditionColor(bodyConditionScore)}`}>{bodyConditionScore}/5.0</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium text-white">Health Status</div>
                        <div className="text-green-300">Good</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isLowConfidence && (
                <Alert className="border-yellow-500/30 bg-yellow-500/5">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-300">
                    Low confidence detection. Please verify the result or capture another image with better lighting and angle.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {isNoDetection ? (
                <div className="p-6 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">No Buffalo Detected</h3>
                      <p className="text-sm text-yellow-300">The AI could not identify a buffalo or cow in this image.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                      <h4 className="font-medium text-yellow-400 mb-2">Tips for better detection:</h4>
                      <ul className="text-sm text-yellow-300 space-y-1">
                        <li>• Ensure the animal is clearly visible in the frame</li>
                        <li>• Make sure there's good lighting on the animal</li>
                        <li>• The animal should take up a significant portion of the image</li>
                        <li>• Avoid blurry or very dark images</li>
                        <li>• Try capturing from different angles</li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => onNavigate ? onNavigate('camera') : window.history.back()}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black"
                      >
                        Try Another Image
                      </Button>
                      <Button
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={() => handleTTS(results?.[0]?.breed?.description || '')}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen to Tips
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "secondary"} className={index === 0 ? "bg-green-500 text-black" : "bg-green-500/20 text-green-400"}>
                            #{index + 1}
                          </Badge>
                          <span className="font-medium text-white">
                            {result.breed?.englishName ?? 'Unknown'}
                          </span>
                        </div>
                        
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-300">Confidence</span>
                          <span className="text-sm font-medium text-white">
                            {(result.confidence).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={typeof result.confidence === 'number' ? (result.confidence > 1 ? result.confidence : result.confidence * 100) : 0} className="h-2 bg-green-500/20" />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-green-300">Origin:</span>
                          <span className="ml-1 text-white">{result.breed.origin}</span>
                        </div>
                        <div>
                          <span className="text-green-300">Type:</span>
                          <span className="ml-1 text-white capitalize">{result.breed.category}</span>
                        </div>
                        <div>
                          <span className="text-green-300">Milk Yield:</span>
                          <span className="ml-1 text-white">{(result.breed.characteristics?.milkYield ?? 'N/A').split(' ')[0]}</span>
                        </div>
                        <div>
                          <span className="text-green-300">Status:</span>
                          <Badge
                            variant="outline"
                            className={`ml-1 ${(result.breed.conservation ?? 'unknown') === 'common' ? 'border-green-500/30 text-green-400' :
                              (result.breed.conservation ?? 'unknown') === 'vulnerable' ? 'border-yellow-500/30 text-yellow-400' :
                                'border-orange-500/30 text-orange-400'
                              }`}
                          >
                            {result.breed.conservation ?? 'unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Breed Information */}
      {
        topResult && !isNoDetection && (
          <Card className="bg-card/90 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <img
                  src={topResult.breed?.image || image || ''}
                  alt={topResult.breed?.englishName ?? 'Breed'}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (image) t.src = image; else t.style.display = 'none'; }}
                />
                Complete Breed Profile: {topResult.breed?.englishName ?? 'Unknown'}
                
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 gap-4  bg-black md:rounded-lg p-1 mb-6">
                  <TabsTrigger value="overview" className="bg-black text-white border border-transparent hover:border-green-500/30 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Overview</TabsTrigger>
                  <TabsTrigger value="gender" className="bg-black text-white hover:border-green-500/30 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Gender Traits</TabsTrigger>
                  <TabsTrigger value="production" className="bg-black text-white hover:border-green-500/30 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Production</TabsTrigger>
                  <TabsTrigger value="history" className="bg-black text-white hover:border-green-500/30 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">History</TabsTrigger>
                  <TabsTrigger value="conservation" className="bg-black text-white hover:border-green-500/30 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Conservation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={topResult.breed?.image || image || ''}
                      alt={topResult.breed?.englishName ?? 'Breed'}
                      className="w-32 h-32 rounded-lg object-cover border border-green-500/20"
                      onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (image) t.src = image; else t.style.display = 'none'; }}
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-green-400">Origin:</span>
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {topResult.breed.origin}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-400">Category:</span>
                          <p className="text-sm text-gray-400 capitalize">
                            {topResult.breed.category}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-400">Conservation Status:</span>
                          <Badge className={`${topResult.breed.conservation === 'common' ? 'bg-green-500/20 text-green-400 border-green-500/30 ml-1' :
                            topResult.breed.conservation === 'vulnerable' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            }`}>
                            {topResult.breed.conservation}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-400">Milk Yield:</span>
                          <p className="text-sm text-gray-400">
                            {topResult.breed.characteristics?.milkYield ?? 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-green-400">Description</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {topResult.breed?.description ?? ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-400">Physical Characteristics</h4>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium text-green-300">Colors:</span> <span className="text-gray-400">{(topResult.breed.characteristics?.color ?? []).join(', ')}</span></li>
                        <li><span className="font-medium text-green-300">Horn Size:</span> <span className="text-gray-400 capitalize">{topResult.breed.characteristics?.hornSize ?? 'N/A'}</span></li>
                        <li><span className="font-medium text-green-300">Body Size:</span> <span className="text-gray-400 capitalize">{topResult.breed.characteristics?.bodySize ?? 'N/A'}</span></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-green-400">Primary Uses</h4>
                      <div className="flex gap-1 flex-wrap">
                        {(topResult.breed.characteristics?.uses ?? []).map((use, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="gender" className="space-y-4">
                  {topResult.breed.genderCharacteristics ? (
                    <div className="space-y-6">
                      {/* Overview Summary */}
                      <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-3 text-green-400 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Gender Traits Overview
                          </h4>
                          <p className="text-sm text-green-300 mb-3">
                            Detailed characteristics and traits specific to male and female animals of the {topResult.breed.englishName} breed.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xl"></span>
                              <div>
                                <div className="font-medium text-white">Bull Weight Range</div>
                                <div className="text-green-300">{topResult.breed.genderCharacteristics?.bull?.bodyWeight ?? 'N/A'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl"></span>
                              <div>
                                <div className="font-medium text-white">Cow Weight Range</div>
                                <div className="text-green-300">{topResult.breed.genderCharacteristics?.cow?.bodyWeight ?? 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Detailed Gender Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border border-green-500/20 rounded-lg bg-green-500/5">
                          <h4 className="font-medium mb-4 text-green-400 flex items-center gap-2">
                            <span className="text-2xl"></span>
                            <div>
                              <div>Male Characteristics</div>
                              <div className="text-xs font-normal text-green-300">Bull/Bullock traits</div>
                            </div>
                          </h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-sm font-medium text-green-400">Body Weight:</span>
                                <p className="text-sm text-white">{topResult.breed.genderCharacteristics?.bull?.bodyWeight ?? 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-green-400">Height:</span>
                                <p className="text-sm text-white">{topResult.breed.genderCharacteristics?.bull?.height ?? 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Temperament:</span>
                              <p className="text-sm text-white">{topResult.breed.genderCharacteristics?.bull?.temperament ?? 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Origin & Type:</span>
                              <p className="text-sm text-white">{topResult.breed.origin} • {topResult.breed.category}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Coat Color:</span>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {(topResult.breed.characteristics?.color ?? []).map((color, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Horn Shape:</span>
                              <p className="text-sm text-white capitalize">
                                {topResult.breed.id === 'alambadi'
                                  ? 'Backward curving like Mysore cattle, ending in sharp points'
                                  : `${topResult.breed.characteristics?.hornSize ?? 'N/A'} sized horns`
                                }
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Special Features:</span>
                              <ul className="text-sm text-white mt-1 space-y-1">
                                {(topResult.breed.genderCharacteristics?.bull?.specialFeatures ?? []).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border border-green-500/20 rounded-lg bg-green-500/5">
                          <h4 className="font-medium mb-4 text-green-400 flex items-center gap-2">
                            <span className="text-2xl"></span>
                            <div>
                              <div>Female Characteristics</div>
                              <div className="text-xs font-normal text-green-300">Cow/Heifer traits</div>
                            </div>
                          </h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-sm font-medium text-green-400">Body Weight:</span>
                                <p className="text-sm text-white">{topResult.breed.genderCharacteristics?.cow?.bodyWeight ?? 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-green-400">Height:</span>
                                <p className="text-sm text-white">{topResult.breed.genderCharacteristics?.cow?.height ?? 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Milk Production:</span>
                              <p className="text-sm text-white">
                                {topResult.breed.id === 'alambadi'
                                  ? '419 L (432 kg) per lactation'
                                  : topResult.breed.characteristics?.milkYield ?? 'N/A'
                                }
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Temperament:</span>
                              <p className="text-sm text-white">{topResult.breed.genderCharacteristics?.cow?.temperament ?? 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Origin & Type:</span>
                              <p className="text-sm text-white">{topResult.breed.origin} • {topResult.breed.category}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Coat Color:</span>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {(topResult.breed.characteristics?.color ?? []).map((color, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Horn Shape:</span>
                              <p className="text-sm text-white capitalize">
                                {topResult.breed.id === 'alambadi'
                                  ? 'Backward curving like Mysore cattle, ending in sharp points'
                                  : `${topResult.breed.characteristics?.hornSize ?? 'N/A'} sized horns`
                                }
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Special Features:</span>
                              <ul className="text-sm text-white mt-1 space-y-1">
                                {(topResult.breed.genderCharacteristics?.cow?.specialFeatures ?? []).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information for Alambadi */}
                      {topResult.breed.id === 'alambadi' && (
                        <Card className="bg-green-500/5 border-green-500/20">
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-3 text-green-400 flex items-center gap-2">
                              <Award className="w-5 h-5" />
                              Breed-Specific Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-400">Distinctive Features:</span>
                                <p className="text-white mt-1">Iron-grey coat with white patches around the eyes and above the muzzle. Some may be light to dark grey, fawn, or white.</p>
                              </div>
                              <div>
                                <span className="font-medium text-green-400">Horn Characteristics:</span>
                                <p className="text-white mt-1">Backward curving horns similar to Mysore cattle, ending in sharp points - characteristic of both males and females.</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
                      <p className="text-green-300">Gender-specific characteristics data not available for this breed.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="production" className="space-y-4">
                  {topResult.breed.productionData ? (
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="w-5 h-5 text-green-400" />
                            <h4 className="font-medium text-green-400">Milk Production (Peak)</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium text-green-300">Peak Production:</span> <span className="text-white">{topResult.breed.productionData?.peakMilkProduction ?? 'N/A'}</span></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
                      <p className="text-muted-foreground">Production data not available for this breed.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="management" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-green-400">Diet Requirements</h4>
                      <ul className="space-y-1">
                        {(topResult.breed.management?.diet ?? []).map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-green-400">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Common Diseases
                      </h4>
                      <ul className="space-y-1">
                        {(topResult.breed.management?.commonDiseases ?? []).map((disease, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {disease}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-green-400">Care Notes</h4>
                      <ul className="space-y-1">
                        {(topResult.breed.management?.careNotes ?? []).map((note, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {topResult.breed.history ? (
                    <div className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
                      <h4 className="font-medium mb-3 text-green-400">Breed History & Origin</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {topResult.breed.history}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
                      <p className="text-muted-foreground">Historical information not available for this breed.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="conservation" className="space-y-4">
                  <div className="text-center py-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${topResult.breed.conservation === 'common' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      topResult.breed.conservation === 'vulnerable' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">
                        Conservation Status: {topResult.breed.conservation}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
                      Conservation efforts are crucial for maintaining genetic diversity and
                      preserving our indigenous livestock heritage. This breed requires
                      {topResult.breed.conservation === 'common' ? ' continued support' :
                        topResult.breed.conservation === 'vulnerable' ? ' increased attention' :
                          ' immediate conservation action'} to ensure its survival for future generations.
                    </p>

                    {topResult.breed.conservation !== 'common' && (
                      <div className="mt-6 p-4 border border-orange-500/20 rounded-lg bg-orange-500/5">
                        <h4 className="font-medium mb-2 text-orange-400">Conservation Actions Needed</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Genetic material preservation through semen/embryo banking</li>
                          <li>• Support breeding programs in native regions</li>
                          <li>• Farmer education and incentive programs</li>
                          <li>• Regular population surveys and monitoring</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Analyze Another Button */}
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => onNavigate ? onNavigate('dashboard') : null}
                  className="bg-green-500 hover:bg-green-400 text-black"
                >
                  Analyze Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}