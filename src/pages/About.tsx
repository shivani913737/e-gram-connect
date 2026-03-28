import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Globe, title: t("about.digitalGov"), desc: t("about.digitalGovDesc") },
    { icon: Users, title: t("about.community"), desc: t("about.communityDesc") },
    { icon: Shield, title: t("about.secure"), desc: t("about.secureDesc") },
    { icon: Heart, title: t("about.ease"), desc: t("about.easeDesc") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-center text-3xl font-bold">{t("about.title")}</h1>
      <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
        {t("about.desc")}
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <Card key={f.title} className="border-primary/10">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default About;
