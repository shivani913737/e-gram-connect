export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: string;
}

export const schemes: Scheme[] = [
  {
    id: "pmay",
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    ministry: "Ministry of Housing and Urban Affairs",
    description: "Affordable housing scheme providing financial assistance for construction or enhancement of houses for rural poor.",
    eligibility: "Households without a pucca house, SC/ST, minorities, and EWS categories.",
    benefits: "Financial assistance of ₹1.20 lakh to ₹1.30 lakh for house construction in plain and hilly areas.",
    category: "Housing",
  },
  {
    id: "mgnrega",
    name: "MGNREGA",
    ministry: "Ministry of Rural Development",
    description: "Guarantees 100 days of wage employment per year to every rural household whose adult members volunteer to do unskilled manual work.",
    eligibility: "Any adult member of a rural household willing to do unskilled manual work.",
    benefits: "100 days guaranteed employment, daily wages as per state notification.",
    category: "Employment",
  },
  {
    id: "pmkisan",
    name: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture",
    description: "Income support of ₹6,000 per year in three equal installments to all land-holding farmer families.",
    eligibility: "All land-holding farmer families with cultivable land.",
    benefits: "₹6,000 per year in three installments of ₹2,000 each.",
    category: "Agriculture",
  },
  {
    id: "swachh",
    name: "Swachh Bharat Mission (Gramin)",
    ministry: "Ministry of Jal Shakti",
    description: "Aims to achieve universal sanitation coverage and eliminate open defecation in rural areas.",
    eligibility: "All rural households without a toilet.",
    benefits: "₹12,000 incentive for construction of individual household toilets.",
    category: "Sanitation",
  },
  {
    id: "jjm",
    name: "Jal Jeevan Mission",
    ministry: "Ministry of Jal Shakti",
    description: "Aims to provide safe and adequate drinking water through individual household tap connections to every rural household by 2024.",
    eligibility: "All rural households.",
    benefits: "Functional household tap connections providing 55 litres per capita per day.",
    category: "Water",
  },
  {
    id: "pmgsy",
    name: "Pradhan Mantri Gram Sadak Yojana",
    ministry: "Ministry of Rural Development",
    description: "Provides all-weather road connectivity to unconnected habitations in rural areas.",
    eligibility: "Unconnected habitations with population of 500+ (250+ in hilly areas).",
    benefits: "All-weather road connectivity to eligible habitations.",
    category: "Infrastructure",
  },
];
