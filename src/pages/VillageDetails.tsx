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
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";
import {
  ArrowLeft, MapPin, Users, Droplets, Zap, GraduationCap, Activity,
  Building2, Route, Phone, User, ChevronRight, Landmark, TrendingUp,
  Home, Wheat, IndianRupee, AlertCircle
} from "lucide-react";

import sarpanchMale from "@/assets/officials/sarpanch-male.png";
import sarpanchFemale from "@/assets/officials/sarpanch-female.png";
import officerMale from "@/assets/officials/officer-male.png";
import officerFemale from "@/assets/officials/officer-female.png";

interface VillageData {
  id: string; name: string; state: string; district: string; block: string;
  population: number | null; area_sq_km: number | null; water_sources: number | null;
  schools: number | null; health_centers: number | null; roads_km: number | null;
  electricity_coverage: number | null; description: string | null;
}

interface Official {
  id: string; name: string; designation: string; age: number | null;
  gender: string | null; education: string | null; contact: string | null; image_url: string | null;
}

interface AuditRecord {
  id: string; activity: string; amount: number | null; category: string;
  status: string; created_at: string;
}

const getOfficialImage = (designation: string, gender: string | null) => {
  const isFemale = gender?.toLowerCase() === "female";
  if (designation === "Sarpanch" || designation === "Up-Sarpanch") return isFemale ? sarpanchFemale : sarpanchMale;
  return isFemale ? officerFemale : officerMale;
};

const designationColor = (d: string) => {
  switch (d) {
    case "Sarpanch": return "bg-primary text-primary-foreground";
    case "Up-Sarpanch": return "bg-secondary text-secondary-foreground";
    case "Gram Sevak": return "bg-accent text-accent-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const categoryIcon: Record<string, string> = {
  roads: "🛣️", water: "💧", education: "📚", electricity: "⚡",
  sanitation: "🚽", health: "🏥", general: "📋",
};

const PIE_COLORS = [
  "hsl(24, 80%, 50%)", "hsl(120, 30%, 35%)", "hsl(45, 80%, 55%)",
  "hsl(200, 60%, 50%)", "hsl(340, 60%, 50%)", "hsl(280, 40%, 55%)", "hsl(160, 50%, 40%)"
];

const VillageDetails = () => {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<VillageData | null>(null);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSelection, setNoSelection] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const state = params.get("state") || "";
  const district = params.get("district") || "";
  const block = params.get("block") || "";
  const village = params.get("village") || "";
  const id = params.get("id");

  useEffect(() => {
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
          return;
        } catch { /* ignore */ }
      }
      setLoading(false);
      setNoSelection(true);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setNoSelection(false);
      let query = supabase.from("villages").select("*");
      if (id) query = query.eq("id", id);
      else query = query.eq("name", village).eq("state", state).eq("district", district).eq("block", block);

      const { data: result, error } = await query.maybeSingle();
      if (error || !result) { setNotFound(true); setLoading(false); return; }

      setData(result);
      localStorage.setItem("selectedRegion", JSON.stringify({
        state: result.state, district: result.district, block: result.block,
        village: result.name, id: result.id,
      }));

      const [officialsRes, auditRes] = await Promise.all([
        supabase.from("village_officials").select("*").eq("village_id", result.id).order("designation"),
        supabase.from("audit_records").select("*").eq("village_id", result.id).order("created_at", { ascending: false }),
      ]);

      if (officialsRes.data) setOfficials(officialsRes.data as Official[]);
      if (auditRes.data) setAuditRecords(auditRes.data as AuditRecord[]);
      setLoading(false);
    };
    fetchAll();
  }, [id, village, state, district, block, setParams]);

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  /* No village selected */
  if (noSelection) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Please Select a Village First</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Choose your state, district, block, and village to view detailed information about population, facilities, officials, and funds.
        </p>
        <Link to="/"><Button size="lg" className="rounded-xl px-8">Go to Select Region</Button></Link>
      </div>
    );
  }

  const households = data?.population ? Math.round(data.population / 4.5) : null;

  const stats = data ? [
    { icon: Users, label: "Population", value: data.population?.toLocaleString() ?? "—" },
    { icon: Home, label: "Households", value: households?.toLocaleString() ?? "—" },
    { icon: Zap, label: "Electricity", value: data.electricity_coverage != null ? `${data.electricity_coverage}%` : "—" },
    { icon: GraduationCap, label: "Schools", value: data.schools != null ? String(data.schools) : "—" },
    { icon: Activity, label: "Health Centers", value: data.health_centers != null ? String(data.health_centers) : "—" },
  ] : [];

  const totalFunds = auditRecords.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const spentFunds = auditRecords.filter(r => r.status === "Completed" || r.status === "Disbursed").reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const pendingFunds = totalFunds - spentFunds;

  const categoryBreakdown = Object.entries(
    auditRecords.reduce<Record<string, { total: number; spent: number }>>((acc, r) => {
      if (!acc[r.category]) acc[r.category] = { total: 0, spent: 0 };
      acc[r.category].total += r.amount ?? 0;
      if (r.status === "Completed" || r.status === "Disbursed") acc[r.category].spent += r.amount ?? 0;
      return acc;
    }, {})
  ).sort((a, b) => b[1].total - a[1].total);

  const pieData = categoryBreakdown.map(([name, vals]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: vals.total
  }));

  const barData = categoryBreakdown.map(([name, vals]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    spent: vals.spent,
    remaining: vals.total - vals.spent,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link to="/"><Button variant="ghost" size="sm" className="mb-4 rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-2">
          <span>{data?.state ?? state}</span><ChevronRight className="h-3 w-3" />
          <span>{data?.district ?? district}</span><ChevronRight className="h-3 w-3" />
          <span>{data?.block ?? block}</span><ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{data?.name ?? village}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{data?.name ?? village}</h1>
            <p className="text-sm text-muted-foreground">{data?.block ?? block} Block, {data?.district ?? district} District</p>
          </div>
        </div>
      </div>

      {notFound ? (
        <Card className="rounded-2xl border-destructive/30 shadow-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive/60" />
            <h3 className="text-lg font-semibold mb-2">Village Data Not Available</h3>
            <p className="text-sm text-muted-foreground mb-6">We couldn't find detailed records for <strong>{village || "this village"}</strong>. Please try selecting another village.</p>
            <Link to="/"><Button className="rounded-xl">Go to Region Selector</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-8">
            {stats.map((s) => (
              <Card key={s.label} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Location Hierarchy */}
          <Card className="mb-8 rounded-2xl border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-5 sm:p-6">
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
                      <div className={`rounded-xl px-4 py-3 text-center ${i === 3 ? "bg-primary text-primary-foreground shadow-md" : "bg-card border shadow-sm"}`}>
                        <p className={`text-[10px] uppercase tracking-wider ${i === 3 ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{item.label}</p>
                        <p className="font-semibold text-sm">{item.value ?? "—"}</p>
                      </div>
                      {i < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />}
                    </div>
                  ))}
                </div>
                {data?.area_sq_km && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Total area: <strong>{data.area_sq_km} sq. km</strong> • Road connectivity: <strong>{data.roads_km ?? 0} km</strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 rounded-xl h-auto p-1">
              <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm py-2">Overview</TabsTrigger>
              <TabsTrigger value="people" className="rounded-lg text-xs sm:text-sm py-2">People</TabsTrigger>
              <TabsTrigger value="facilities" className="rounded-lg text-xs sm:text-sm py-2">Facilities</TabsTrigger>
              <TabsTrigger value="development" className="rounded-lg text-xs sm:text-sm py-2 hidden sm:block">Development</TabsTrigger>
              <TabsTrigger value="funds" className="rounded-lg text-xs sm:text-sm py-2 hidden sm:block">Funds</TabsTrigger>
            </TabsList>
            {/* Extra row for mobile */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Tabs defaultValue="overview">
                <TabsList className="w-full rounded-xl h-auto p-1">
                  <TabsTrigger value="development" className="rounded-lg text-xs w-full py-2"
                    onClick={() => {
                      const el = document.querySelector('[data-state="active"][value="development"]');
                      if (!el) {
                        // programmatic click on real tab
                        const trigger = document.querySelector('button[value="development"]') as HTMLElement;
                        trigger?.click();
                      }
                    }}
                  >Development</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="rounded-2xl border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" /> About {data?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data?.description || "A vibrant rural village contributing to India's grassroots governance through its gram panchayat system."}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {[
                      { label: "Population", value: data?.population?.toLocaleString() ?? "—" },
                      { label: "Households", value: households?.toLocaleString() ?? "—" },
                      { label: "Area", value: data?.area_sq_km ? `${data.area_sq_km} km²` : "—" },
                      { label: "Density", value: data?.population && data?.area_sq_km ? `${Math.round(data.population / data.area_sq_km)} /km²` : "—" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <Wheat className="h-4 w-4 text-primary" /> Agriculture & Resources
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">Main Crops</p>
                        <p className="text-sm font-medium">Rice, Wheat, Pulses</p>
                      </div>
                      <div className="rounded-xl border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">Irrigation</p>
                        <p className="text-sm font-medium">{data?.water_sources ?? 0} sources</p>
                      </div>
                      <div className="rounded-xl border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">Cultivable Land</p>
                        <p className="text-sm font-medium">{data?.area_sq_km ? (data.area_sq_km * 0.6).toFixed(1) : "—"} km²</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* People */}
            <TabsContent value="people" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Village Officials & Key Members
              </h3>
              {officials.length === 0 ? (
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">No officials data available yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Official records will appear here once published.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {officials.map((o) => (
                    <Card key={o.id} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
                      <CardContent className="p-0">
                        <div className={`px-4 py-3 ${designationColor(o.designation)}`}>
                          <Badge variant="secondary" className="text-[10px] bg-background/20 text-inherit border-0 rounded-lg">{o.designation}</Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <img src={getOfficialImage(o.designation, o.gender)} alt={o.name}
                              className="h-16 w-16 rounded-xl object-cover border-2 border-primary/20 shrink-0"
                              loading="lazy" width={64} height={64} />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{o.name}</p>
                              <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                                {o.age && <span className="block">Age: <strong className="text-foreground">{o.age}</strong> • {o.gender ?? ""}</span>}
                                {o.education && <span className="block">📚 {o.education}</span>}
                              </div>
                            </div>
                          </div>
                          {o.contact && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-primary border-t pt-2">
                              <Phone className="h-3 w-3" /><span>{o.contact}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Facilities */}
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
                  <Card key={f.label} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <f.icon className="h-6 w-6 text-primary" />
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

            {/* Development */}
            <TabsContent value="development" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Development Data
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Zap, label: "Electricity Coverage", value: data?.electricity_coverage ?? 0, suffix: "%", isProgress: true },
                  { icon: Droplets, label: "Water Supply Coverage", value: Math.min(100, (data?.water_sources ?? 0) * 8), suffix: `${data?.water_sources ?? 0} active sources`, isProgress: true },
                ].map((item) => (
                  <Card key={item.label} className="rounded-2xl border-0 shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <Progress value={item.value} className="h-3 rounded-full" />
                      <p className="text-right text-sm font-bold text-primary mt-2">{item.isProgress ? `${item.value}%` : item.suffix}</p>
                      {item.suffix && item.isProgress && <p className="text-right text-xs text-muted-foreground">{item.suffix}</p>}
                    </CardContent>
                  </Card>
                ))}
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3"><Route className="h-5 w-5 text-primary" /><span className="font-semibold">Road Connectivity</span></div>
                    <p className="text-4xl font-bold text-primary">{data?.roads_km ?? "—"} <span className="text-base font-normal text-muted-foreground">km</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Total paved road network</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3"><MapPin className="h-5 w-5 text-primary" /><span className="font-semibold">Geographic Area</span></div>
                    <p className="text-4xl font-bold text-primary">{data?.area_sq_km ?? "—"} <span className="text-base font-normal text-muted-foreground">km²</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Total village area</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Funds */}
            <TabsContent value="funds" className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" /> Panchayat Funds
              </h3>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {[
                  { label: "Total Funds", value: totalFunds, color: "text-primary" },
                  { label: "Spent", value: spentFunds, color: "text-secondary" },
                  { label: "Remaining", value: pendingFunds, color: "text-muted-foreground" },
                ].map(f => (
                  <Card key={f.label} className="rounded-2xl border-0 shadow-md">
                    <CardContent className="p-5 text-center">
                      <p className="text-xs text-muted-foreground font-medium">{f.label}</p>
                      <p className={`text-2xl font-bold ${f.color}`}>{f.value > 0 ? formatCurrency(f.value) : "—"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalFunds > 0 && (
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Spending Utilization</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold text-primary">{Math.round((spentFunds / totalFunds) * 100)}%</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(spentFunds)} of {formatCurrency(totalFunds)}</span>
                    </div>
                    <Progress value={(spentFunds / totalFunds) * 100} className="h-3 rounded-full" />
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              {pieData.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="rounded-2xl border-0 shadow-md">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Fund Distribution</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {pieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 shadow-md">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Spent vs Remaining</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                            <Bar dataKey="spent" stackId="a" fill="hsl(120, 30%, 35%)" radius={[0, 0, 0, 0]} name="Spent" />
                            <Bar dataKey="remaining" stackId="a" fill="hsl(24, 80%, 50%)" radius={[6, 6, 0, 0]} name="Remaining" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Category-wise Spending */}
              {categoryBreakdown.length > 0 && (
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardHeader><CardTitle className="text-base">Category-wise Spending</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {categoryBreakdown.map(([cat, vals]) => {
                      const pct = totalFunds > 0 ? Math.round((vals.total / totalFunds) * 100) : 0;
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 capitalize font-medium">
                              {categoryIcon[cat] || "📋"} {cat}
                              <Badge variant="outline" className="text-[10px] rounded-lg">{pct}%</Badge>
                            </span>
                            <span className="font-semibold">{formatCurrency(vals.total)}</span>
                          </div>
                          <Progress value={pct} className="h-2 rounded-full" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {auditRecords.length > 0 ? (
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardHeader><CardTitle className="text-base">Recent Expenditure Records</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {auditRecords.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/30 transition-colors">
                          <div>
                            <p className="text-sm font-medium">{r.activity}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString("en-IN")} •
                              <span className="capitalize"> {categoryIcon[r.category] || ""} {r.category}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{r.amount ? formatCurrency(r.amount) : "—"}</p>
                            <Badge variant={r.status === "Completed" || r.status === "Disbursed" ? "secondary" : "outline"} className="text-[10px] rounded-lg">{r.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-2xl border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <IndianRupee className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">No expenditure records available for this village yet.</p>
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
