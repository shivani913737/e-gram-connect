import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";
import { FileText, IndianRupee, LayoutGrid, List, Filter, TrendingUp, ClipboardList } from "lucide-react";

interface AuditRecord {
  id: string;
  activity: string;
  amount: number | null;
  category: string;
  status: string;
  created_at: string;
  village_id: string | null;
}

const categories = ["all", "roads", "water", "education", "electricity", "sanitation", "health", "general"];
const statuses = ["all", "Completed", "In Progress", "Disbursed", "pending"];

const statusColor = (s: string) => {
  if (s === "Completed" || s === "Disbursed") return "secondary";
  return "outline";
};

const categoryIcon: Record<string, string> = {
  roads: "🛣️", water: "💧", education: "📚", electricity: "⚡",
  sanitation: "🚽", health: "🏥", general: "📋",
};

const PIE_COLORS = [
  "hsl(24, 80%, 50%)", "hsl(120, 30%, 35%)", "hsl(45, 80%, 55%)",
  "hsl(200, 60%, 50%)", "hsl(340, 60%, 50%)", "hsl(280, 40%, 55%)", "hsl(160, 50%, 40%)"
];

const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Audit = () => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "card">("table");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("audit_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setRecords(data as AuditRecord[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = records.filter((r) => {
    if (filterCategory !== "all" && r.category !== filterCategory) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const totalAmount = filtered.reduce((s, r) => s + (r.amount ?? 0), 0);
  const completedAmount = filtered.filter(r => r.status === "Completed" || r.status === "Disbursed").reduce((s, r) => s + (r.amount ?? 0), 0);

  const categoryTotals = categories.filter(c => c !== "all").map((cat) => {
    const catRecords = records.filter(r => r.category === cat);
    const total = catRecords.reduce((s, r) => s + (r.amount ?? 0), 0);
    return { category: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1), total, count: catRecords.length };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCategoryTotal = Math.max(...categoryTotals.map(c => c.total), 1);

  const pieData = categoryTotals.map(c => ({ name: c.name, value: c.total }));
  const barData = categoryTotals.map(c => ({ name: c.name, amount: c.total, projects: c.count }));

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Audit & Records</h1>
          <p className="text-sm text-muted-foreground">Public records of village activities and expenditures</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
        {[
          { icon: ClipboardList, label: "Total Records", value: String(records.length) },
          { icon: IndianRupee, label: "Total Expenditure", value: formatCurrency(totalAmount) },
          { icon: TrendingUp, label: "Utilization Rate", value: `${totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0}%` },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-0 shadow-md">
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

      {/* Charts */}
      {categoryTotals.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Spending Distribution</CardTitle>
            </CardHeader>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Category-wise Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, name: string) => name === "projects" ? v : formatCurrency(v)} />
                    <Bar dataKey="amount" fill="hsl(24, 80%, 50%)" radius={[6, 6, 0, 0]} name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Progress */}
      <Card className="rounded-2xl border-0 shadow-md mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" /> Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryTotals.map((c) => (
            <div key={c.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize font-medium">
                  {categoryIcon[c.category] || "📋"} {c.category}
                  <Badge variant="outline" className="text-[10px] rounded-lg">{c.count} projects</Badge>
                </span>
                <span className="font-semibold">{formatCurrency(c.total)}</span>
              </div>
              <Progress value={(c.total / maxCategoryTotal) * 100} className="h-2 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filters:</span>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All Categories" : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-1">
          <Button variant={view === "table" ? "default" : "outline"} size="icon" onClick={() => setView("table")} className="rounded-xl">
            <List className="h-4 w-4" />
          </Button>
          <Button variant={view === "card" ? "default" : "outline"} size="icon" onClick={() => setView("card")} className="rounded-xl">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-medium">{filtered.length} records found</p>

      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No records match your filters.</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting the category or status filter.</p>
          </CardContent>
        </Card>
      ) : view === "table" ? (
        <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="font-medium text-sm">{r.activity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] rounded-lg">
                          {categoryIcon[r.category]} {r.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{r.amount ? formatCurrency(r.amount) : "—"}</TableCell>
                      <TableCell><Badge variant={statusColor(r.status)} className="rounded-lg">{r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="capitalize text-[10px] rounded-lg">
                    {categoryIcon[r.category]} {r.category}
                  </Badge>
                  <Badge variant={statusColor(r.status)} className="text-[10px] rounded-lg">{r.status}</Badge>
                </div>
                <p className="font-semibold text-sm mb-1">{r.activity}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-xl font-bold text-primary">{r.amount ? formatCurrency(r.amount) : "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Audit;
