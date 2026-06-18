export interface MarketDataRole {
  id: string;
  role: string;
  currentSalary: number;
  lowerQuartile: number;
  lowerMid: number;
  median: number;
  upperMid: number;
  upperQuartile: number;
  function: string;
  jobLevel: number;
  location: string;
  notes?: string;
}

export const companyInfo = {
  name: "Demo Client",
  industry: "Technology",
  location: "South East England",
  reportDate: "June 2026",
  dataset: "South East / London",
  year: "2025-2026",
};

export const marketData: MarketDataRole[] = [
  {
    id: "1",
    role: "Software Engineer (Senior)",
    currentSalary: 72000,
    lowerQuartile: 68000,
    lowerMid: 72000,
    median: 76000,
    upperMid: 80000,
    upperQuartile: 84000,
    function: "Engineering",
    jobLevel: 3,
    location: "Brighton",
    notes: "Positioned at lower mid — competitive but room to grow",
  },
  {
    id: "2",
    role: "Software Engineer (Mid)",
    currentSalary: 52000,
    lowerQuartile: 48000,
    lowerMid: 51000,
    median: 54000,
    upperMid: 57000,
    upperQuartile: 60000,
    function: "Engineering",
    jobLevel: 4,
    location: "Brighton",
    notes: "Slightly below median — consider uplift at next review",
  },
  {
    id: "3",
    role: "Software Engineer (Junior)",
    currentSalary: 32000,
    lowerQuartile: 30000,
    lowerMid: 32000,
    median: 34000,
    upperMid: 36000,
    upperQuartile: 38000,
    function: "Engineering",
    jobLevel: 6,
    location: "Brighton",
  },
  {
    id: "4",
    role: "Engineering Manager",
    currentSalary: 92000,
    lowerQuartile: 85000,
    lowerMid: 88000,
    median: 92000,
    upperMid: 96000,
    upperQuartile: 100000,
    function: "Engineering",
    jobLevel: 2,
    location: "Brighton",
    notes: "Positioned at median — well placed",
  },
  {
    id: "5",
    role: "Product Manager (Senior)",
    currentSalary: 78000,
    lowerQuartile: 72000,
    lowerMid: 76000,
    median: 80000,
    upperMid: 84000,
    upperQuartile: 88000,
    function: "Product",
    jobLevel: 3,
    location: "Brighton",
    notes: "Below median — competitive market for senior PMs",
  },
  {
    id: "6",
    role: "Product Manager (Mid)",
    currentSalary: 58000,
    lowerQuartile: 54000,
    lowerMid: 57000,
    median: 60000,
    upperMid: 63000,
    upperQuartile: 66000,
    function: "Product",
    jobLevel: 4,
    location: "Brighton",
  },
  {
    id: "7",
    role: "Data Scientist (Senior)",
    currentSalary: 74000,
    lowerQuartile: 70000,
    lowerMid: 74000,
    median: 78000,
    upperMid: 82000,
    upperQuartile: 86000,
    function: "Data",
    jobLevel: 3,
    location: "Brighton",
    notes: "At lower mid — AI/ML talent in high demand",
  },
  {
    id: "8",
    role: "Data Analyst",
    currentSalary: 40000,
    lowerQuartile: 38000,
    lowerMid: 40000,
    median: 42000,
    upperMid: 45000,
    upperQuartile: 48000,
    function: "Data",
    jobLevel: 5,
    location: "Brighton",
  },
  {
    id: "9",
    role: "UX Designer (Senior)",
    currentSalary: 62000,
    lowerQuartile: 54000,
    lowerMid: 57000,
    median: 60000,
    upperMid: 63000,
    upperQuartile: 66000,
    function: "Design",
    jobLevel: 3,
    location: "Brighton",
    notes: "Above upper quartile — strong retention signal",
  },
  {
    id: "10",
    role: "DevOps / Platform Engineer",
    currentSalary: 68000,
    lowerQuartile: 65000,
    lowerMid: 68000,
    median: 72000,
    upperMid: 76000,
    upperQuartile: 80000,
    function: "Engineering",
    jobLevel: 3,
    location: "Brighton",
    notes: "At lower quartile — high demand specialism",
  },
  {
    id: "11",
    role: "Head of Engineering",
    currentSalary: 115000,
    lowerQuartile: 108000,
    lowerMid: 112000,
    median: 116000,
    upperMid: 120000,
    upperQuartile: 125000,
    function: "Engineering",
    jobLevel: 1,
    location: "Brighton",
    notes: "Positioned at lower mid — review for retention",
  },
  {
    id: "12",
    role: "People Business Partner",
    currentSalary: 52000,
    lowerQuartile: 48000,
    lowerMid: 51000,
    median: 54000,
    upperMid: 57000,
    upperQuartile: 60000,
    function: "HR",
    jobLevel: 3,
    location: "Brighton",
  },
];

export const marketTrends = {
  averagePayRise: 4.2,
  cpi: 3.1,
  realLivingWage: 12.60,
  londonLivingWage: 13.85,
  unemploymentRate: 4.3,
  minimumSalary37_5: 23809,
  averageWeeklyEarnings: 712,
  payRisePrediction: 3.8,
};

export const sectorInsights = {
  averageSalaryIncrease: 4.5,
  medianTurnover: 18.2,
  topBenefits: ["Remote / Hybrid Working", "Enhanced Pension (7–10%)", "Private Healthcare", "Share Options / LTIP"],
  recruitmentChallenges: ["Senior engineering talent", "AI/ML specialists", "Experienced product managers"],
};

export function getPositioning(currentSalary: number, lq: number, median: number, uq: number): {
  position: "below" | "lower" | "upper" | "above";
  label: string;
  color: string;
  percentage: number;
} {
  const range = uq - lq;
  const position = ((currentSalary - lq) / range) * 100;

  if (currentSalary < lq) {
    return { position: "below", label: "Below LQ", color: "hsl(0, 72%, 51%)", percentage: Math.max(0, position) };
  } else if (currentSalary < median) {
    return { position: "lower", label: "LQ to Median", color: "hsl(35, 90%, 55%)", percentage: position };
  } else if (currentSalary <= uq) {
    return { position: "upper", label: "Median to UQ", color: "hsl(160, 70%, 45%)", percentage: position };
  } else {
    return { position: "above", label: "Above UQ", color: "hsl(210, 80%, 55%)", percentage: Math.min(100, position) };
  }
}

export const salaryTrendData = [
  { year: "2021", housing: 3.2, market: 4.1 },
  { year: "2022", housing: 4.8, market: 5.9 },
  { year: "2023", housing: 6.2, market: 7.1 },
  { year: "2024", housing: 4.5, market: 5.0 },
  { year: "2025", housing: 4.2, market: 4.8 },
];

export const cpiTrendData = [
  { month: "Jan", cpi: 4.0 },
  { month: "Feb", cpi: 3.8 },
  { month: "Mar", cpi: 3.5 },
  { month: "Apr", cpi: 3.2 },
  { month: "May", cpi: 3.0 },
  { month: "Jun", cpi: 2.8 },
  { month: "Jul", cpi: 3.1 },
  { month: "Aug", cpi: 3.1 },
];

export const distributionData = [
  { name: "Below Market", value: 2, color: "hsl(0, 72%, 51%)" },
  { name: "Lower Quartile", value: 3, color: "hsl(35, 90%, 55%)" },
  { name: "Lower-Mid", value: 3, color: "hsl(45, 85%, 50%)" },
  { name: "At Median", value: 2, color: "hsl(160, 70%, 45%)" },
  { name: "Upper-Mid", value: 1, color: "hsl(180, 70%, 45%)" },
  { name: "Upper Quartile", value: 0, color: "hsl(200, 85%, 55%)" },
  { name: "Above Market", value: 1, color: "hsl(280, 65%, 55%)" },
];

export const bonusData = [
  { level: "Executive / Director", lq: 20, median: 35, uq: 60 },
  { level: "Head of / VP", lq: 15, median: 25, uq: 40 },
  { level: "Senior Manager / Lead", lq: 10, median: 18, uq: 30 },
  { level: "Senior Engineer / IC", lq: 8, median: 12, uq: 20 },
  { level: "Mid-level Professional", lq: 5, median: 8, uq: 15 },
  { level: "Junior / Graduate", lq: 0, median: 5, uq: 10 },
];
