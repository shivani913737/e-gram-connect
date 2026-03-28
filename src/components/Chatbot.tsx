import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/i18n/LanguageContext";
import { schemes } from "@/data/schemes";

interface Message {
  role: "user" | "bot";
  text: string;
}

const knowledgeBase: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["hello", "hi", "hey", "namaste", "namaskar"],
    answer: "Hello! I'm your Gram Connect assistant. You can ask me about village details, government schemes, or fund utilization.",
  },
  {
    keywords: ["scheme", "yojana", "योजना", "government scheme"],
    answer: `We have ${schemes.length} government schemes listed including PMAY, MGNREGA, PM-KISAN, Ayushman Bharat, Swachh Bharat, Jal Jeevan Mission, and more. Visit the Schemes page to browse all of them with eligibility and benefits info.`,
  },
  {
    keywords: ["pmay", "awas", "housing", "आवास"],
    answer: "Pradhan Mantri Awas Yojana (PMAY) provides financial assistance of ₹1.20-1.30 lakh for house construction. Eligible: households without a pucca house, SC/ST, minorities, EWS. Apply through Gram Panchayat or CSC.",
  },
  {
    keywords: ["mgnrega", "employment", "रोजगार", "nrega"],
    answer: "MGNREGA guarantees 100 days of wage employment per year to rural households. Register at Gram Panchayat with a photo to get a Job Card within 15 days.",
  },
  {
    keywords: ["kisan", "farmer", "किसान", "pm-kisan"],
    answer: "PM-KISAN provides ₹6,000/year in 3 installments of ₹2,000 to land-holding farmer families. Register at pmkisan.gov.in or CSC with Aadhaar, bank account, and land records.",
  },
  {
    keywords: ["ayushman", "health", "स्वास्थ्य", "insurance", "बीमा"],
    answer: "Ayushman Bharat (PMJAY) provides ₹5 lakh annual health cover for cashless treatment at empanelled hospitals. Check eligibility at mera.pmjay.gov.in.",
  },
  {
    keywords: ["fund", "funds", "money", "expenditure", "निधि", "खर्च", "पैसा"],
    answer: "Panchayat funds are tracked across categories like roads, water, education, electricity, sanitation, and health. Visit the Dashboard or Village Details > Funds tab to see detailed spending breakdowns and charts.",
  },
  {
    keywords: ["village", "गाँव", "गाव", "details", "information"],
    answer: "Select a village from the homepage using the region selector (State > District > Block > Village). The Village Details page shows population, facilities, officials, development data, and fund utilization.",
  },
  {
    keywords: ["official", "sarpanch", "सरपंच", "gram sevak", "ग्राम सेवक"],
    answer: "Village officials including Sarpanch, Up-Sarpanch, Gram Sevak, and members are listed under the People tab in Village Details. Their profile, education, and contact details are available.",
  },
  {
    keywords: ["audit", "record", "रिकॉर्ड", "नोंदी"],
    answer: "The Audit & Records page shows all village expenditure records with category and status filters. You can view them in table or card format with charts showing spending distribution.",
  },
  {
    keywords: ["water", "jal", "पानी", "जल"],
    answer: "Jal Jeevan Mission aims to provide tap water connections to every rural household (55 litres/day). Implemented through Gram Panchayat and VWSC.",
  },
  {
    keywords: ["road", "sadak", "सड़क", "रस्ता"],
    answer: "Pradhan Mantri Gram Sadak Yojana (PMGSY) provides all-weather road connectivity to unconnected habitations with 500+ population (250+ in hilly areas).",
  },
  {
    keywords: ["toilet", "sanitation", "swachh", "शौचालय", "स्वच्छ"],
    answer: "Swachh Bharat Mission (Gramin) provides ₹12,000 incentive for individual household toilet construction. Apply through Gram Panchayat with BPL card or income proof.",
  },
  {
    keywords: ["ujjwala", "gas", "lpg", "गैस"],
    answer: "Pradhan Mantri Ujjwala Yojana provides free LPG connections to BPL women with ₹1,600 subsidy. Apply at nearest LPG distributor.",
  },
];

const findAnswer = (query: string): string => {
  const q = query.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.answer;
    }
  }
  return "I'm not sure about that. Try asking about government schemes (PMAY, MGNREGA, PM-KISAN), village details, fund utilization, or officials. You can also visit the Schemes page for complete information.";
};

const Chatbot = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "" }, // placeholder, will use t() in render
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const userMsg: Message = { role: "user", text: q };
    const botMsg: Message = { role: "bot", text: findAnswer(q) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="Open chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary px-4 py-3 text-primary-foreground">
            <p className="font-semibold text-sm">{t("chat.title")}</p>
            <p className="text-xs text-primary-foreground/70">E-Gram Panchayat</p>
          </div>

          {/* Messages */}
          <ScrollArea className="h-72 px-3 py-3">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {i === 0 && m.role === "bot" ? t("chat.welcome") : m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("chat.placeholder")}
              className="rounded-xl text-sm"
            />
            <Button size="icon" onClick={send} className="rounded-xl shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
