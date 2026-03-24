import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { regionData } from "@/data/regions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2 } from "lucide-react";

const RegionSelector = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedState = regionData.states.find((s) => s.name === state);
  const selectedDistrict = selectedState?.districts.find((d) => d.name === district);
  const selectedBlock = selectedDistrict?.blocks.find((b) => b.name === block);

  const handleFetch = () => {
    if (!state || !district || !block || !village) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/village?state=${state}&district=${district}&block=${block}&village=${village}`);
    }, 800);
  };

  return (
    <Card className="w-full max-w-md border-primary/20 bg-card/95 shadow-xl backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Select Your Region</CardTitle>
        <CardDescription>Choose your location to explore village details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">State</label>
          <Select value={state} onValueChange={(v) => { setState(v); setDistrict(""); setBlock(""); setVillage(""); }}>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>
              {regionData.states.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">District (Zilla)</label>
          <Select value={district} onValueChange={(v) => { setDistrict(v); setBlock(""); setVillage(""); }} disabled={!state}>
            <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>
              {selectedState?.districts.map((d) => (
                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Block</label>
          <Select value={block} onValueChange={(v) => { setBlock(v); setVillage(""); }} disabled={!district}>
            <SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger>
            <SelectContent>
              {selectedDistrict?.blocks.map((b) => (
                <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Village</label>
          <Select value={village} onValueChange={setVillage} disabled={!block}>
            <SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger>
            <SelectContent>
              {selectedBlock?.villages.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          onClick={handleFetch}
          disabled={!state || !district || !block || !village || loading}
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</> : "Fetch Details"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RegionSelector;
