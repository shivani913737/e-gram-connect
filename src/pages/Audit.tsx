import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";

const records = [
  { id: "AUD-001", date: "2026-03-15", type: "Road Construction", amount: "₹12,50,000", status: "Completed" },
  { id: "AUD-002", date: "2026-02-20", type: "Toilet Construction (SBM)", amount: "₹3,60,000", status: "In Progress" },
  { id: "AUD-003", date: "2026-01-10", type: "Drinking Water Pipeline", amount: "₹8,00,000", status: "Completed" },
  { id: "AUD-004", date: "2025-12-05", type: "School Renovation", amount: "₹5,25,000", status: "Completed" },
  { id: "AUD-005", date: "2025-11-18", type: "MGNREGA Wages", amount: "₹2,40,000", status: "Disbursed" },
  { id: "AUD-006", date: "2025-10-01", type: "Solar Street Lights", amount: "₹4,80,000", status: "In Progress" },
];

const statusColor = (s: string) => {
  if (s === "Completed" || s === "Disbursed") return "secondary";
  return "outline";
};

const Audit = () => (
  <div className="mx-auto max-w-5xl px-4 py-12">
    <div className="mb-8 flex items-center gap-3">
      <FileText className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Audit & Records</h1>
        <p className="text-sm text-muted-foreground">Public records of village activities and expenditures</p>
      </div>
    </div>

    <Card>
      <CardHeader><CardTitle className="text-base">Recent Activities</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell><Badge variant={statusColor(r.status)}>{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default Audit;
