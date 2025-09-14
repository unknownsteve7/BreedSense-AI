import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
// Alert components are not used in this file currently
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  FileText,
  Send,
  Download,
  MapPin,
  Users,
  AlertTriangle,
  Calendar as CalendarIcon,
  Plus,
  Eye
} from 'lucide-react';
import type { FLWReport } from '../types';
import { toast } from 'sonner';
import { loadIdentifications } from '../utils/storage';

const fallbackBreedList = [
  { id: 'gir', name: 'Gir', englishName: 'Gir', image: '' },
  { id: 'sahiwal', name: 'Sahiwal', englishName: 'Sahiwal', image: '' },
  { id: 'murrah', name: 'Murrah', englishName: 'Murrah', image: '' },
  { id: 'crossbred', name: 'Crossbred', englishName: 'Crossbred', image: '' }
];
import { format } from 'date-fns';

export function FLWReporting() {
  const [activeTab, setActiveTab] = useState('create');
  const [reportData, setReportData] = useState({
    district: '',
    block: '',
    village: '',
    date: new Date(),
    animalCounts: {} as Record<string, number>,
    healthFlags: [] as string[],
    notes: '',
    selectedIdentifications: [] as string[]
  });

  const [savedReports, setSavedReports] = useState<FLWReport[]>([]);

  const healthOptions = [
    'Heat stress observed',
    'Parasitic infection signs',
    'Malnutrition indicators',
    'Reproductive health issues',
    'Need vaccination camp',
    'Feed quality concerns',
    'Water scarcity',
    'Disease outbreak risk'
  ];

  const handleBreedCountChange = (breedId: string, count: number) => {
    setReportData(prev => ({
      ...prev,
      animalCounts: {
        ...prev.animalCounts,
        [breedId]: count || 0
      }
    }));
  };

  const handleHealthFlagToggle = (flag: string, checked: boolean) => {
    setReportData(prev => ({
      ...prev,
      healthFlags: checked
        ? [...prev.healthFlags, flag]
        : prev.healthFlags.filter(f => f !== flag)
    }));
  };

  const handleIdentificationToggle = (identificationId: string, checked: boolean) => {
    setReportData(prev => ({
      ...prev,
      selectedIdentifications: checked
        ? [...prev.selectedIdentifications, identificationId]
        : prev.selectedIdentifications.filter(id => id !== identificationId)
    }));
  };

  const persisted = loadIdentifications();

  const submitReport = () => {
    if (!reportData.district || !reportData.block || !reportData.village) {
      toast.error('Please fill in all location details');
      return;
    }

    const newReport: FLWReport = {
      id: Date.now().toString(),
      flwId: 'FLW001',
      flwName: 'राम कुमार',
      district: reportData.district,
      block: reportData.block,
      village: reportData.village,
      timestamp: reportData.date,
      animalCounts: reportData.animalCounts,
      healthFlags: reportData.healthFlags,
      notes: reportData.notes,
      identifications: persisted
        .filter(id => reportData.selectedIdentifications.includes(`local-${id.id}`))
        .map(id => ({
          id: `local-${id.id}`,
          image: id.imagePath || '',
          timestamp: new Date(id.timestamp),
          results: [{
            breed: {
              id: id.prediction,
              name: id.prediction,
              englishName: id.prediction,
              category: 'buffalo',
              origin: '',
              characteristics: { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] },
              conservation: 'common',
              description: '',
              management: { diet: [], commonDiseases: [], careNotes: [] },
              image: ''
            } as any,
            confidence: id.confidence || 0
          }]
        } as any))
    };

    setSavedReports(prev => [newReport, ...prev]);

    // Reset form
    setReportData({
      district: '',
      block: '',
      village: '',
      date: new Date(),
      animalCounts: {},
      healthFlags: [],
      notes: '',
      selectedIdentifications: []
    });

    toast.success('Report submitted successfully!');
    setActiveTab('history');
  };

  const downloadReport = (report: FLWReport) => {
    const reportDoc = {
      ...report,
      generatedOn: new Date().toISOString(),
      totalAnimals: Object.values(report.animalCounts).reduce((sum, count) => sum + count, 0)
    };

    const dataStr = JSON.stringify(reportDoc, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `flw-report-${report.district}-${format(report.timestamp, 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Report downloaded successfully');
  };

  const sendToBPA = (_report: FLWReport) => {
    // Mock API call to BPA integration (not used in build)
    setTimeout(() => {
      toast.success('Report sent to Bharat Pashudhan App successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <FileText className="w-5 h-5 text-green-500" />
            Field Level Worker Reporting System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and manage livestock reports for submission to higher authorities
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="create" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Create Report</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Report History</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              {/* Location Information */}
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">District *</label>
                      <Select
                        value={reportData.district}
                        onValueChange={(value: string) => setReportData(prev => ({ ...prev, district: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                          <SelectItem value="Faridabad">Faridabad</SelectItem>
                          <SelectItem value="Hisar">Hisar</SelectItem>
                          <SelectItem value="Karnal">Karnal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Block *</label>
                      <Select
                        value={reportData.block}
                        onValueChange={(value: string) => setReportData(prev => ({ ...prev, block: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sohna">Sohna</SelectItem>
                          <SelectItem value="Manesar">Manesar</SelectItem>
                          <SelectItem value="Pataudi">Pataudi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Village *</label>
                      <Input
                        placeholder="Enter village name"
                        value={reportData.village}
                        onChange={(e) => setReportData(prev => ({ ...prev, village: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Report Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {format(reportData.date, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={reportData.date}
                          onSelect={(date: Date | undefined) => date && setReportData(prev => ({ ...prev, date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Animal Count */}
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                    <Users className="w-4 h-4 text-green-500" />
                    Animal Count by Breed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fallbackBreedList.map((breed) => (
                      <div key={breed.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img
                          src={breed.image}
                          alt={breed.englishName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{breed.name}</p>
                          <p className="text-xs text-muted-foreground">{breed.englishName}</p>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-20"
                          value={reportData.animalCounts[breed.id] || ''}
                          onChange={(e) => handleBreedCountChange(breed.id, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">
                      Total Animals: {Object.values(reportData.animalCounts).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Health Flags */}
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Health & Welfare Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {healthOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={reportData.healthFlags.includes(option)}
                          onCheckedChange={(checked: boolean) => handleHealthFlagToggle(option, checked)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Identification Records */}
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                    <Eye className="w-4 h-4 text-green-500" />
                    Include Identification Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {persisted.map((identification) => (
                      <label key={`local-${identification.id}`} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
                        <Checkbox
                          checked={reportData.selectedIdentifications.includes(`local-${identification.id}`)}
                          onCheckedChange={(checked: boolean) => handleIdentificationToggle(`local-${identification.id}`, checked)}
                        />
                        <img
                          src={identification.imagePath}
                          alt="Identified animal"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {identification.prediction} - {format(new Date(identification.timestamp), 'PP')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confidence: {Math.round((identification.confidence || 0) * 100)}%
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add any additional observations, recommendations, or notes..."
                    rows={4}
                    value={reportData.notes}
                    onChange={(e) => setReportData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </CardContent>
              </Card>

              {/* Submit Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setReportData({
                    district: '',
                    block: '',
                    village: '',
                    date: new Date(),
                    animalCounts: {},
                    healthFlags: [],
                    notes: '',
                    selectedIdentifications: []
                  });
                }}>
                  Clear Form
                </Button>
                <Button onClick={submitReport} className="min-w-32 bg-green-500 hover:bg-green-600 text-black">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {savedReports.map((report) => (
                <Card key={report.id} className="bg-card/50 border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{report.village}, {report.block}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(report.timestamp, 'PPP')} • by {report.flwName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => sendToBPA(report)}
                          className="bg-green-500 hover:bg-green-600 text-black"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send to BPA
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium">Total Animals:</span>
                        <p className="text-2xl font-bold text-primary">
                          {Object.values(report.animalCounts).reduce((sum, count) => sum + count, 0)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Breeds Recorded:</span>
                        <p className="text-2xl font-bold text-primary">
                          {Object.keys(report.animalCounts).length}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Health Flags:</span>
                        <p className="text-2xl font-bold text-primary">
                          {report.healthFlags.length}
                        </p>
                      </div>
                    </div>

                    {report.healthFlags.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium">Health Concerns:</span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {report.healthFlags.map((flag, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.notes && (
                      <div>
                        <span className="text-sm font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{report.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {savedReports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first report to get started
                  </p>
                  <Button onClick={() => setActiveTab('create')} className="bg-green-500 hover:bg-green-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              )}
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}