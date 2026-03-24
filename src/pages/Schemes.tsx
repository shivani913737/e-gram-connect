import { schemes } from "@/data/schemes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Schemes = () => (
  <div className="mx-auto max-w-5xl px-4 py-12">
    <h1 className="mb-2 text-center text-3xl font-bold">Government Schemes</h1>
    <p className="mx-auto mb-8 max-w-xl text-center text-muted-foreground">
      Browse the latest government schemes available for rural development and welfare.
    </p>
    <div className="grid gap-6 md:grid-cols-2">
      {schemes.map((s) => (
        <Card key={s.id} className="border-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{s.name}</CardTitle>
              <Badge variant="secondary" className="shrink-0">{s.category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{s.ministry}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{s.description}</p>
            <div><strong className="text-primary">Eligibility:</strong> {s.eligibility}</div>
            <div><strong className="text-primary">Benefits:</strong> {s.benefits}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Schemes;
