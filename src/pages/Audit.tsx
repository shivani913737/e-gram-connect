import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, IndianRupee, LayoutGrid, List, Filter } from "lucide-react";

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

  // Category-wise breakdown
  const categoryTotals = categories.filter(c => c !== "all").map((cat) => {
    const catRecords = records.filter(r => r.category === cat);
    const total = catRecords.reduce((s, r) => s + (r.amount ?? 0), 0);
    return { category: cat, total, count: catRecords.length };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCategoryTotal = Math.max(...categoryTotals.map(c => c.total), 1);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Audit & Records</h1>
          <p className="text-sm text-muted-foreground">Public records of village activities and expenditures across all panchayats</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="border-primary/10">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold text-primary">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-muted-foreground">Total Expenditure</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-muted-foreground">Utilization Rate</p>
            <p className="text-2xl font-bold text-primary">
              {totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Spending */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" /> Category-wise Spending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryTotals.map((c) => (
            <div key={c.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize">
                  {categoryIcon[c.category] || "📋"} {c.category}
                  <Badge variant="outline" className="text-[10px]">{c.count} projects</Badge>
                </span>
                <span className="font-semibold">{formatCurrency(c.total)}</span>
              </div>
              <Progress value={(c.total / maxCategoryTotal) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All Categories" : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-1">
          <Button variant={view === "table" ? "default" : "outline"} size="icon" onClick={() => setView("table")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={view === "card" ? "default" : "outline"} size="icon" onClick={() => setView("card")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} records found</p>

      {/* Table View */}
      {view === "table" ? (
        <Card>
          <CardContent className="p-0">
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
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="font-medium text-sm">{r.activity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {categoryIcon[r.category]} {r.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{r.amount ? formatCurrency(r.amount) : "—"}</TableCell>
                    <TableCell><Badge variant={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="border-primary/10 hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {categoryIcon[r.category]} {r.category}
                  </Badge>
                  <Badge variant={statusColor(r.status)} className="text-[10px]">{r.status}</Badge>
                </div>
                <p className="font-semibold text-sm mb-1">{r.activity}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-lg font-bold text-primary">{r.amount ? formatCurrency(r.amount) : "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Audit;
