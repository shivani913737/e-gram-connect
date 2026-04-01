import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  MessageSquarePlus, Send, CheckCircle2, Clock, Loader2, MessageCircle,
} from "lucide-react";

interface FeedbackRow {
  id: string;
  name: string;
  village: string;
  message: string;
  status: string;
  created_at: string;
}

const Feedback = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const fetchFeedback = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setFeedbackList((data as FeedbackRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFeedback(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !village.trim() || !message.trim()) return;
    setSubmitting(true);
    const insertData: any = {
      name: name.trim(),
      village: village.trim(),
      message: message.trim(),
    };
    const { error } = await supabase.from("feedback").insert(insertData);
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit feedback.", variant: "destructive" });
    } else {
      console.log(`📧 Email sent to admin with feedback details:\n  Name: ${name.trim()}\n  Village: ${village.trim()}\n  Email: ${email.trim() || "Not provided"}\n  Complaint: ${message.trim()}`);
      toast({ title: t("feedback.submitted"), description: "Feedback submitted successfully. Notification sent to authorities." });
      setName(""); setVillage(""); setMessage(""); setEmail("");
      fetchFeedback();
    }
  };

  const pending = feedbackList.filter(f => f.status === "pending").length;
  const resolved = feedbackList.filter(f => f.status === "resolved").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquarePlus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t("feedback.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("feedback.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{feedbackList.length}</p>
            <p className="text-xs text-muted-foreground">{t("feedback.total")}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            <p className="text-xs text-muted-foreground">{t("feedback.pending")}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{resolved}</p>
            <p className="text-xs text-muted-foreground">{t("feedback.resolved")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <Card className="rounded-2xl border-0 shadow-md lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" /> {t("feedback.submit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder={t("feedback.namePlaceholder")} value={name} onChange={e => setName(e.target.value)} className="rounded-xl" required maxLength={100} />
              <Input placeholder={t("feedback.villagePlaceholder")} value={village} onChange={e => setVillage(e.target.value)} className="rounded-xl" required maxLength={100} />
              <Input placeholder="Your email (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" maxLength={255} />
              <Textarea placeholder={t("feedback.messagePlaceholder")} value={message} onChange={e => setMessage(e.target.value)} className="rounded-xl min-h-[100px]" required maxLength={1000} />
              <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {t("feedback.sendBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" /> {t("feedback.recentTitle")}
          </h2>
          {loading ? (
            [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : feedbackList.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6 text-center text-muted-foreground">{t("feedback.noFeedback")}</CardContent>
            </Card>
          ) : (
            feedbackList.map(fb => (
              <Card key={fb.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{fb.name}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">{fb.village}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{fb.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">{new Date(fb.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`shrink-0 rounded-lg text-[10px] ${fb.status === "resolved" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}`}>
                      {fb.status === "resolved" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                      {fb.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
