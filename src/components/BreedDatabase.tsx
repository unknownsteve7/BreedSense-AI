import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Filter, MapPin, Volume2, Heart, AlertTriangle, Info, Sliders, Users, Shield, Scale } from 'lucide-react';
import type { BreedInfo } from '../types';
import { getBuffaloBreeds, getBuffaloBreedDetail } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

export function BreedDatabase() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conservationFilter, setConservationFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [milkStatusFilter, setMilkStatusFilter] = useState<string>('all');
  const [categorizationFilter, setCategorizationFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [hornFilter, setHornFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [popularityFilter, setPopularityFilter] = useState<string>('all');
  const [_, setSelectedBreed] = useState<BreedInfo | null>(null);
  const [breeds, setBreeds] = useState<BreedInfo[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadBreeds() {
      try {
        const names = await getBuffaloBreeds();
        // try to fetch detailed info for each breed name
        const details = await Promise.all(names.map(async (name) => {
          try {
            const detail = await getBuffaloBreedDetail(name);
            return detail as BreedInfo;
          } catch (e) {
            // fallback minimal shape
            return {
              id: name,
              name,
              englishName: name,
              category: 'buffalo',
              origin: 'Unknown',
              characteristics: { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] },
              conservation: 'common',
              description: '',
              management: { diet: [], commonDiseases: [], careNotes: [] },
              image: '',
            } as BreedInfo;
          }
        }));

        if (mounted) setBreeds(details);
      } catch (err) {
        console.warn('Failed to load breeds', err);
        if (mounted) setBreeds([]);
      }
    }

    loadBreeds();
    return () => { mounted = false; };
  }, []);

  const filteredBreeds = useMemo(() => {
    return breeds.filter(breed => {
      const matchesSearch = breed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breed.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breed.origin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || breed.category === categoryFilter;
      const matchesConservation = conservationFilter === 'all' || breed.conservation === conservationFilter;
      const matchesOrigin = originFilter === 'all' || breed.origin === originFilter;

      // Milk status filter
      const matchesMilkStatus = milkStatusFilter === 'all' ||
        (milkStatusFilter === 'high' && parseInt(breed.characteristics.milkYield.split('-')[1]) > 2000) ||
        (milkStatusFilter === 'medium' && parseInt(breed.characteristics.milkYield.split('-')[1]) >= 1000 && parseInt(breed.characteristics.milkYield.split('-')[1]) <= 2000) ||
        (milkStatusFilter === 'low' && parseInt(breed.characteristics.milkYield.split('-')[1]) < 1000);

      // Categorization filter (indigenous vs crossbred)
      const matchesCategorization = categorizationFilter === 'all' ||
        (categorizationFilter === 'indigenous' && !breed.englishName.toLowerCase().includes('cross')) ||
        (categorizationFilter === 'crossbred' && breed.englishName.toLowerCase().includes('cross'));

      // Size filter
      const matchesSize = sizeFilter === 'all' || breed.characteristics.bodySize === sizeFilter;

      // Horn filter
      const matchesHorn = hornFilter === 'all' ||
        (hornFilter === 'horned' && breed.characteristics.hornSize !== 'polled') ||
        (hornFilter === 'polled' && breed.characteristics.hornSize === 'polled');

      // Color filter
      const matchesColor = colorFilter === 'all' ||
        breed.characteristics.color.some(color =>
          color.toLowerCase().includes(colorFilter.toLowerCase())
        );

      return matchesSearch && matchesCategory && matchesConservation && matchesOrigin &&
        matchesMilkStatus && matchesCategorization && matchesSize && matchesHorn && matchesColor;
    });
  }, [breeds, searchTerm, categoryFilter, conservationFilter, originFilter, milkStatusFilter,
    categorizationFilter, sizeFilter, hornFilter, colorFilter]);
  const uniqueOrigins = [...new Set(breeds.map(breed => breed.origin))];
  const uniqueColors = [...new Set(breeds.flatMap(breed => breed.characteristics?.color || []))];

  // Calculate statistics
  const totalBreeds = breeds.length;
  const cattleCount = breeds.filter(breed => breed.category === 'cattle').length;
  const buffaloCount = breeds.filter(breed => breed.category === 'buffalo').length;
  const indigenousCount = breeds.filter(breed => !breed.englishName.toLowerCase().includes('cross')).length;

  const getConservationColor = (status: string) => {
    switch (status) {
      case 'common': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'vulnerable': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'endangered': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'extinct': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getMilkYieldIcon = (milkYield: string) => {
    const maxYield = parseInt(milkYield.split('-')[1]);
    if (maxYield >= 2000) return '🥛';
    if (maxYield >= 1500) return '🥛';
    return '🥛';
  };

  const getBodyWeightRange = (bodySize: string) => {
    switch (bodySize) {
      case 'small': return '300-400 kg';
      case 'medium': return '400-500 kg';
      case 'large': return '500-600 kg';
      default: return '400-500 kg';
    }
  };

  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-900/20 to-green-800/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Heart className="w-5 h-5 text-green-500" />
            {t('breeds.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('breeds.subtitle')}
          </p>
        </CardHeader>
      </Card>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{totalBreeds}</div>
            <div className="text-sm text-muted-foreground">Total Breeds</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="text-xl">🐄</div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{cattleCount}</div>
            <div className="text-sm text-muted-foreground">Cattle Breeds</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="text-lg">🐃</div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{buffaloCount}</div>
            <div className="text-sm text-muted-foreground">Buffalo Breeds</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{indigenousCount}</div>
            <div className="text-sm text-muted-foreground">Indigenous</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card/50 border-green-500/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
              <Input
                placeholder={t('breeds.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-green-500/30 focus:border-green-500 text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter Section */}
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-400">Search & Filter Breeds</span>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allCategories')}</SelectItem>
                  <SelectItem value="cattle">{t('filter.cattle')}</SelectItem>
                  <SelectItem value="buffalo">{t('filter.buffalo')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="All Origins" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allOrigins')}</SelectItem>
                  {uniqueOrigins.map(origin => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={milkStatusFilter} onValueChange={setMilkStatusFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="Milk Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allMilkStatus')}</SelectItem>
                  <SelectItem value="high">{t('filter.highMilk')}</SelectItem>
                  <SelectItem value="medium">{t('filter.mediumMilk')}</SelectItem>
                  <SelectItem value="low">{t('filter.lowMilk')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categorizationFilter} onValueChange={setCategorizationFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="Categorization" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allCategorization')}</SelectItem>
                  <SelectItem value="indigenous">{t('filter.indigenous')}</SelectItem>
                  <SelectItem value="crossbred">{t('filter.crossbred')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allSizes')}</SelectItem>
                  <SelectItem value="small">{t('filter.small')}</SelectItem>
                  <SelectItem value="medium">{t('filter.medium')}</SelectItem>
                  <SelectItem value="large">{t('filter.large')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={hornFilter} onValueChange={setHornFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="All Horns" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allHorns')}</SelectItem>
                  <SelectItem value="horned">{t('filter.horned')}</SelectItem>
                  <SelectItem value="polled">{t('filter.polled')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="All Colors" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.allColors')}</SelectItem>
                  {uniqueColors.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={popularityFilter} onValueChange={setPopularityFilter}>
                <SelectTrigger className="bg-muted/50 border-green-500/30 hover:border-green-500/50">
                  <SelectValue placeholder="Popularity" />
                </SelectTrigger>
                <SelectContent className="bg-card border-green-500/30">
                  <SelectItem value="all">{t('filter.popularity')}</SelectItem>
                  <SelectItem value="most">{t('filter.mostPopular')}</SelectItem>
                  <SelectItem value="least">{t('filter.leastPopular')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary and Clear Filters */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-green-400">
                {t('breeds.showing')} {filteredBreeds.length} {t('breeds.of')} {totalBreeds} breeds
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setConservationFilter('all');
                  setOriginFilter('all');
                  setMilkStatusFilter('all');
                  setCategorizationFilter('all');
                  setSizeFilter('all');
                  setHornFilter('all');
                  setColorFilter('all');
                  setPopularityFilter('all');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('breeds.clearFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBreeds.map((breed) => (
          <Card key={breed.id} className="bg-card/90 border-green-500/20 hover:border-green-500/40 hover:bg-card transition-all duration-200 shadow-md hover:shadow-lg">
            <CardContent className="p-6">
              {/* Header with image and location */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-2xl">
                    {breed.category === 'cattle' ? '🐄' : '🐃'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{breed.englishName}</h3>
                    <Badge
                      variant="secondary"
                      className={getConservationColor(breed.conservation)}
                    >
                      {breed.conservation === 'common' ? 'Least Concern' :
                        breed.conservation === 'vulnerable' ? 'Vulnerable' : breed.conservation}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-300">
                    <MapPin className="w-3 h-3" />
                    {breed.origin}
                  </div>
                </div>
              </div>

              {/* Category Badges */}
              <div className="flex gap-2 mb-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                  Indigenous
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 capitalize">
                  {breed.category}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {breed.category === 'cattle'
                  ? `Excellent dairy breed known for high milk production and disease resistance. Known for heat tolerance and gentle temperament.`
                  : `Premium buffalo breed famous for high milk yield and adaptability to various climatic conditions. Excellent meat quality.`
                }
              </p>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-lg">{getMilkYieldIcon(breed.characteristics.milkYield)}</div>
                  <div>
                    <div className="text-sm font-medium text-white">Milk Yield</div>
                    <div className="text-xs text-green-300">{breed.characteristics.milkYield.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Body Weight</div>
                    <div className="text-xs text-green-300">{getBodyWeightRange(breed.characteristics.bodySize)}</div>
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="mb-4">
                <div className="text-sm font-medium text-white mb-2">Color</div>
                <div className="text-sm text-green-300">
                  {breed.characteristics.color.length > 0 ? breed.characteristics.color[0] : 'Mixed'}
                </div>
              </div>

              {/* Key Characteristics */}
              <div className="mb-4">
                <div className="text-sm font-medium text-white mb-2">Key Characteristics</div>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                    Heat tolerant
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                    Disease resistant
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                    Good grazer
                  </Badge>
                  {breed.conservation === 'vulnerable' && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                      Hardy
                    </Badge>
                  )}
                </div>
              </div>

              {/* View Details Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50"
                    onClick={() => setSelectedBreed(breed)}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    {t('breeds.viewDetails')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-green-500/30">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-green-400">
                      <img
                        src={breed.image}
                        alt={breed.englishName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div>{breed.name}</div>
                        <div className="text-base font-normal text-muted-foreground">
                          {breed.englishName}
                        </div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Overview</TabsTrigger>
                      <TabsTrigger value="characteristics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Characteristics</TabsTrigger>
                      <TabsTrigger value="management" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Management</TabsTrigger>
                      <TabsTrigger value="conservation" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Conservation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={breed.image}
                          alt={breed.englishName}
                          className="w-32 h-32 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className="text-sm font-medium text-green-400">Origin:</span>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {breed.origin}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Category:</span>
                              <p className="text-sm text-muted-foreground capitalize">
                                {breed.category}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Conservation Status:</span>
                              <Badge className={getConservationColor(breed.conservation)}>
                                {breed.conservation}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Milk Yield:</span>
                              <p className="text-sm text-muted-foreground">
                                {breed.characteristics.milkYield}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2 text-green-400">
                          Description
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTTS(breed.description)}
                            className="hover:bg-green-500/20"
                          >
                            <Volume2 className="w-4 h-4 text-green-500" />
                          </Button>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {breed.description}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="characteristics" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-green-400">Physical Characteristics</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-green-400">Colors:</span>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {breed.characteristics.color.map((color, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Horn Size:</span>
                              <Badge variant="secondary" className="ml-2 capitalize bg-green-500/20 text-green-400">
                                {breed.characteristics.hornSize}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-400">Body Size:</span>
                              <Badge variant="secondary" className="ml-2 capitalize bg-green-500/20 text-green-400">
                                {breed.characteristics.bodySize}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-green-400">Uses & Applications</h4>
                          <div className="flex gap-1 flex-wrap">
                            {breed.characteristics.uses.map((use, idx) => (
                              <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                {use}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="management" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-green-400">Diet Requirements</h4>
                          <ul className="space-y-1">
                            {breed.management.diet.map((item, idx) => (
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
                            {breed.management.commonDiseases.map((disease, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {disease}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-green-400">Care Notes</h4>
                          <ul className="space-y-1">
                            {breed.management.careNotes.map((note, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="conservation" className="space-y-4">
                      <div className="text-center py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getConservationColor(breed.conservation)}`}>
                          <Heart className="w-5 h-5" />
                          <span className="font-medium">
                            Conservation Status: {breed.conservation}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
                          Conservation efforts are crucial for maintaining genetic diversity and
                          preserving our indigenous livestock heritage. This breed requires
                          {breed.conservation === 'common' ? ' continued support' :
                            breed.conservation === 'vulnerable' ? ' increased attention' :
                              ' immediate conservation action'} to ensure its survival for future generations.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBreeds.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
          <h3 className="text-lg font-medium mb-2 text-green-400">{t('breeds.noResults')}</h3>
          <p className="text-muted-foreground">
            {t('breeds.adjustFilters')}
          </p>
        </div>
      )}
    </div>
  );
}