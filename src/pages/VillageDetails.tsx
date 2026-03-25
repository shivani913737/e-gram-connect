import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft, MapPin, Users, Droplets, Zap, GraduationCap, Activity,
  Building2, Route, Phone, User, ChevronRight, Landmark, TrendingUp
} from "lucide-react";

interface VillageData {
  id: string;
  name: string;
  state: string;
  district: string;
  block: string;
  population: number | null;
  area_sq_km: number | null;
  water_sources: number | null;
  schools: number | null;
  health_centers: number | null;
  roads_km: number | null;
  electricity_coverage: number | null;
  description: string | null;
}

interface Official {
  id: string;
  name: string;
  designation: string;
  age: number | null;
  gender: string | null;
  education: string | null;
  contact: string | null;
  image_url: string | null;
}

const VillageDetails = () => {
  const [params] = useSearchParams();
  const state = params.get("state") || "N/A";
  const district = params.get("district") || "N/A";
  const block = params.get("block") || "N/A";
  const village = params.get("village") || "N/A";
  const id = params.get("id");

  const [data, setData] = useState<VillageData | null>(null);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchVillage = async () => {
      setLoading(true);
      let query = supabase.from("villages").select("*");

      if (id) {
        query = query.eq("id", id);
      } else {
        query = query
          .eq("name", village)
          .eq("state", state)
          .eq("district", district)
          .eq("block", block);
      }

      const { data: result, error } = await query.maybeSingle();

      if (error || !result) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setData(result);

      // Fetch officials
      const { data: offs } = await supabase
        .from("village_officials")
        .select("*")
        .eq("village_id", result.id)
        .order("designation");

      if (offs) setOfficials(offs as Official[]);
      setLoading(false);
    };
    fetchVillage();
  }, [id, village, state, district, block]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const stats = data
    ? [
        { icon: Users, label: "Population", value: data.population?.toLocaleString() ?? "N/A" },
        { icon: Droplets, label: "Water Sources", value: String(data.water_sources ?? "N/A") },
        { icon: Zap, label: "Electricity", value: data.electricity_coverage != null ? `${data.electricity_coverage}%` : "N/A" },
        { icon: GraduationCap, label: "Schools", value: String(data.schools ?? "N/A") },
        { icon: Activity, label: "Health Centers", value: String(data.health_centers ?? "N/A") },
      ]
    : [];

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const designationColor = (d: string) => {
    if (d === "Sarpanch") return "bg-primary text-primary-foreground";
    if (d === "Up-Sarpanch") return "bg-secondary text-secondary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </Link>

      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span>{data?.state ?? state}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{data?.district ?? district}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{data?.block ?? block}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{data?.name ?? village}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{data?.name ?? village}</h1>
            <p className="text-sm text-muted-foreground">
              {data?.block ?? block} Block, {data?.district ?? district} District
            </p>
          </div>
        </div>
      </div>

      {notFound ? (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No detailed data found for <strong>{village}</strong>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-8">
            {stats.map((s) => (
              <Card key={s.label} className="border-primary/10">
                <CardContent className="pt-4 pb-3 text-center">
                  <s.icon className="mx-auto mb-1.5 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map / Location Visual */}
          <Card className="mb-8 overflow-hidden border-primary/10">
            <CardContent className="p-0">
              <div className="bg-secondary/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Location & Hierarchy</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { label: "State", value: data?.state },
                    { label: "District", value: data?.district },
                    { label: "Block", value: data?.block },
                    { label: "Village", value: data?.name },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`rounded-lg px-4 py-3 text-center ${i === 3 ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                        <p className={`text-[10px] uppercase tracking-wider ${i === 3 ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{item.label}</p>
                        <p className="font-semibold text-sm">{item.value}</p>
                      </div>
                      {i < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
                {data?.area_sq_km && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Total area: <strong>{data.area_sq_km} sq. km</strong> • Road connectivity: <strong>{data.roads_km} km</strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Sections */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" /> About {data?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data?.description || "No description available."}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Population</p>
                      <p className="text-lg font-bold">{data?.population?.toLocaleString() ?? "N/A"}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Area</p>
                      <p className="text-lg font-bold">{data?.area_sq_km ?? "N/A"} km²</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Density</p>
                      <p className="text-lg font-bold">
                        {data?.population && data?.area_sq_km
                          ? Math.round(data.population / data.area_sq_km)
                          : "N/A"}{" "}
                        /km²
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Village Officials & Key Members
              </h3>
              {officials.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No officials data available yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {officials.map((o) => (
                    <Card key={o.id} className="border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 shrink-0">
                            <AvatarFallback className={designationColor(o.designation)}>
                              {getInitials(o.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{o.name}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5">
                              {o.designation}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground">
                          {o.age && (
                            <span>Age: <strong className="text-foreground">{o.age}</strong></span>
                          )}
                          {o.gender && (
                            <span>Gender: <strong className="text-foreground">{o.gender}</strong></span>
                          )}
                          {o.education && (
                            <span className="col-span-2">Education: <strong className="text-foreground">{o.education}</strong></span>
                          )}
                        </div>
                        {o.contact && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                            <Phone className="h-3 w-3" />
                            <span>{o.contact}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Facilities Tab */}
            <TabsContent value="facilities" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Village Facilities
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: GraduationCap, label: "Schools", value: data?.schools, desc: "Primary & secondary educational institutions" },
                  { icon: Activity, label: "Health Centers", value: data?.health_centers, desc: "PHCs, sub-centers, and health facilities" },
                  { icon: Droplets, label: "Water Sources", value: data?.water_sources, desc: "Borewells, handpumps, and tap connections" },
                  { icon: Landmark, label: "Panchayat Office", value: 1, desc: "Gram Panchayat administrative office" },
                ].map((f) => (
                  <Card key={f.label} className="border-primary/10">
                    <CardContent className="pt-5 flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{f.label}</p>
                        <p className="text-2xl font-bold text-primary">{f.value ?? "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Development Tab */}
            <TabsContent value="development" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Development Data
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Electricity */}
                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Electricity Coverage</span>
                    </div>
                    <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                        style={{ width: `${data?.electricity_coverage ?? 0}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-bold text-primary mt-1">
                      {data?.electricity_coverage ?? 0}%
                    </p>
                  </CardContent>
                </Card>

                {/* Roads */}
                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Road Connectivity</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{data?.roads_km ?? "N/A"} km</p>
                    <p className="text-xs text-muted-foreground mt-1">Total paved road network</p>
                  </CardContent>
                </Card>

                {/* Water */}
                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Water Infrastructure</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{data?.water_sources ?? "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active water sources available</p>
                  </CardContent>
                </Card>

                {/* Area */}
                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Geographic Area</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{data?.area_sq_km ?? "N/A"} km²</p>
                    <p className="text-xs text-muted-foreground mt-1">Total village area</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default VillageDetails;
