import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin, Users, Home, Droplets, Zap, GraduationCap } from "lucide-react";

const VillageDetails = () => {
  const [params] = useSearchParams();
  const state = params.get("state") || "N/A";
  const district = params.get("district") || "N/A";
  const block = params.get("block") || "N/A";
  const village = params.get("village") || "N/A";

  // Mock village data
  const data = {
    population: Math.floor(Math.random() * 5000) + 1000,
    households: Math.floor(Math.random() * 800) + 200,
    area: (Math.random() * 50 + 10).toFixed(1),
    waterSupply: "Piped + Handpump",
    electricity: "24/7 Grid Connected",
    schools: Math.floor(Math.random() * 3) + 1,
    healthCentre: "Primary Health Centre",
    roadType: "Pucca (Bituminous)",
  };

  const stats = [
    { icon: Users, label: "Population", value: data.population.toLocaleString() },
    { icon: Home, label: "Households", value: data.households.toLocaleString() },
    { icon: Droplets, label: "Water Supply", value: data.waterSupply },
    { icon: Zap, label: "Electricity", value: data.electricity },
    { icon: GraduationCap, label: "Schools", value: String(data.schools) },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <MapPin className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{village}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">{block}</Badge>
            <Badge variant="outline">{district}</Badge>
            <Badge variant="secondary">{state}</Badge>
          </div>
        </div>
      </div>

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
        <CardHeader><CardTitle className="text-base">Infrastructure Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Area</TableCell><TableCell>{data.area} sq. km</TableCell></TableRow>
              <TableRow><TableCell>Road Connectivity</TableCell><TableCell>{data.roadType}</TableCell></TableRow>
              <TableRow><TableCell>Health Facility</TableCell><TableCell>{data.healthCentre}</TableCell></TableRow>
              <TableRow><TableCell>Water Supply</TableCell><TableCell>{data.waterSupply}</TableCell></TableRow>
              <TableRow><TableCell>Electrification</TableCell><TableCell>{data.electricity}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VillageDetails;
