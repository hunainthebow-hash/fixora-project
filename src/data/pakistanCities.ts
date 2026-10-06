export interface CityZone {
  id: string;
  name: string;
  nameUrdu: string;
  popularAreas: string[];
  lat: number;
  lng: number;
  averageEtaMinutes: number;
  activeTechniciansCount: number;
}

export interface CityPricingBenchmark {
  categoryId: string;
  serviceTitle: string;
  serviceTitleUrdu: string;
  minPkr: number;
  maxPkr: number;
  avgPkr: number;
  laborTime: string;
  emergencySurgePkr: number;
  inspectionFeePkr: number;
}

export const PAKISTAN_CITIES: CityZone[] = [
  {
    id: 'karachi',
    name: 'Karachi',
    nameUrdu: 'کراچی',
    popularAreas: ['Gulshan-e-Iqbal', 'DHA Phase 1-8', 'Clifton', 'PECHS', 'North Nazimabad', 'Bahria Town Karachi', 'Gulistan-e-Johar', 'Saddar'],
    lat: 24.8607,
    lng: 67.0011,
    averageEtaMinutes: 12,
    activeTechniciansCount: 142
  },
  {
    id: 'lahore',
    name: 'Lahore',
    nameUrdu: 'لاہور',
    popularAreas: ['DHA Phase 1-9', 'Gulberg', 'Johar Town', 'Model Town', 'Bahria Town', 'Faisal Town', 'Shadman', 'Cantt'],
    lat: 31.5204,
    lng: 74.3587,
    averageEtaMinutes: 14,
    activeTechniciansCount: 128
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    nameUrdu: 'اسلام آباد',
    popularAreas: ['Sector F-6 / F-7', 'Sector F-10 / F-11', 'Sector G-9 / G-11', 'Bahria Enclave', 'DHA Phase 2', 'PWD Housing', 'E-11'],
    lat: 33.6844,
    lng: 73.0479,
    averageEtaMinutes: 10,
    activeTechniciansCount: 86
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    nameUrdu: 'راولپنڈی',
    popularAreas: ['Saddar', 'Satellite Town', 'Bahria Phase 1-8', 'Westridge', 'Chaklala Scheme 3', 'Adiala Road'],
    lat: 33.5651,
    lng: 73.0169,
    averageEtaMinutes: 15,
    activeTechniciansCount: 64
  },
  {
    id: 'faisalabad',
    name: 'Faisalabad',
    nameUrdu: 'فیصل آباد',
    popularAreas: ['Kohinoor City', 'D Ground', 'Madina Town', 'Peoples Colony', 'Jaranwala Road', 'Canal Road'],
    lat: 31.4504,
    lng: 73.1350,
    averageEtaMinutes: 16,
    activeTechniciansCount: 48
  },
  {
    id: 'peshawar',
    name: 'Peshawar',
    nameUrdu: 'پشاور',
    popularAreas: ['Hayatabad (Phases 1-7)', 'University Town', 'Peshawar Cantt', 'Warsak Road', 'Ring Road'],
    lat: 34.0151,
    lng: 71.5249,
    averageEtaMinutes: 18,
    activeTechniciansCount: 39
  }
];

export const PAKISTAN_BENCHMARK_RATES: Record<string, CityPricingBenchmark[]> = {
  plumbing: [
    {
      categoryId: 'plumbing',
      serviceTitle: 'Burst Pipe & Emergency Leak Repair',
      serviceTitleUrdu: 'پائپ لیکیج اور ایمرجنسی نل مرمت',
      minPkr: 1200,
      maxPkr: 2500,
      avgPkr: 1800,
      laborTime: '30-60 mins',
      emergencySurgePkr: 800,
      inspectionFeePkr: 500
    },
    {
      categoryId: 'plumbing',
      serviceTitle: 'Water Tank & Motor Pump Installation / Repair',
      serviceTitleUrdu: 'پانی کی موٹر اور ٹینکی فٹنگ',
      minPkr: 2000,
      maxPkr: 4500,
      avgPkr: 3200,
      laborTime: '60-120 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 600
    },
    {
      categoryId: 'plumbing',
      serviceTitle: 'Sanitary & Washroom Complete Fitting',
      serviceTitleUrdu: 'باتھ روم سینیٹری فٹنگ',
      minPkr: 1500,
      maxPkr: 3500,
      avgPkr: 2200,
      laborTime: '45-90 mins',
      emergencySurgePkr: 600,
      inspectionFeePkr: 500
    }
  ],
  ac_repair: [
    {
      categoryId: 'ac_repair',
      serviceTitle: 'Split AC Master Chemical Wash & Jet Service',
      serviceTitleUrdu: 'اے سی ماسٹر کیمیکل سروس',
      minPkr: 2000,
      maxPkr: 3500,
      avgPkr: 2500,
      laborTime: '45-75 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 700
    },
    {
      categoryId: 'ac_repair',
      serviceTitle: 'AC Gas Refill (R410a / R32 / R22 Pure)',
      serviceTitleUrdu: 'اے سی گیس ریفلنگ',
      minPkr: 4000,
      maxPkr: 7500,
      avgPkr: 5500,
      laborTime: '60-90 mins',
      emergencySurgePkr: 1200,
      inspectionFeePkr: 800
    },
    {
      categoryId: 'ac_repair',
      serviceTitle: 'Inverter PCB Board Diagnostic & Repair',
      serviceTitleUrdu: 'انورٹر پی سی بی کٹ ریپیر',
      minPkr: 3000,
      maxPkr: 6000,
      avgPkr: 4200,
      laborTime: '60-120 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 1000
    }
  ],
  electrical: [
    {
      categoryId: 'electrical',
      serviceTitle: 'Short Circuit & Breaker / DB Box Repair',
      serviceTitleUrdu: 'شارٹ سرکٹ اور بریکر فالٹ فکسنگ',
      minPkr: 1200,
      maxPkr: 3000,
      avgPkr: 1800,
      laborTime: '30-60 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 600
    },
    {
      categoryId: 'electrical',
      serviceTitle: 'UPS & Solar Inverter Wiring & Installation',
      serviceTitleUrdu: 'یو پی ایس اور سولر انورٹر وائرنگ',
      minPkr: 2500,
      maxPkr: 6000,
      avgPkr: 4000,
      laborTime: '60-150 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 800
    },
    {
      categoryId: 'electrical',
      serviceTitle: 'Ceiling Fan & SMD Lighting Installation',
      serviceTitleUrdu: 'پنکھا اور لائٹنگ فٹنگ',
      minPkr: 800,
      maxPkr: 2000,
      avgPkr: 1200,
      laborTime: '30-45 mins',
      emergencySurgePkr: 500,
      inspectionFeePkr: 500
    }
  ],
  appliance_repair: [
    {
      categoryId: 'appliance_repair',
      serviceTitle: 'Refrigerator & Deep Freezer Compressor / Gas Repair',
      serviceTitleUrdu: 'فریج اور فریزر گیس و کمپریسر ریپیر',
      minPkr: 2500,
      maxPkr: 5500,
      avgPkr: 3800,
      laborTime: '60-120 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 700
    },
    {
      categoryId: 'appliance_repair',
      serviceTitle: 'Automatic Washing Machine PCB / Motor Repair',
      serviceTitleUrdu: 'واشنگ مشین ریپیر',
      minPkr: 1800,
      maxPkr: 4000,
      avgPkr: 2800,
      laborTime: '45-90 mins',
      emergencySurgePkr: 800,
      inspectionFeePkr: 600
    }
  ],
  mechanic: [
    {
      categoryId: 'mechanic',
      serviceTitle: 'Roadside Puncture & Battery Jumpstart',
      serviceTitleUrdu: 'روڈ سائیڈ کار پنکچر اور جمپ سٹارٹ',
      minPkr: 1000,
      maxPkr: 2500,
      avgPkr: 1500,
      laborTime: '20-40 mins',
      emergencySurgePkr: 800,
      inspectionFeePkr: 500
    },
    {
      categoryId: 'mechanic',
      serviceTitle: 'Car Periodic Tuning, Brake Pads & Oil Filter Change',
      serviceTitleUrdu: 'گاڑی ٹیوننگ اور آئل چینج',
      minPkr: 2000,
      maxPkr: 4500,
      avgPkr: 3000,
      laborTime: '45-90 mins',
      emergencySurgePkr: 700,
      inspectionFeePkr: 600
    }
  ],
  cleaning: [
    {
      categoryId: 'cleaning',
      serviceTitle: 'Complete Home & Deep Sofa / Carpet Shampoo Wash',
      serviceTitleUrdu: 'مکمل گھر اور صوفہ ڈیپ کلیننگ',
      minPkr: 3500,
      maxPkr: 8500,
      avgPkr: 5500,
      laborTime: '120-240 mins',
      emergencySurgePkr: 1000,
      inspectionFeePkr: 500
    }
  ]
};

export const getLocalizedBenchmark = (categoryId: string, cityId: string = 'karachi') => {
  const list = PAKISTAN_BENCHMARK_RATES[categoryId] || PAKISTAN_BENCHMARK_RATES['plumbing'];
  const base = list[0];
  
  // City multiplier (Islamabad/Karachi slightly higher, Rawalpindi/Faisalabad normalized)
  const multipliers: Record<string, number> = {
    islamabad: 1.15,
    karachi: 1.05,
    lahore: 1.05,
    rawalpindi: 0.95,
    faisalabad: 0.90,
    peshawar: 0.90
  };

  const mult = multipliers[cityId] || 1.0;

  return {
    ...base,
    minPkr: Math.round(base.minPkr * mult),
    maxPkr: Math.round(base.maxPkr * mult),
    avgPkr: Math.round(base.avgPkr * mult),
    formattedRangePkr: `₨ ${Math.round(base.minPkr * mult).toLocaleString()} - ₨ ${Math.round(base.maxPkr * mult).toLocaleString()}`
  };
};
