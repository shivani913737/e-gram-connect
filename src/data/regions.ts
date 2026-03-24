export interface Region {
  states: State[];
}

export interface State {
  name: string;
  districts: District[];
}

export interface District {
  name: string;
  blocks: Block[];
}

export interface Block {
  name: string;
  villages: string[];
}

export const regionData: Region = {
  states: [
    {
      name: "Maharashtra",
      districts: [
        {
          name: "Pune",
          blocks: [
            { name: "Haveli", villages: ["Wagholi", "Lohegaon", "Kesnand", "Wadgaon Sheri"] },
            { name: "Mulshi", villages: ["Pirangut", "Paud", "Lavale", "Hinjewadi"] },
          ],
        },
        {
          name: "Nagpur",
          blocks: [
            { name: "Nagpur Rural", villages: ["Wadi", "Hingna", "Kalmeshwar"] },
            { name: "Ramtek", villages: ["Mansar", "Khapa", "Parseoni"] },
          ],
        },
      ],
    },
    {
      name: "Rajasthan",
      districts: [
        {
          name: "Jaipur",
          blocks: [
            { name: "Amber", villages: ["Amer", "Naila", "Jaisinghpura"] },
            { name: "Sanganer", villages: ["Bagru", "Pratap Nagar", "Mansarovar"] },
          ],
        },
        {
          name: "Udaipur",
          blocks: [
            { name: "Girwa", villages: ["Hawala", "Badgaon", "Sisarma"] },
            { name: "Vallabhnagar", villages: ["Kankroli", "Nimbahera", "Salumber"] },
          ],
        },
      ],
    },
    {
      name: "Karnataka",
      districts: [
        {
          name: "Bengaluru Rural",
          blocks: [
            { name: "Devanahalli", villages: ["Vijayapura", "Budigere", "Sadahalli"] },
            { name: "Hosakote", villages: ["Anugondanahalli", "Sulibele", "Jadigenahalli"] },
          ],
        },
        {
          name: "Mysuru",
          blocks: [
            { name: "Nanjangud", villages: ["Hullahalli", "Tagadur", "Hedathale"] },
            { name: "T. Narasipura", villages: ["Somanathapura", "Mugur", "Bannur"] },
          ],
        },
      ],
    },
    {
      name: "Madhya Pradesh",
      districts: [
        {
          name: "Bhopal",
          blocks: [
            { name: "Huzur", villages: ["Ratibad", "Semra", "Lambakheda"] },
            { name: "Berasia", villages: ["Salamatpur", "Khajuri", "Johad"] },
          ],
        },
        {
          name: "Indore",
          blocks: [
            { name: "Mhow", villages: ["Manpur", "Simrol", "Betma"] },
            { name: "Sanwer", villages: ["Hatod", "Sawer", "Kampel"] },
          ],
        },
      ],
    },
  ],
};
