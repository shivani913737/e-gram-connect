import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Globe, Heart } from "lucide-react";

const features = [
  { icon: Globe, title: "Digital Governance", desc: "Bringing transparency and accessibility to rural administration through technology." },
  { icon: Users, title: "Community First", desc: "Designed for villagers, sarpanches, and local officials to collaborate effectively." },
  { icon: Shield, title: "Secure & Reliable", desc: "Data protected with modern security standards to ensure trust." },
  { icon: Heart, title: "Ease of Use", desc: "Simple interface designed for users with minimal digital literacy." },
];

const About = () => (
  <div className="mx-auto max-w-4xl px-4 py-12">
    <h1 className="mb-4 text-center text-3xl font-bold">About E-Gram Panchayat</h1>
    <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
      E-Gram Panchayat (Gram Connect) is a digital platform aimed at empowering rural governance. 
      It provides easy access to village records, government schemes, and administrative tools for panchayat officials and citizens.
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

export default About;
