import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  History as HistoryIcon,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Download,
  MapPin,
  Clock,
  TrendingUp,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';
// removed mock data dependency; using persisted identifications only
import { loadIdentifications } from '../utils/storage';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date>();
  // no selected record state yet

  // Load persisted identifications from localStorage and mix with mock data
  const persisted = loadIdentifications();

  // Mock extended history data
  const historyData = [
    ...persisted.map(p => ({
      id: `local-${p.id}`,
      type: 'identification' as const,
      timestamp: new Date(p.timestamp),
      title: `${p.prediction} Identification`,
      description: `Confidence: ${(p.confidence || 0).toFixed(2)}%`,
      location: 'Local Device',
      image: p.imagePath || '',
      data: p
    })),
    // no external mock identifications included
    {
      id: 'report-1',
      type: 'report' as const,
      timestamp: new Date('2024-01-14T16:30:00'),
      title: 'Monthly Livestock Survey',
      description: '45 animals surveyed across 5 breeds',
      location: 'Village Sohna, Gurgaon',
      image: 'https://images.unsplash.com/photo-1658325501516-2c5b7ce9fa33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGZhcm1lciUyMGxpdmVzdG9ja3xlbnwxfHx8fDE3NTc3NDc5NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      data: null
    },
    {
      id: 'video-1',
      type: 'video' as const,
      timestamp: new Date('2024-01-13T11:20:00'),
      title: 'Herd Analysis Video',
      description: '8 animals detected, 3 breeds identified',
      location: 'Village Manesar, Gurgaon',
      image: 'https://images.unsplash.com/photo-1526202661503-4306bf91df05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjYXR0bGUlMjBjb3clMjBicmVlZHN8ZW58MXx8fHwxNzU3NzQ3OTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      data: null
    }
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredHistory = historyData.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || record.type === typeFilter;

    const matchesDate = !dateFilter ||
      format(record.timestamp, 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');

    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'identification': return ImageIcon;
      case 'video': return Video;
      case 'report': return FileText;
      default: return Eye;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'identification': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-green-100 text-green-800';
      case 'report': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportHistory = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: filteredHistory.length,
      records: filteredHistory.map(record => ({
        id: record.id,
        type: record.type,
        timestamp: record.timestamp.toISOString(),
        title: record.title,
        description: record.description,
        location: record.location
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `history-export-${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('History exported successfully');
  };

  // Statistics
  const stats = {
    total: historyData.length,
    identifications: historyData.filter(r => r.type === 'identification').length,
    videos: historyData.filter(r => r.type === 'video').length,
    reports: historyData.filter(r => r.type === 'report').length,
    thisWeek: historyData.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return r.timestamp >= weekAgo;
    }).length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-primary" />
            Activity History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track all your identification activities, reports, and video analyses
          </p>
        </CardHeader>
        <CardContent>
          {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.identifications}</div>
                <p className="text-xs text-muted-foreground">Identifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.videos}</div>
                <p className="text-xs text-muted-foreground">Video Analyses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.reports}</div>
                <p className="text-xs text-muted-foreground">Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                  {stats.thisWeek}
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted-foreground">This Week</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="identification">Identifications</SelectItem>
                <SelectItem value="video">Video Analysis</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-48">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateFilter ? format(dateFilter, 'PP') : 'Filter by date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setDateFilter(undefined);
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>

            <Button variant="outline" onClick={exportHistory}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredHistory.length} of {historyData.length} activities
            </p>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.map((record) => {
              const TypeIcon = getTypeIcon(record.type);
              // If this is an identification and the underlying data indicates a failure, show a red error card
              const underlying = (record as any).data as any;
              if (record.type === 'identification' && underlying?.status === 'failed') {
                return (
                  <Card key={record.id} className="border-2 border-red-700 bg-red-900 text-red-100">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={record.image}
                            alt={record.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-red-700 text-red-100">
                              <TypeIcon className="w-3 h-3 mr-1" />
                              failed
                            </Badge>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium truncate">No buffalo detected</h3>
                              <p className="text-sm text-red-100">Confidence: 0%</p>
                              {underlying.errorMessage && (
                                <p className="text-xs mt-1 text-red-200">{underlying.errorMessage}</p>
                              )}
                            </div>
                            <div className="text-right text-sm text-red-100 ml-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(record.timestamp, 'HH:mm')}
                              </div>
                              <div>{format(record.timestamp, 'MMM dd, yyyy')}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-red-100">
                              <MapPin className="w-3 h-3" />
                              {record.location}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Open record details (not implemented)')}
                                className="border-red-600 text-red-100"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* Image/Thumbnail */}
                      <div className="relative">
                        <img
                          src={record.image}
                          alt={record.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Badge className={getTypeColor(record.type)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {record.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium truncate">{record.title}</h3>
                            <p className="text-sm text-muted-foreground">{record.description}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground ml-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(record.timestamp, 'HH:mm')}
                            </div>
                            <div>{format(record.timestamp, 'MMM dd, yyyy')}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {record.location}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info('Open record details (not implemented)')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {record.type === 'identification' && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || dateFilter
                  ? 'Try adjusting your search filters'
                  : 'Start using the app to see your activity history here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}