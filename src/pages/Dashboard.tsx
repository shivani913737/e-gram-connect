import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";
import {
  MapPin, FileText, BookOpen, LogOut, LayoutDashboard, Loader2,
  Users, IndianRupee, Building2, Search, Bell, TrendingUp, ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalVillages: number;
  totalFunds: number;
  spentFunds: number;
  totalOfficials: number;
  totalProjects: number;
  categoryData: { name: string; value: number }[];
}

const quickLinks = [
  { icon: MapPin, title: "Village Details", desc: "View and manage village information", to: "/village", color: "bg-primary/10 text-primary" },
  { icon: BookOpen, title: "Government Schemes", desc: "Browse available schemes", to: "/schemes", color: "bg-secondary/10 text-secondary" },
  { icon: FileText, title: "Audit / Records", desc: "View village records and activities", to: "/audit", color: "bg-accent/20 text-accent-foreground" },
];

const notifications = [
  { text: "PM Awas Yojana: New applications open for 2026-27", date: "Mar 20, 2026" },
  { text: "MGNREGA wages for Q4 disbursed to 42 villages", date: "Mar 15, 2026" },
  { text: "Swachh Bharat Mission Phase 3 guidelines released", date: "Mar 10, 2026" },
  { text: "Solar pump subsidy scheme extended till Dec 2026", date: "Mar 05, 2026" },
];

const PIE_COLORS = [
  "hsl(24, 80%, 50%)", "hsl(120, 30%, 35%)", "hsl(45, 80%, 55%)",
  "hsl(200, 60%, 50%)", "hsl(340, 60%, 50%)", "hsl(280, 40%, 55%)", "hsl(160, 50%, 40%)"
];

const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; state: string; district: string; block: string; id: string }[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [villagesRes, auditsRes, officialsRes] = await Promise.all([
        supabase.from("villages").select("id", { count: "exact", head: true }),
        supabase.from("audit_records").select("amount, status, category"),
        supabase.from("village_officials").select("id", { count: "exact", head: true }),
      ]);

      const audits = auditsRes.data ?? [];
      const totalFunds = audits.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
      const spentFunds = audits
        .filter((r: any) => r.status === "Completed" || r.status === "Disbursed")
        .reduce((s: number, r: any) => s + (r.amount ?? 0), 0);

      const catMap: Record<string, number> = {};
      audits.forEach((r: any) => {
        catMap[r.category] = (catMap[r.category] ?? 0) + (r.amount ?? 0);
      });
      const categoryData = Object.entries(catMap)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        .sort((a, b) => b.value - a.value);

      setStats({
        totalVillages: villagesRes.count ?? 0,
        totalFunds,
        spentFunds,
        totalOfficials: officialsRes.count ?? 0,
        totalProjects: audits.length,
        categoryData,
      });
      setLoading(false);
    };
    if (user) fetchStats();
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("villages")
        .select("id, name, state, district, block")
        .ilike("name", `%${searchQuery}%`)
        .limit(5);
      setSearchResults(data ?? []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const utilization = stats && stats.totalFunds > 0 ? Math.round((stats.spentFunds / stats.totalFunds) * 100) : 0;

  const statCards = stats ? [
    { icon: Building2, label: "Total Villages", value: stats.totalVillages, suffix: "" },
    { icon: IndianRupee, label: "Total Funds", value: `₹${(stats.totalFunds / 100000).toFixed(1)}L`, suffix: "" },
    { icon: TrendingUp, label: "Projects", value: stats.totalProjects, suffix: "" },
    { icon: Users, label: "Officials", value: stats.totalOfficials, suffix: "" },
  ] : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.user_metadata?.full_name || user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="self-start sm:self-center">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((s) => (
            <Card key={s.label} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fund Utilization + Pie Chart */}
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : stats && stats.totalFunds > 0 && (
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" /> Fund Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">{utilization}%</p>
                  <p className="text-xs text-muted-foreground">utilized</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Spent: <span className="font-semibold text-foreground">{formatCurrency(stats.spentFunds)}</span></p>
                  <p className="text-muted-foreground">Total: <span className="font-semibold text-foreground">{formatCurrency(stats.totalFunds)}</span></p>
                </div>
              </div>
              <Progress value={utilization} className="h-3 rounded-full" />
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fund Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.categoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bar Chart */}
      {!loading && stats && stats.categoryData.length > 0 && (
        <Card className="rounded-2xl border-0 shadow-md mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Category-wise Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="hsl(24, 80%, 50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Village Search */}
      <Card className="rounded-2xl border-0 shadow-md mb-8">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Search Village</span>
          </div>
          <Input
            placeholder="Type village name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl"
          />
          {searching && (
            <div className="flex items-center gap-2 mt-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Searching...</span>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {searchResults.map((v) => (
                <Link
                  key={v.id}
                  to={`/village?id=${v.id}&state=${encodeURIComponent(v.state)}&district=${encodeURIComponent(v.district)}&block=${encodeURIComponent(v.block)}&village=${encodeURIComponent(v.name)}`}
                  className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.block}, {v.district}, {v.state}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {quickLinks.map((item) => (
          <Link key={item.title} to={item.to}>
            <Card className="h-full rounded-2xl border-0 shadow-md cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader className="items-center text-center pb-2">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      <Card className="rounded-2xl border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors">
              <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5 rounded-lg">New</Badge>
              <div>
                <p className="text-sm leading-snug">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
