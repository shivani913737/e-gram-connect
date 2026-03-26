import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegionSelector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  // Fetch distinct states on mount
  useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("state")
        .order("state");
      if (!error && data) {
        const unique = [...new Set(data.map((r) => r.state))];
        setStates(unique);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!state) { setDistricts([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("regions")
        .select("district")
        .eq("state", state)
        .order("district");
      if (data) setDistricts([...new Set(data.map((r) => r.district))]);
    };
    fetch();
  }, [state]);

  // Fetch blocks when district changes
  useEffect(() => {
    if (!district) { setBlocks([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("regions")
        .select("block")
        .eq("state", state)
        .eq("district", district)
        .order("block");
      if (data) setBlocks([...new Set(data.map((r) => r.block))]);
    };
    fetch();
  }, [district, state]);

  // Fetch villages when block changes
  useEffect(() => {
    if (!block) { setVillages([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("regions")
        .select("village")
        .eq("state", state)
        .eq("district", district)
        .eq("block", block)
        .order("village");
      if (data) setVillages([...new Set(data.map((r) => r.village))]);
    };
    fetch();
  }, [block, state, district]);

  const handleFetch = async () => {
    if (!state || !district || !block || !village) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("villages")
      .select("id")
      .eq("name", village)
      .eq("state", state)
      .eq("district", district)
      .eq("block", block)
      .maybeSingle();

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to fetch village details.", variant: "destructive" });
      return;
    }

    // Save selection to localStorage
    localStorage.setItem("selectedRegion", JSON.stringify({ state, district, block, village, id: data?.id ?? null }));

    navigate(`/village?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&block=${encodeURIComponent(block)}&village=${encodeURIComponent(village)}${data ? `&id=${data.id}` : ""}`);
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
              {states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">District (Zilla)</label>
          <Select value={district} onValueChange={(v) => { setDistrict(v); setBlock(""); setVillage(""); }} disabled={!state}>
            <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Block</label>
          <Select value={block} onValueChange={(v) => { setBlock(v); setVillage(""); }} disabled={!district}>
            <SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger>
            <SelectContent>
              {blocks.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Village</label>
          <Select value={village} onValueChange={setVillage} disabled={!block}>
            <SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger>
            <SelectContent>
              {villages.map((v) => (
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
