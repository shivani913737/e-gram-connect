import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin, Users, Droplets, Zap, GraduationCap, Activity } from "lucide-react";

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

const VillageDetails = () => {
  const [params] = useSearchParams();
  const state = params.get("state") || "N/A";
  const district = params.get("district") || "N/A";
  const block = params.get("block") || "N/A";
  const village = params.get("village") || "N/A";
  const id = params.get("id");

  const [data, setData] = useState<VillageData | null>(null);
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
      } else {
        setData(result);
      }
      setLoading(false);
    };
    fetchVillage();
  }, [id, village, state, district, block]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-4">
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <MapPin className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{data?.name ?? village}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">{data?.block ?? block}</Badge>
            <Badge variant="outline">{data?.district ?? district}</Badge>
            <Badge variant="secondary">{data?.state ?? state}</Badge>
          </div>
        </div>
      </div>

      {notFound ? (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No detailed data found for <strong>{village}</strong>. Data may not have been added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5 mb-8">
            {stats.map((s) => (
              <Card key={s.label} className="text-center border-primary/10">
                <CardContent className="pt-4">
                  <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-semibold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Infrastructure Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Area</TableCell>
                    <TableCell>{data?.area_sq_km ?? "N/A"} sq. km</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Roads</TableCell>
                    <TableCell>{data?.roads_km ?? "N/A"} km</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Health Centers</TableCell>
                    <TableCell>{data?.health_centers ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Water Sources</TableCell>
                    <TableCell>{data?.water_sources ?? "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Electricity Coverage</TableCell>
                    <TableCell>{data?.electricity_coverage != null ? `${data.electricity_coverage}%` : "N/A"}</TableCell>
                  </TableRow>
                  {data?.description && (
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>{data.description}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default VillageDetails;
