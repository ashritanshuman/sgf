import { useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, Database, Trash2, RefreshCcw, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUniversities, type UniversityRow } from "@/hooks/useUniversities";
import { normalizeUniversityName } from "@/lib/normalizeUniversity";

interface ParsedEntry {
  name: string;
  country?: string | null;
  aliases?: string[] | null;
}

const parseCSV = (text: string): ParsedEntry[] => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  // Detect header
  const first = lines[0].toLowerCase();
  const hasHeader = /name/.test(first) && first.includes(",");
  const splitLine = (line: string) => {
    // Simple CSV split that respects double quotes
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === "," && !inQ) {
        out.push(cur); cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };
  let header: string[] = [];
  let dataLines = lines;
  if (hasHeader) {
    header = splitLine(lines[0]).map((h) => h.toLowerCase());
    dataLines = lines.slice(1);
  }
  const idx = (k: string) => header.indexOf(k);
  return dataLines.map((line) => {
    const cells = splitLine(line);
    if (!hasHeader) return { name: cells[0] };
    const name = cells[idx("name")] ?? cells[0];
    const country = idx("country") >= 0 ? cells[idx("country")] || null : null;
    const aliasesRaw = idx("aliases") >= 0 ? cells[idx("aliases")] : "";
    const aliases = aliasesRaw
      ? aliasesRaw.split(/[|;]/).map((s) => s.trim()).filter(Boolean)
      : null;
    return { name, country, aliases };
  });
};

const parseJSON = (text: string): ParsedEntry[] => {
  const data = JSON.parse(text);
  const arr: any[] = Array.isArray(data) ? data : Array.isArray(data?.universities) ? data.universities : [];
  return arr
    .map((item) => {
      if (typeof item === "string") return { name: item };
      if (item && typeof item === "object") {
        return {
          name: String(item.name ?? item.University ?? item.title ?? "").trim(),
          country: item.country ?? item.Country ?? null,
          aliases: Array.isArray(item.aliases) ? item.aliases : null,
        };
      }
      return { name: "" };
    })
    .filter((e) => e.name);
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { universities, refresh } = useUniversities();
  const { toast } = useToast();

  const [pasted, setPasted] = useState("");
  const [singleName, setSingleName] = useState("");
  const [singleCountry, setSingleCountry] = useState("");
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{ added: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalCount = universities.length;

  const indexedNormals = useMemo(
    () => new Set(universities.map((u) => u.normalized_name)),
    [universities]
  );

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const dedupe = (entries: ParsedEntry[]) => {
    const seen = new Set<string>(indexedNormals);
    const merged = new Map<string, ParsedEntry & { normalized_name: string }>();
    let skipped = 0;
    for (const e of entries) {
      const name = (e.name ?? "").trim();
      if (!name) { skipped++; continue; }
      const norm = normalizeUniversityName(name);
      if (!norm) { skipped++; continue; }
      if (seen.has(norm) || merged.has(norm)) { skipped++; continue; }
      merged.set(norm, { ...e, name, normalized_name: norm });
    }
    return { rows: [...merged.values()], skipped };
  };

  const insertBatched = async (rows: Array<ParsedEntry & { normalized_name: string }>, source: string) => {
    const chunkSize = 500;
    let added = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize).map((r) => ({
        name: r.name,
        normalized_name: r.normalized_name,
        country: r.country ?? null,
        aliases: r.aliases ?? [],
        source,
        created_by: user.id,
      }));
      const { error, count } = await supabase
        .from("universities")
        .insert(chunk, { count: "exact" });
      if (error) {
        // Some rows may collide with concurrent uniques; surface but continue
        console.error("insert chunk", error);
        toast({ title: "Some rows failed", description: error.message, variant: "destructive" });
      } else {
        added += count ?? chunk.length;
      }
    }
    return added;
  };

  const handleImport = async (entries: ParsedEntry[], source: string) => {
    setImporting(true);
    setStats(null);
    try {
      const { rows, skipped } = dedupe(entries);
      const added = rows.length === 0 ? 0 : await insertBatched(rows, source);
      setStats({ added, skipped });
      await refresh();
      toast({
        title: "Import complete",
        description: `Added ${added} new universities. Skipped ${skipped} duplicates/blanks.`,
      });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    let entries: ParsedEntry[] = [];
    try {
      if (file.name.toLowerCase().endsWith(".json")) entries = parseJSON(text);
      else entries = parseCSV(text);
    } catch (err: any) {
      toast({ title: "Could not parse file", description: err.message, variant: "destructive" });
      return;
    }
    await handleImport(entries, `upload:${file.name}`);
  };

  const handlePasteImport = async () => {
    const text = pasted.trim();
    if (!text) return;
    let entries: ParsedEntry[];
    if (text.startsWith("[") || text.startsWith("{")) {
      try { entries = parseJSON(text); } catch (err: any) {
        toast({ title: "Invalid JSON", description: err.message, variant: "destructive" });
        return;
      }
    } else if (text.includes(",")) {
      entries = parseCSV(text);
    } else {
      entries = text.split(/\r?\n/).map((l) => ({ name: l.trim() })).filter((e) => e.name);
    }
    await handleImport(entries, "paste");
    setPasted("");
  };

  const handleAddSingle = async () => {
    if (!singleName.trim()) return;
    await handleImport(
      [{ name: singleName.trim(), country: singleCountry.trim() || null }],
      "manual"
    );
    setSingleName("");
    setSingleCountry("");
  };

  const handleDelete = async (row: UniversityRow) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    const { error } = await supabase.from("universities").delete().eq("id", row.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: row.name });
      await refresh();
    }
  };

  const handleExport = () => {
    const lines = ["name,country,aliases"];
    for (const u of universities) {
      const aliases = (u.aliases ?? []).join("|");
      const esc = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      lines.push([esc(u.name), esc(u.country ?? ""), esc(aliases)].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `universities-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-7 w-7" /> Universities Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload, refresh, and curate the master university list. Changes appear instantly across the app.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total universities</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Last import</CardDescription></CardHeader>
          <CardContent>
            {stats ? (
              <p className="text-sm">
                <span className="font-semibold text-primary">{stats.added}</span> added,{" "}
                <span className="font-semibold">{stats.skipped}</span> skipped
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No imports yet this session</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Actions</CardDescription></CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!totalCount}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload dataset</CardTitle>
          <CardDescription>
            Accepts CSV (with headers <code>name,country,aliases</code> — aliases pipe-separated) or JSON
            (array of strings or objects). Duplicates are merged automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">File upload</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="file"
                ref={fileRef}
                type="file"
                accept=".csv,.json,.txt"
                disabled={importing}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="paste">Or paste data</Label>
            <Textarea
              id="paste"
              rows={6}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="One per line, CSV, or JSON array..."
              disabled={importing}
            />
            <Button className="mt-2" onClick={handlePasteImport} disabled={importing || !pasted.trim()}>
              {importing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              Import pasted data
            </Button>
          </div>

          <Separator />

          <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto] items-end">
            <div>
              <Label htmlFor="single-name">Quick add</Label>
              <Input
                id="single-name"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="University name"
                disabled={importing}
              />
            </div>
            <div>
              <Label htmlFor="single-country">Country (optional)</Label>
              <Input
                id="single-country"
                value={singleCountry}
                onChange={(e) => setSingleCountry(e.target.value)}
                placeholder="e.g. India"
                disabled={importing}
              />
            </div>
            <Button onClick={handleAddSingle} disabled={importing || !singleName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current dataset</CardTitle>
          <CardDescription>Live view — changes propagate to user pickers in real time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] rounded-md border">
            <ul className="divide-y">
              {universities.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.name}</div>
                    <div className="flex gap-2 mt-0.5">
                      {u.country && <Badge variant="secondary" className="text-xs">{u.country}</Badge>}
                      {u.source && <Badge variant="outline" className="text-xs">{u.source}</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {universities.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">No universities yet — upload a dataset above.</li>
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
