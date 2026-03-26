import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  MapPin, FileText, BookOpen, LogOut, LayoutDashboard, Loader2,
  Users, IndianRupee, Building2, Search, Bell, TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalVillages: number;
  totalFunds: number;
  spentFunds: number;
  totalOfficials: number;
  totalProjects: number;
}

const quickLinks = [
  { icon: MapPin, title: "Village Details", desc: "View and manage village information", to: "/village" },
  { icon: BookOpen, title: "Government Schemes", desc: "Browse available schemes", to: "/schemes" },
  { icon: FileText, title: "Audit / Records", desc: "View village records and activities", to: "/audit" },
];

const notifications = [
  { text: "PM Awas Yojana: New applications open for 2026-27", date: "Mar 20, 2026" },
  { text: "MGNREGA wages for Q4 disbursed to 42 villages", date: "Mar 15, 2026" },
  { text: "Swachh Bharat Mission Phase 3 guidelines released", date: "Mar 10, 2026" },
  { text: "Solar pump subsidy scheme extended till Dec 2026", date: "Mar 05, 2026" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; state: string; district: string; block: string; id: string }[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [villagesRes, auditsRes, officialsRes] = await Promise.all([
        supabase.from("villages").select("id", { count: "exact", head: true }),
        supabase.from("audit_records").select("amount, status"),
        supabase.from("village_officials").select("id", { count: "exact", head: true }),
      ]);

      const totalFunds = (auditsRes.data ?? []).reduce((s: number, r: { amount: number | null }) => s + (r.amount ?? 0), 0);
      const spentFunds = (auditsRes.data ?? [])
        .filter((r: { status: string }) => r.status === "Completed" || r.status === "Disbursed")
        .reduce((s: number, r: { amount: number | null }) => s + (r.amount ?? 0), 0);

      setStats({
        totalVillages: villagesRes.count ?? 0,
        totalFunds,
        spentFunds,
        totalOfficials: officialsRes.count ?? 0,
        totalProjects: auditsRes.data?.length ?? 0,
      });
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.user_metadata?.full_name || user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-8">
          <Card className="border-primary/10">
            <CardContent className="pt-5 text-center">
              <Building2 className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">Total Villages</p>
              <p className="text-2xl font-bold">{stats.totalVillages}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="pt-5 text-center">
              <IndianRupee className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">Total Funds</p>
              <p className="text-2xl font-bold">₹{(stats.totalFunds / 100000).toFixed(1)}L</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="pt-5 text-center">
              <TrendingUp className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">Projects</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="pt-5 text-center">
              <Users className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">Officials</p>
              <p className="text-2xl font-bold">{stats.totalOfficials}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fund Utilization */}
      {stats && stats.totalFunds > 0 && (
        <Card className="mb-8 border-primary/10">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fund Utilization</span>
              <span className="text-sm font-bold text-primary">{utilization}%</span>
            </div>
            <Progress value={utilization} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              ₹{(stats.spentFunds / 100000).toFixed(1)}L spent of ₹{(stats.totalFunds / 100000).toFixed(1)}L total
            </p>
          </CardContent>
        </Card>
      )}

      {/* Village Search */}
      <Card className="mb-8 border-primary/10">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Search Village</span>
          </div>
          <Input
            placeholder="Type village name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searching && <p className="text-xs text-muted-foreground mt-2">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((v) => (
                <Link
                  key={v.id}
                  to={`/village?id=${v.id}&state=${encodeURIComponent(v.state)}&district=${encodeURIComponent(v.district)}&block=${encodeURIComponent(v.block)}&village=${encodeURIComponent(v.name)}`}
                  className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.block}, {v.district}, {v.state}</p>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        {quickLinks.map((item) => (
          <Link key={item.title} to={item.to}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg hover:border-primary/30">
              <CardHeader className="items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5">New</Badge>
              <div>
                <p className="text-sm">{n.text}</p>
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
