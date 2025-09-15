import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.camera': 'Camera',
    'nav.video': 'Video Analysis',
    'nav.breeds': 'Breed Database',
    'nav.reports': 'FLW Reports',
    'nav.contacts': 'Contacts',
    'nav.history': 'History',

    // Dashboard
    'dashboard.welcome': 'Welcome to AI Cattle & Buffalo Recognition',
    'dashboard.subtitle': 'Smart India Hackathon 2025 • Empowering Field Level Workers with AI Technology',
    'dashboard.systemActive': 'System Active',
    'dashboard.totalIdentifications': 'Total Identifications',
    'dashboard.accuracyRate': 'Model Accuracy Rate',
    'dashboard.totalAnimals': 'Total Animals',
    'dashboard.avgConfidence': 'Avg Confidence',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.breedDistribution': 'Breed Distribution',
    'dashboard.systemStatus': 'System Status',

    // Quick Actions
    'actions.captureImage': 'Capture Image',
    'actions.captureImageDesc': 'Take photo and identify breed',
    'actions.processVideo': 'Process Video',
    'actions.processVideoDesc': 'Upload and analyze video',
    'actions.browseBreds': 'Browse Breeds',
    'actions.browseBredsDesc': 'Explore breed database',
    'actions.createReport': 'Create Report',
    'actions.createReportDesc': 'Generate FLW report',

    // Camera
    'camera.title': 'Camera Capture',
    'camera.startCamera': 'Start Camera',
    'camera.stopCamera': 'Stop Camera',
    'camera.capture': 'Capture',
    'camera.flip': 'Flip',
    'camera.flash': 'Flash',
    'camera.upload': 'Upload',
    'camera.live': 'Live',
    'camera.guidance': 'Position animal within frame',
    'camera.formats': 'Supported formats: JPG, PNG, BMP, WebP, HEIC',
    'camera.tips': 'For best results, ensure good lighting and clear view of the animal',

    // Breed Database
    'breeds.title': 'Indigenous Cattle & Buffalo Breed Database',
    'breeds.subtitle': 'Comprehensive database of Indian cattle and buffalo breeds with detailed information',
    'breeds.search': 'Search breeds...',
    'breeds.viewDetails': 'View Details',
    'breeds.clearFilters': 'Clear Filters',
    'breeds.showing': 'Showing',
    'breeds.of': 'of',
    'breeds.noResults': 'No breeds found',
    'breeds.adjustFilters': 'Try adjusting your search terms or filters',

    // Breed Filters
    'filter.allCategories': 'All Categories',
    'filter.allOrigins': 'All Origins',
    'filter.allMilkStatus': 'All Milk Status',
    'filter.allCategorization': 'All Classifications',
    'filter.allSizes': 'All Sizes',
    'filter.allHorns': 'All Horn Types',
    'filter.allColors': 'All Colors',
    'filter.popularity': 'Popularity',
    'filter.cattle': 'Cattle',
    'filter.buffalo': 'Buffalo',
    'filter.highMilk': 'High Milk Yield',
    'filter.mediumMilk': 'Medium Milk Yield',
    'filter.lowMilk': 'Low Milk Yield',
    'filter.indigenous': 'Indigenous',
    'filter.crossbred': 'Crossbred',
    'filter.exotic': 'Exotic',
    'filter.small': 'Small',
    'filter.medium': 'Medium',
    'filter.large': 'Large',
    'filter.horned': 'Horned',
    'filter.polled': 'Polled',
    'filter.mostPopular': 'Most Popular',
    'filter.leastPopular': 'Least Popular',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.language': 'Language'
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.camera': 'कैमरा',
    'nav.video': 'वीडियो विश्लेषण',
    'nav.breeds': 'नस्ल डेटाबेस',
    'nav.reports': 'FLW रिपोर्ट',
    'nav.contacts': 'संपर्क',
    'nav.history': 'इतिहास',

    // Dashboard
    'dashboard.welcome': 'AI गो-भैंस पहचान में आपका स्वागत है',
    'dashboard.subtitle': 'स्मार्ट इंडिया हैकाथॉन 2025 • AI तकनीक के साथ फील्ड लेवल वर्कर्स को सशक्त बनाना',
    'dashboard.systemActive': 'सिस्टम सक्रिय',
    'dashboard.totalIdentifications': 'कुल पहचान',
    'dashboard.accuracyRate': 'सटीकता दर',
    'dashboard.totalAnimals': 'कुल पशु',
    'dashboard.avgConfidence': 'औसत विश्वास',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.recentActivity': 'हाल की गतिविधि',
    'dashboard.breedDistribution': 'नस्ल वितरण',
    'dashboard.systemStatus': 'सिस्टम स्थिति',

    // Quick Actions
    'actions.captureImage': 'तस्वीर लें',
    'actions.captureImageDesc': 'फोटो लें और नस्ल की पहचान करें',
    'actions.processVideo': 'वीडियो प्रोसेस करें',
    'actions.processVideoDesc': 'वीडियो अपलोड करें और विश्लेषण करें',
    'actions.browseBreds': 'नस्लें देखें',
    'actions.browseBredsDesc': 'नस्ल डेटाबेस का अन्वेषण करें',
    'actions.createReport': 'रिपोर्ट बनाएं',
    'actions.createReportDesc': 'FLW रिपोर्ट तैयार करें',

    // Camera
    'camera.title': 'कैमरा कैप्चर',
    'camera.startCamera': 'कैमरा शुरू करें',
    'camera.stopCamera': 'कैमरा बंद करें',
    'camera.capture': 'कैप्चर करें',
    'camera.flip': 'फ्लिप करें',
    'camera.flash': 'फ्लैश',
    'camera.upload': 'अपलोड करें',
    'camera.live': 'लाइव',
    'camera.guidance': 'पशु को फ्रेम के भीतर रखें',
    'camera.formats': 'समर्थित फॉर्मेट: JPG, PNG, BMP, WebP, HEIC',
    'camera.tips': 'सर्वोत्तम परिणामों के लिए, अच्छी रोशनी और पशु का स्पष्ट दृश्य सुनिश्चित करें',

    // Breed Database
    'breeds.title': 'देशी गो-भैंस नस्ल डेटाबेस',
    'breeds.subtitle': 'भारतीय गाय और भैंस की नस्लों का विस्तृत डेटाबेस',
    'breeds.search': 'नस्लें खोजें...',
    'breeds.viewDetails': 'विवरण देखें',
    'breeds.clearFilters': 'फिल्टर साफ़ करें',
    'breeds.showing': 'दिखाया जा रहा है',
    'breeds.of': 'में से',
    'breeds.noResults': 'कोई नस्ल नहीं मिली',
    'breeds.adjustFilters': 'अपने खोज शब्द या फिल्टर को समायोजित करने का प्रयास करें',

    // Breed Filters
    'filter.allCategories': 'सभी श्रेणियां',
    'filter.allOrigins': 'सभी मूल स्थान',
    'filter.allMilkStatus': 'सभी दूध स्थिति',
    'filter.allCategorization': 'सभी वर्गीकरण',
    'filter.allSizes': 'सभी आकार',
    'filter.allHorns': 'सभी सींग प्रकार',
    'filter.allColors': 'सभी रंग',
    'filter.popularity': 'लोकप्रियता',
    'filter.cattle': 'गाय',
    'filter.buffalo': 'भैंस',
    'filter.highMilk': 'उच्च दूध उत्पादन',
    'filter.mediumMilk': 'मध्यम दूध उत्पादन',
    'filter.lowMilk': 'कम दूध उत्पादन',
    'filter.indigenous': 'देशी',
    'filter.crossbred': 'संकर',
    'filter.exotic': 'विदेशी',
    'filter.small': 'छोटा',
    'filter.medium': 'मध्यम',
    'filter.large': 'बड़ा',
    'filter.horned': 'सींग वाला',
    'filter.polled': 'बिना सींग',
    'filter.mostPopular': 'सबसे लोकप्रिय',
    'filter.leastPopular': 'कम लोकप्रिय',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.download': 'डाउनलोड करें',
    'common.export': 'निर्यात करें',
    'common.import': 'आयात करें',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.clear': 'साफ़ करें',
    'common.submit': 'जमा करें',
    'common.close': 'बंद करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.language': 'भाषा'
  }
  ,
  te: {
    // Navigation
    'nav.dashboard': 'డాష్‌బోర్డు',
    'nav.camera': 'కెమెరా',
    'nav.video': 'వీడియో విశ్లేషణ',
    'nav.breeds': 'జాతి డేటాబేస్',
    'nav.reports': 'FLW రిపోర్ట్లు',
    'nav.contacts': 'సంప్రదింపులు',
    'nav.history': 'చరిత్ర',

    // Dashboard
    'dashboard.welcome': 'AI పశు గుర్తింపు కు స్వాగతం',
    'dashboard.subtitle': 'స్మార్ట్ ఇండియా హ్యాకాథాన్ 2025 • ఫీల్డ్ వర్కర్స్ కు AI తో శక్తివంతం చేయడం',
    'dashboard.systemActive': 'సిస్టమ్ యాక్టివ్',
    'dashboard.totalIdentifications': 'మొత్తం గుర్తింపులు',
    'dashboard.accuracyRate': ' ఖచ్చితత్వం రేటు',
    'dashboard.totalAnimals': 'మొత్తం జంతువులు',
    'dashboard.avgConfidence': 'సగటు నమ్మకం',
    'dashboard.quickActions': 'త్వరిత చర్యలు',
    'dashboard.recentActivity': 'ఇటీవల কার্যచరణ',
    'dashboard.breedDistribution': 'జాతి పంపిణీ',
    'dashboard.systemStatus': 'సిస్టమ్ స్థితి',

    // Quick Actions
    'actions.captureImage': 'ఫోటో తీసుకోండి',
    'actions.captureImageDesc': 'ఫోటో తీసుకుని జాతి గుర్తించండి',
    'actions.processVideo': 'వీడియో ప్రాసెస్ చేయండి',
    'actions.processVideoDesc': 'వీడియో అప్లోడ్ చేసి విశ్లేషణ చేయండి',
    'actions.browseBreds': 'జాతులను బ్రౌజ్ చేయండి',
    'actions.browseBredsDesc': 'జాతి డేటాబేస్ ను అన్వేషించండి',
    'actions.createReport': 'రిపోర్ట్ తయారు చేయండి',
    'actions.createReportDesc': 'FLW రిపోర్ట్ రూపొందించండి',

    // Camera
    'camera.title': 'కెమెరా క్యాప్చర్',
    'camera.startCamera': 'కెమెరా ప్రారంభించండి',
    'camera.stopCamera': 'కెమెరా రద్దు చేయండి',
    'camera.capture': 'క్యాప్చర్',
    'camera.flip': 'ఫ్లిప్',
    'camera.flash': 'ఫ్లాష్',
    'camera.upload': 'అప్లోడ్',
    'camera.live': 'లైవ్',
    'camera.guidance': 'జంతువును ఫ్రేమ్లో ఉంచండి',
    'camera.formats': 'సపోర్ట్ చేయబడిన ఫార్మాట్స్: JPG, PNG, BMP, WebP, HEIC',
    'camera.tips': 'ఉత్తమ ఫలితాల కోసం మంచి లైటింగ్ మరియు క్లియర్ వ్యూ ను నిర్ధారించండి',

    // Breed Database
    'breeds.title': 'దేశీయ పశు & భేద జాతి డేటాబేస్',
    'breeds.subtitle': 'భారతీయ పశు మరియు రాయల జాతుల పూర్తి సమాచార డేటాబేస్',
    'breeds.search': 'జాతులను శోధించండి...',
    'breeds.viewDetails': 'వివరాలు చూడండి',
    'breeds.clearFilters': 'ఫిల్టర్లు శుభ్రం చేయండి',
    'breeds.showing': 'దర్శిస్తోంది',
    'breeds.of': 'లోనుండి',
    'breeds.noResults': 'ఏ జాతి కనబడలేదు',
    'breeds.adjustFilters': 'దయచేసి మీ శోధన పదాలు లేదా ఫిల్టర్ మార్చి చూడండి',

    // Filters
    'filter.allCategories': 'అన్ని వర్గాలు',
    'filter.allOrigins': 'అన్ని మూలాలు',
    'filter.allMilkStatus': 'అన్ని డైరీ స్థితులు',
    'filter.allCategorization': 'అన్ని వర్గీకరణలు',
    'filter.allSizes': 'అన్ని పరిమాణాలు',
    'filter.allHorns': 'అన్ని సింహాసన రకాలు',
    'filter.allColors': 'అన్ని రంగులు',
    'filter.popularity': 'పాప్యులారిటీ',
    'filter.cattle': 'గొర్రె',
    'filter.buffalo': 'భైన',
    'filter.highMilk': 'పెద్ద పాలు ఉత్పత్తి',
    'filter.mediumMilk': 'మధ్యస్థ పాలు',
    'filter.lowMilk': 'తక్కువ పాలు',
    'filter.indigenous': 'దేశీయ',
    'filter.crossbred': 'క్రాస్‌బ్రిడ్',
    'filter.exotic': 'విదేశీ',
    'filter.small': 'చిన్నది',
    'filter.medium': 'మధ్యస్థ',
    'filter.large': 'పెద్ద',
    'filter.horned': 'సింహాసనంతో',
    'filter.polled': 'సింహాసనరహిత',
    'filter.mostPopular': 'అత్యంత పాప్యులర్',
    'filter.leastPopular': 'సర్వసన్నపుడి',

    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'దోషం',
    'common.success': 'విజయం',
    'common.cancel': 'రద్దు',
    'common.save': 'సేవ్',
    'common.delete': 'తొలగించు',
    'common.edit': 'సవరించు',
    'common.view': 'చూడండి',
    'common.download': 'డౌన్లోడ్',
    'common.export': 'ఎగుమతి',
    'common.import': 'ఆయాత్',
    'common.search': 'శోధన',
    'common.filter': 'ఫిల్టర్',
    'common.clear': 'స پاڪ్',
    'common.submit': 'సమర్పించు',
    'common.close': 'రద్దు చేయండి',
    'common.back': 'వెనుక',
    'common.next': 'తరువాత',
    'common.previous': 'మునుపటి',
    'common.language': 'భాష'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState('en'); // Default to English

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.en;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}