import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/i18n/LanguageContext";
import { schemes } from "@/data/schemes";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "bot";
  text: string;
}

const staticKB: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["hello", "hi", "hey", "namaste", "namaskar", "help"],
    answer: "Hello! I'm your Gram Connect assistant. Ask me about villages, schemes, funds, officials, or audit records.",
  },
  {
    keywords: ["scheme", "yojana", "योजना", "government scheme", "list scheme", "available scheme", "all scheme"],
    answer: `There are ${schemes.length} schemes: ${schemes.map(s => s.name.split("(")[0].trim()).join(", ")}. Visit the Schemes page for full details.`,
  },
  {
    keywords: ["pmay", "awas", "housing", "आवास"],
    answer: "PMAY provides ₹1.20–1.30 lakh for house construction for households without a pucca house. Apply through Gram Panchayat or CSC.",
  },
  {
    keywords: ["mgnrega", "employment", "रोजगार", "nrega", "job card"],
    answer: "MGNREGA guarantees 100 days of wage employment per year. Register at Gram Panchayat with a photo to get a Job Card within 15 days.",
  },
  {
    keywords: ["kisan", "farmer", "किसान", "pm-kisan", "pm kisan"],
    answer: "PM-KISAN provides ₹6,000/year in 3 installments to land-holding farmers. Register at pmkisan.gov.in with Aadhaar and land records.",
  },
  {
    keywords: ["ayushman", "health", "स्वास्थ्य", "insurance", "बीमा", "pmjay"],
    answer: "Ayushman Bharat provides ₹5 lakh annual health cover for cashless treatment. Check eligibility at mera.pmjay.gov.in.",
  },
  {
    keywords: ["water", "jal", "पानी", "जल", "jal jeevan", "tap water"],
    answer: "Jal Jeevan Mission provides tap water connections (55 litres/day) to every rural household via Gram Panchayat.",
  },
  {
    keywords: ["road", "sadak", "सड़क", "रस्ता", "pmgsy"],
    answer: "PMGSY provides all-weather road connectivity to habitations with 500+ population (250+ in hilly areas).",
  },
  {
    keywords: ["toilet", "sanitation", "swachh", "शौचालय", "स्वच्छ"],
    answer: "Swachh Bharat provides ₹12,000 incentive for household toilet construction. Apply through Gram Panchayat.",
  },
  {
    keywords: ["ujjwala", "gas", "lpg", "गैस"],
    answer: "PM Ujjwala Yojana provides free LPG connections to BPL women with ₹1,600 subsidy at nearest distributor.",
  },
  {
    keywords: ["audit", "record", "रिकॉर्ड", "expenditure", "expense"],
    answer: "Visit the Audit & Records page to see all village expenditure records with category filters, charts, and table/card views.",
  },
  {
    keywords: ["feedback", "complaint", "suggestion", "शिकायत"],
    answer: "Go to the Feedback page to submit complaints or suggestions. You can track their status (Pending/Resolved).",
  },
  {
    keywords: ["dashboard", "analytics", "insight"],
    answer: "The Dashboard shows smart analytics: most developed village, highest spending category, project status, and fund charts.",
  },
];

// Dynamic queries that hit the database
const dynamicHandlers: { keywords: string[]; handler: () => Promise<string> }[] = [
  {
    keywords: ["total village", "how many village", "village count", "number of village", "kitne gaon", "कितने गाँव", "गाँव कितने"],
    handler: async () => {
      const { count } = await supabase.from("villages").select("*", { count: "exact", head: true });
      return `There are ${count ?? 0} villages registered in the system. Visit the Dashboard or use the Region Selector to explore them.`;
    },
  },
  {
    keywords: ["total fund", "fund utilization", "how much fund", "fund spent", "fund received", "कुल निधि", "पैसा कितना", "funds"],
    handler: async () => {
      const { data } = await supabase.from("audit_records").select("amount, status");
      if (!data || data.length === 0) return "No fund records found yet.";
      const total = data.reduce((s, r) => s + (r.amount ?? 0), 0);
      const spent = data.filter(r => r.status === "Completed").reduce((s, r) => s + (r.amount ?? 0), 0);
      const pct = total > 0 ? Math.round((spent / total) * 100) : 0;
      return `Total funds: ₹${(total / 100000).toFixed(1)}L | Spent: ₹${(spent / 100000).toFixed(1)}L | Utilization: ${pct}%. Check Dashboard for charts.`;
    },
  },
  {
    keywords: ["official", "sarpanch", "सरपंच", "gram sevak", "ग्राम सेवक", "how many official", "total official", "number of official"],
    handler: async () => {
      const { count } = await supabase.from("village_officials").select("*", { count: "exact", head: true });
      return `There are ${count ?? 0} officials registered. View their profiles on the Village Details → People tab.`;
    },
  },
  {
    keywords: ["village detail", "village info", "गाँव", "गाव", "village data", "select village"],
    handler: async () => {
      const { count } = await supabase.from("villages").select("*", { count: "exact", head: true });
      return `We have ${count ?? 0} villages with data on population, facilities, officials, and funds. Use the Region Selector on the homepage to pick a village.`;
    },
  },
  {
    keywords: ["pending project", "completed project", "project status", "कितने प्रोजेक्ट"],
    handler: async () => {
      const { data } = await supabase.from("audit_records").select("status");
      if (!data || data.length === 0) return "No project records found.";
      const completed = data.filter(r => r.status === "Completed").length;
      const pending = data.filter(r => r.status === "Pending").length;
      const inProgress = data.filter(r => r.status === "In Progress").length;
      return `Projects — Completed: ${completed}, In Progress: ${inProgress}, Pending: ${pending}. See the Audit page for details.`;
    },
  },
];

const findAnswer = async (query: string): Promise<string> => {
  const q = query.toLowerCase();

  // Check dynamic handlers first (more specific)
  for (const dh of dynamicHandlers) {
    if (dh.keywords.some((kw) => q.includes(kw))) {
      try { return await dh.handler(); } catch { /* fall through */ }
    }
  }

  // Static knowledge base
  for (const item of staticKB) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.answer;
    }
  }

  return "Sorry, I couldn't understand your question. Try asking about villages, schemes, funds, officials, or audit records.";
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

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    const userMsg: Message = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const answer = await findAnswer(q);
    setMessages((prev) => [...prev, { role: "bot", text: answer }]);
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
            <p className="text-xs text-primary-foreground/70">Gram Connect</p>
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
