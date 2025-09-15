export interface BreedInfo {
  id: string;
  name: string;
  englishName: string;
  category: 'cow' | 'buffalo';
  origin: string;
  characteristics: {
    color: string[];
    hornSize: 'small' | 'medium' | 'large' | 'polled';
    bodySize: 'small' | 'medium' | 'large';
    milkYield: string;
    uses: string[];
  };
  conservation: 'common' | 'vulnerable' | 'endangered' | 'extinct';
  description: string;
  management: {
    diet: string[];
    commonDiseases: string[];
    careNotes: string[];
  };
  image: string;
  history?: string;
  genderCharacteristics?: {
    bull: {
      bodyWeight: string;
      height: string;
      specialFeatures: string[];
      temperament: string;
    };
    cow: {
      bodyWeight: string;
      height: string;
      specialFeatures: string[];
      temperament: string;
    };
  };
  productionData?: {
    averageLactationPeriod: string;
    peakMilkProduction: string;
    fatContent: string;
    proteinContent: string;
    calvingInterval: string;
    ageAtFirstCalving: string;
  };
}

export interface DetectionResult {
  breed: BreedInfo;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  heatmap?: string;
  estimatedGender?: 'bull' | 'cow' | 'heifer' | 'calf';
  estimatedAge?: string;
  bodyConditionScore?: number;
}

export interface IdentificationResult {
  id: string;
  image: string;
  video?: string;
  timestamp: Date;
  results: DetectionResult[];
  animalCount?: number;
  flwCorrection?: string;
  location?: { lat: number; lng: number; address: string };
}

export interface FLWReport {
  id: string;
  flwId: string;
  flwName: string;
  district: string;
  block: string;
  village: string;
  timestamp: Date;
  animalCounts: Record<string, number>;
  healthFlags: string[];
  notes: string;
  identifications: IdentificationResult[];
}

export interface VetContact {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  district: string;
  block?: string;
  specialty: string[];
  available24x7: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'flw' | 'block_officer' | 'district_officer' | 'admin';
  district: string;
  block?: string;
  phone: string;
  language: string;
}