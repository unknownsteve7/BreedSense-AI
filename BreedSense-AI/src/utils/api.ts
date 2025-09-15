// Prefer explicit VITE_API_BASE. In local dev, fall back to localhost so developers without DNS to the
// production host can continue to work against a local FastAPI instance.
const PROD_HOST = 'https://sihbackend-production.up.railway.app';
export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'https://sihbackend-production.up.railway.app' : PROD_HOST);

// lightweight wrapper around fetch that throws a clear error on network failures and returns
// non-ok responses as objects so callers can decide how to handle 4xx/5xx payloads.
async function safeFetch(input: RequestInfo, init?: RequestInit) {
    try {
        const res = await fetch(input, init);
        return res;
    } catch (err: any) {
        // network-level failure (DNS, CORS preflight blocked, offline, etc.)
        const message = err && err.message ? String(err.message) : 'Network error';
        const e: any = new Error(`Network request failed: ${message}`);
        e.isNetworkError = true;
        throw e;
    }
}

export async function pingRoot() {
    const res = await safeFetch(`${API_BASE}/`);
    if (!res.ok) throw new Error('Root ping failed');
    return res.json();
}

export async function recognizeBreed(file: File): Promise<{ predicted_class: string; confidence_score: number }> {
    const form = new FormData();
    form.append('file', file);

    const res = await safeFetch(`${API_BASE}/recognize_breed`, {
        method: 'POST',
        body: form
    });

    // Let caller decide how to handle non-ok (400 with JSON error message, etc.)
    if (!res.ok) {
        const text = await res.text();
        const err: any = new Error(`recognize_breed failed: ${res.status} ${text}`);
        err.status = res.status;
        err.body = text;
        throw err;
    }

    const jsonResponse = await res.json();
    return jsonResponse;
}

export async function getBuffaloBreeds(): Promise<string[]> {
    try {
        const res = await safeFetch(`${API_BASE}/buffalo_breeds/`);
        if (!res.ok) {
            // surface server-side error with status for debugging
            const text = await res.text();
            throw new Error(`Failed to fetch buffalo breeds: ${res.status} ${text}`);
        }
        return await res.json();
    } catch (err: any) {
        // If network error (e.g. DNS not resolvable) or other failures, return empty list
        // so the UI doesn't completely break in dev.
        return [];
    }
}

export async function getBuffaloBreedDetail(breed_name: string): Promise<any> {
    const res = await fetch(`${API_BASE}/buffalo_breeds/${encodeURIComponent(breed_name)}`);
    if (!res.ok) throw new Error('Failed to fetch breed detail');
    const data = await res.json();

    // Normalise common backend shapes into a BreedInfo-like object
    const englishName = data.englishName || data.name || breed_name;
    const origin = data.origin || data.region || data.location || '';
    // image: try many common variants and nested locations (male/female may include pictures)
    let image = data.image || data.photo || data.image_url || data.photo_url || data.picture || data.imageUrl || '';
    // If image is an object (e.g. { url }) pick url or src
    if (image && typeof image === 'object') {
        image = image.url || image.src || image.path || '';
    }
    // Try nested male/female nodes
    const maybeMaleImg = (data.male && (data.male.image || data.male.photo || data.male.image_url || data.male.picture)) || undefined;
    const maybeFemaleImg = (data.female && (data.female.image || data.female.photo || data.female.image_url || data.female.picture)) || undefined;
    if (!image) image = maybeFemaleImg || maybeMaleImg || '';
    const description = data.description || data.desc || '';

    // characteristics: try to extract milkYield, color, hornSize, bodySize, uses
    let characteristics: any = { color: [], hornSize: 'polled', bodySize: 'medium', milkYield: '0-0', uses: [] };

    if (data.characteristics) {
        characteristics = {
            color: data.characteristics.color || data.characteristics.colors || [],
            hornSize: data.characteristics.hornSize || data.characteristics.horn_size || 'polled',
            bodySize: data.characteristics.bodySize || data.characteristics.body_size || 'medium',
            milkYield: data.characteristics.milkYield || data.characteristics.milk_yield || (data.milk ? String(data.milk) : '0-0'),
            uses: data.characteristics.uses || data.characteristics.purpose || []
        };
    } else if (data.male || data.female) {
        // Some APIs split male/female data. Try to synthesise characteristics.
        const maleChar = data.male || {};
        const femaleChar = data.female || {};
        characteristics = {
            color: maleChar.coat_color ? [maleChar.coat_color] : (femaleChar.coat_color ? [femaleChar.coat_color] : []),
            hornSize: maleChar.horn_shape || femaleChar.horn_shape || 'polled',
            bodySize: femaleChar.body_weight ? 'medium' : 'medium',
            milkYield: femaleChar.milk_production || '0-0',
            uses: data.uses || []
        };
    } else {
        characteristics = {
            color: data.color || data.colors || [],
            hornSize: data.hornSize || data.horn_shape || 'polled',
            bodySize: data.bodySize || data.body_size || 'medium',
            milkYield: data.milkYield || data.milk_production || '0-0',
            uses: data.uses || []
        };
    }

    const management = data.management || data.care || { diet: [], commonDiseases: [], careNotes: [] };
    const conservation = data.conservation || data.status || 'common';
    // initial history value (may be overwritten by deep search later)
    let history = data.history || data.historical_notes || data.originHistory || data.background || data.historical || data.history_text || '';

    // productionData normalization - check multiple possible field names and nested locations
    const peekFrom = (obj: any, keys: string[]) => {
        for (const k of keys) {
            if (obj && typeof obj[k] !== 'undefined' && obj[k] !== null) return obj[k];
        }
        return undefined;
    };

    const femaleProd = data.female || data.cow || {};
    const productionSource = data.production || data.production_data || data.milk || {};

    const peakMilk = peekFrom(productionSource, ['peakMilkProduction', 'peak_milk_production', 'peak_yield', 'milk_yield'])
        || peekFrom(femaleProd, ['milk_production', 'milk_yield'])
        || characteristics.milkYield;

    const fat = peekFrom(productionSource, ['fatContent', 'fat_content', 'fat_pct', 'fat_percentage'])
        || peekFrom(femaleProd, ['fat_content', 'fat_pct', 'fat_percentage']);

    const protein = peekFrom(productionSource, ['proteinContent', 'protein_content', 'protein_pct', 'protein_percentage'])
        || peekFrom(femaleProd, ['protein_content', 'protein_pct', 'protein_percentage']);

    const avgLactation = peekFrom(productionSource, ['averageLactationPeriod', 'average_lactation_period', 'lactation_period', 'lactation_period_days'])
        || peekFrom(femaleProd, ['lactation_period']);

    const calvingInterval = peekFrom(productionSource, ['calvingInterval', 'calving_interval']) || data.calving_interval || undefined;

    const ageFirstCalving = peekFrom(productionSource, ['ageAtFirstCalving', 'age_at_first_calving', 'first_calving_age', 'first_calving'])
        || peekFrom(femaleProd, ['age_at_first_calving', 'first_calving_age', 'first_calving']);

    const productionData = {
        peakMilkProduction: peakMilk ?? 'N/A',
        fatContent: fat ?? 'N/A',
        proteinContent: protein ?? 'N/A',
        averageLactationPeriod: avgLactation ?? 'N/A',
        calvingInterval: calvingInterval ?? 'N/A',
        ageAtFirstCalving: ageFirstCalving ?? 'N/A'
    };

    // Deep search helper: find first value whose key matches regex (recursive)
    const deepFind = (obj: any, re: RegExp): any => {
        if (!obj || typeof obj !== 'object') return undefined;
        for (const k of Object.keys(obj)) {
            if (re.test(k)) return obj[k];
            const v = obj[k];
            if (v && typeof v === 'object') {
                const nested = deepFind(v, re);
                if (typeof nested !== 'undefined') return nested;
            }
        }
        return undefined;
    };

    // Helper: find first key in an object that matches a regex and return its value
    const getFirstMatch = (obj: any, re: RegExp) => {
        if (!obj || typeof obj !== 'object') return undefined;
        for (const k of Object.keys(obj)) {
            if (re.test(k)) return obj[k];
        }
        return undefined;
    };

    // Deep-find fallback for odd shapes (run after deepFind exists)
    if (!image) {
        const foundImg = deepFind(data, /image|photo|picture|img|image_url|photo_url/i);
        if (foundImg) image = typeof foundImg === 'string' ? foundImg : (foundImg.url || foundImg.src || '');
    }

    // (production-field extraction moved further down where maleNode/femaleNode are declared)

    // If production fields are still missing, try a deep search across the response
    if (!productionData.peakMilkProduction || productionData.peakMilkProduction === 'N/A') {
        productionData.peakMilkProduction = deepFind(data, /milk|yield|production/i) ?? productionData.peakMilkProduction;
    }
    if ((!productionData.fatContent || productionData.fatContent === 'N/A')) {
        productionData.fatContent = deepFind(data, /fat|fat_content|fat_pct/i) ?? productionData.fatContent;
    }
    if ((!productionData.proteinContent || productionData.proteinContent === 'N/A')) {
        productionData.proteinContent = deepFind(data, /protein|protein_content|protein_pct/i) ?? productionData.proteinContent;
    }
    if ((!productionData.averageLactationPeriod || productionData.averageLactationPeriod === 'N/A')) {
        productionData.averageLactationPeriod = deepFind(data, /lactation|lactation_period/i) ?? productionData.averageLactationPeriod;
    }
    if ((!productionData.ageAtFirstCalving || productionData.ageAtFirstCalving === 'N/A')) {
        productionData.ageAtFirstCalving = deepFind(data, /first_calv|firstCalv|age_at_first_calving/i) ?? productionData.ageAtFirstCalving;
    }

    if (!history || history === '') {
        // try deep find for history-like fields
        const hist = deepFind(data, /history|histor|background|origin/i);
        if (hist) {
            // if hist is object, stringify; else use value
            history = typeof hist === 'object' ? JSON.stringify(hist) : hist;
        }
    }

    // genderCharacteristics normalization (male/female -> bull/cow)
    const maleGen = data.male || data.bull || {};
    const femaleGen = data.female || data.cow || {};
    const genderCharacteristics = data.genderCharacteristics || data.gender_characteristics || (maleGen || femaleGen ? {
        bull: {
            bodyWeight: maleGen.body_weight || maleGen.bodyWeight || maleGen.bodyWeightRange || 'N/A',
            height: maleGen.height || 'N/A',
            temperament: maleGen.temperament || '',
            specialFeatures: maleGen.specialFeatures || maleGen.features || []
        },
        cow: {
            bodyWeight: femaleGen.body_weight || femaleGen.bodyWeight || femaleGen.bodyWeightRange || 'N/A',
            height: femaleGen.height || 'N/A',
            temperament: femaleGen.temperament || '',
            specialFeatures: femaleGen.specialFeatures || femaleGen.features || []
        }
    } : undefined);

    // (history already defined earlier)

    // origin - try more variants and deep search nested fields (male/female may contain origin)
    const originVariants = data.origin || data.region || data.location || data.country || data.place_of_origin || data.origin_country || '';
    let originFinal = originVariants || origin;
    if (!originFinal) {
        const foundOrigin = deepFind(data, /origin|region|location|place_of_origin|country/i);
        if (foundOrigin) originFinal = typeof foundOrigin === 'string' ? foundOrigin : String(foundOrigin);
    }

    // explicit nested fallback from male/female nodes (some APIs put origin/production there)
    const maleNode = data.male || data.bull || {};
    const femaleNode = data.female || data.cow || {};
    if (!originFinal) {
        originFinal = femaleNode.origin || maleNode.origin || femaleNode.location || maleNode.location || originFinal;
    }

    // Use regex-based extraction from male/female nodes for production-related fields
    // (covers keys like fat, milk_fat, fat_content, protein, lactation_period, etc.)
    const femaleFat = getFirstMatch(femaleNode, /fat|milk_fat|fat_content|fat_pct|fat_percentage/i);
    const maleFat = getFirstMatch(maleNode, /fat|milk_fat|fat_content|fat_pct|fat_percentage/i);
    if ((!productionData.fatContent || productionData.fatContent === 'N/A') && (femaleFat || maleFat)) {
        productionData.fatContent = (femaleFat || maleFat) as string;
    }

    const femaleProtein = getFirstMatch(femaleNode, /protein|protein_content|protein_pct|protein_percentage/i);
    const maleProtein = getFirstMatch(maleNode, /protein|protein_content|protein_pct|protein_percentage/i);
    if ((!productionData.proteinContent || productionData.proteinContent === 'N/A') && (femaleProtein || maleProtein)) {
        productionData.proteinContent = (femaleProtein || maleProtein) as string;
    }

    const femaleLact = getFirstMatch(femaleNode, /lactation|lactation_period|lactation_days|lactation_months/i);
    const maleLact = getFirstMatch(maleNode, /lactation|lactation_period|lactation_days|lactation_months/i);
    if ((!productionData.averageLactationPeriod || productionData.averageLactationPeriod === 'N/A') && (femaleLact || maleLact)) {
        productionData.averageLactationPeriod = (femaleLact || maleLact) as string;
    }

    const femaleFirstCalv = getFirstMatch(femaleNode, /age_at_first_calving|ageAtFirstCalving|first_calving|first_calving_age/i);
    const maleFirstCalv = getFirstMatch(maleNode, /age_at_first_calving|ageAtFirstCalving|first_calving|first_calving_age/i);
    if ((!productionData.ageAtFirstCalving || productionData.ageAtFirstCalving === 'N/A') && (femaleFirstCalv || maleFirstCalv)) {
        productionData.ageAtFirstCalving = (femaleFirstCalv || maleFirstCalv) as string;
    }

    // ensure productionData fields also pick nested female/male values if present
    productionData.peakMilkProduction = productionData.peakMilkProduction === 'N/A' ? (femaleNode.milk_production || femaleNode.milk_yield || maleNode.milk_production || maleNode.milk_yield || productionData.peakMilkProduction) : productionData.peakMilkProduction;
    productionData.fatContent = productionData.fatContent === 'N/A' ? (femaleNode.fat_content || maleNode.fat_content || productionData.fatContent) : productionData.fatContent;
    productionData.proteinContent = productionData.proteinContent === 'N/A' ? (femaleNode.protein_content || maleNode.protein_content || productionData.proteinContent) : productionData.proteinContent;
    productionData.averageLactationPeriod = productionData.averageLactationPeriod === 'N/A' ? (femaleNode.lactation_period || maleNode.lactation_period || productionData.averageLactationPeriod) : productionData.averageLactationPeriod;
    productionData.ageAtFirstCalving = productionData.ageAtFirstCalving === 'N/A' ? (femaleNode.age_at_first_calving || maleNode.age_at_first_calving || productionData.ageAtFirstCalving) : productionData.ageAtFirstCalving;

    // Map backend-provided type strings to our category values
    const mapTypeToCategory = (t: any) => {
        if (!t || typeof t !== 'string') return undefined;
        const s = t.toLowerCase();
        if (s.includes('buffalo')) return 'buffalo';
        if (s.includes('cow') || s.includes('cattle')) return 'cow';
        return undefined;
    };

    const candidateType = data.category || data.type || (maleNode && (maleNode.type || maleNode.type_of_animal)) || (femaleNode && (femaleNode.type || femaleNode.type_of_animal)) || '';
    const derivedCategory = mapTypeToCategory(candidateType) || 'buffalo';

    const normalized = {
        id: data.id || breed_name,
        name: data.name || englishName,
        englishName,
        category: derivedCategory,
        origin: originFinal,
        characteristics,
        productionData,
        genderCharacteristics,
        management,
        conservation,
        description,
        history,
        image,
    };

    // Debug in dev: print normalized structure to console to help troubleshooting
    try {
        if (typeof window !== 'undefined' && import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            // Normalized breed detail
        }
    } catch (e) {
        // ignore
    }

    return normalized;
}
