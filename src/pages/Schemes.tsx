import { useState } from "react";
import { schemes } from "@/data/schemes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, CheckCircle, ClipboardList, Users } from "lucide-react";

const categories = [...new Set(schemes.map((s) => s.category))];

const Schemes = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = schemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || s.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Government Schemes</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Browse {schemes.length} government schemes for rural development, welfare, and empowerment.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing {filtered.length} scheme{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((s) => (
          <Card key={s.id} className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{s.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0 text-[10px]">{s.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{s.ministry}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{s.description}</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-primary text-xs">Eligibility</span>
                    <p className="text-muted-foreground text-xs">{s.eligibility}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-secondary text-xs">Benefits</span>
                    <p className="text-muted-foreground text-xs">{s.benefits}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ClipboardList className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-xs">How to Apply</span>
                    <p className="text-muted-foreground text-xs">{s.applicationProcess}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No schemes found matching your search.
        </div>
      )}
    </div>
  );
};

export default Schemes;
