import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, MapPin, Users, Droplets, Zap, GraduationCap, Activity,
  Building2, Route, Phone, User, ChevronRight, Landmark, TrendingUp,
  Home, Wheat, IndianRupee
} from "lucide-react";

import sarpanchMale from "@/assets/officials/sarpanch-male.png";
import sarpanchFemale from "@/assets/officials/sarpanch-female.png";
import officerMale from "@/assets/officials/officer-male.png";
import officerFemale from "@/assets/officials/officer-female.png";

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

interface AuditRecord {
  id: string;
  activity: string;
  amount: number | null;
  category: string;
  status: string;
  created_at: string;
}

const getOfficialImage = (designation: string, gender: string | null) => {
  const isFemale = gender?.toLowerCase() === "female";
  if (designation === "Sarpanch" || designation === "Up-Sarpanch") {
    return isFemale ? sarpanchFemale : sarpanchMale;
  }
  return isFemale ? officerFemale : officerMale;
};

const designationColor = (d: string) => {
  switch (d) {
    case "Sarpanch": return "bg-primary text-primary-foreground";
    case "Up-Sarpanch": return "bg-accent text-accent-foreground";
    case "Gram Sevak": return "bg-secondary text-secondary-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatCurrency = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const VillageDetails = () => {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<VillageData | null>(null);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSelection, setNoSelection] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Resolve params: URL > localStorage
  const state = params.get("state") || "";
  const district = params.get("district") || "";
  const block = params.get("block") || "";
  const village = params.get("village") || "";
  const id = params.get("id");

  useEffect(() => {
    // If no URL params, try to restore from localStorage
    if (!state && !village) {
      const saved = localStorage.getItem("selectedRegion");
      if (saved) {
        try {
          const r = JSON.parse(saved);
          const newParams: Record<string, string> = {};
          if (r.state) newParams.state = r.state;
          if (r.district) newParams.district = r.district;
          if (r.block) newParams.block = r.block;
          if (r.village) newParams.village = r.village;
          if (r.id) newParams.id = r.id;
          setParams(newParams, { replace: true });
          return; // will re-run with new params
        } catch { /* ignore */ }
      }
      // No saved selection either
      setLoading(false);
      setNoSelection(true);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setNoSelection(false);
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

      // Save/update localStorage
      localStorage.setItem("selectedRegion", JSON.stringify({
        state: result.state, district: result.district, block: result.block,
        village: result.name, id: result.id,
      }));

      const [officialsRes, auditRes] = await Promise.all([
        supabase.from("village_officials").select("*").eq("village_id", result.id).order("designation"),
        supabase.from("audit_records").select("*").eq("village_id", result.id).order("created_at", { ascending: false }).limit(10),
      ]);

      if (officialsRes.data) setOfficials(officialsRes.data as Official[]);
      if (auditRes.data) setAuditRecords(auditRes.data as AuditRecord[]);
      setLoading(false);
    };
    fetchAll();
  }, [id, village, state, district, block, setParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (noSelection) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Please Select a Village First</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose your state, district, block, and village to view detailed information.
        </p>
        <Link to="/">
          <Button>Go to Select Region</Button>
        </Link>
      </div>
    );
  }

  const households = data?.population ? Math.round(data.population / 4.5) : null;

  const stats = data
    ? [
        { icon: Users, label: "Population", value: data.population?.toLocaleString() ?? "—" },
        { icon: Home, label: "Households", value: households?.toLocaleString() ?? "—" },
        { icon: Zap, label: "Electricity", value: data.electricity_coverage != null ? `${data.electricity_coverage}%` : "—" },
        { icon: GraduationCap, label: "Schools", value: String(data.schools ?? "—") },
        { icon: Activity, label: "Health Centers", value: String(data.health_centers ?? "—") },
      ]
    : [];

  const totalFunds = auditRecords.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const spentFunds = auditRecords.filter(r => r.status === "Completed" || r.status === "Disbursed").reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const pendingFunds = totalFunds - spentFunds;

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
              No detailed data found for <strong>{village || "this village"}</strong>. Please select a valid region.
            </p>
            <Link to="/">
              <Button className="mt-4">Go to Region Selector</Button>
            </Link>
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

          {/* Location Hierarchy */}
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="funds">Funds</TabsTrigger>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Population</p>
                      <p className="text-lg font-bold">{data?.population?.toLocaleString() ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Households</p>
                      <p className="text-lg font-bold">{households?.toLocaleString() ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Area</p>
                      <p className="text-lg font-bold">{data?.area_sq_km ?? "—"} km²</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Density</p>
                      <p className="text-lg font-bold">
                        {data?.population && data?.area_sq_km
                          ? Math.round(data.population / data.area_sq_km)
                          : "—"}{" "}
                        /km²
                      </p>
                    </div>
                  </div>

                  {/* Agriculture & Resources */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <Wheat className="h-4 w-4 text-primary" /> Agriculture & Resources
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Main Crops</p>
                        <p className="text-sm font-medium">Rice, Wheat, Pulses</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Irrigation</p>
                        <p className="text-sm font-medium">{data?.water_sources ?? 0} sources</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Cultivable Land</p>
                        <p className="text-sm font-medium">{data?.area_sq_km ? (data.area_sq_km * 0.6).toFixed(1) : "—"} km²</p>
                      </div>
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
                    <Card key={o.id} className="border-primary/10 hover:shadow-md transition-shadow overflow-hidden">
                      <CardContent className="p-0">
                        <div className={`px-4 py-3 ${designationColor(o.designation)}`}>
                          <Badge variant="secondary" className="text-[10px] bg-background/20 text-inherit border-0">
                            {o.designation}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={getOfficialImage(o.designation, o.gender)}
                              alt={o.name}
                              className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
                              loading="lazy"
                              width={64}
                              height={64}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{o.name}</p>
                              <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                                {o.age && <span className="block">Age: <strong className="text-foreground">{o.age}</strong> • {o.gender}</span>}
                                {o.education && <span className="block">📚 {o.education}</span>}
                              </div>
                            </div>
                          </div>
                          {o.contact && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-primary border-t pt-2">
                              <Phone className="h-3 w-3" />
                              <span>{o.contact}</span>
                            </div>
                          )}
                        </div>
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
                  { icon: Route, label: "Road Network", value: `${data?.roads_km ?? 0} km`, desc: "Total paved and unpaved roads" },
                  { icon: Zap, label: "Electricity", value: `${data?.electricity_coverage ?? 0}%`, desc: "Household electrification coverage" },
                ].map((f) => (
                  <Card key={f.label} className="border-primary/10">
                    <CardContent className="pt-5 flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{f.label}</p>
                        <p className="text-2xl font-bold text-primary">{f.value ?? "—"}</p>
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
                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Electricity Coverage</span>
                    </div>
                    <Progress value={data?.electricity_coverage ?? 0} className="h-3" />
                    <p className="text-right text-sm font-bold text-primary mt-1">{data?.electricity_coverage ?? 0}%</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Water Supply Coverage</span>
                    </div>
                    <Progress value={Math.min(100, (data?.water_sources ?? 0) * 8)} className="h-3" />
                    <p className="text-right text-sm font-bold text-primary mt-1">{data?.water_sources ?? 0} active sources</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Road Connectivity</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{data?.roads_km ?? "—"} km</p>
                    <p className="text-xs text-muted-foreground mt-1">Total paved road network</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Geographic Area</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{data?.area_sq_km ?? "—"} km²</p>
                    <p className="text-xs text-muted-foreground mt-1">Total village area</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Funds Tab */}
            <TabsContent value="funds" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" /> Panchayat Funds
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-primary/10">
                  <CardContent className="pt-5 text-center">
                    <p className="text-xs text-muted-foreground">Total Funds</p>
                    <p className="text-xl font-bold text-primary">{totalFunds > 0 ? formatCurrency(totalFunds) : "—"}</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/10">
                  <CardContent className="pt-5 text-center">
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="text-xl font-bold text-primary">{spentFunds > 0 ? formatCurrency(spentFunds) : "—"}</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/10">
                  <CardContent className="pt-5 text-center">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-xl font-bold text-muted-foreground">{pendingFunds > 0 ? formatCurrency(pendingFunds) : "—"}</p>
                  </CardContent>
                </Card>
              </div>

              {totalFunds > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Spending Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={totalFunds > 0 ? (spentFunds / totalFunds) * 100 : 0} className="h-3" />
                    <p className="text-right text-sm text-muted-foreground mt-1">
                      {totalFunds > 0 ? Math.round((spentFunds / totalFunds) * 100) : 0}% utilized
                    </p>
                  </CardContent>
                </Card>
              )}

              {auditRecords.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Expenditure Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditRecords.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{r.activity}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")} • {r.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{r.amount ? formatCurrency(r.amount) : "—"}</p>
                            <Badge variant={r.status === "Completed" || r.status === "Disbursed" ? "secondary" : "outline"} className="text-[10px]">
                              {r.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No expenditure records available for this village yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default VillageDetails;
