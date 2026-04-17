"use client";

import { useState, useCallback, useRef } from "react";
import { useHoldings } from "@/hooks/use-queries";
import { useMutation } from "@tanstack/react-query";
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParseResponse {
  headers: string[];
  preview: Record<string, string>[];
  totalRows: number;
  suggestions: Record<string, string>;
}

interface FieldMapping {
  executedAt: string;
  type: string;
  holdingId: string; // user picks a fixed holding or maps from column
  ticker: string;    // alternative: map ticker column, resolve client-side
  quantity: string;
  price: string;
  amount: string;
  currency: string;
  fee: string;
  note: string;
  ratioFrom: string;
  ratioTo: string;
}

type MappingMode = "fixed" | "column"; // for holdingId

interface ConfirmResult {
  inserted: number;
  recalculated: number;
}

const TRANSACTION_TYPES = [
  "buy", "sell", "dividend", "interest", "transfer",
  "split", "reverse_split", "drip", "spinoff", "merger",
  "return_of_capital", "bonus",
] as const;

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Upload", "Map Fields", "Confirm"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold",
                done
                  ? "bg-emerald-600 text-white"
                  : active
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400"
              )}
            >
              {done ? <CheckCircle className="w-4 h-4" /> : num}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                active ? "text-slate-100" : "text-slate-400"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Upload ───────────────────────────────────────────────────────────

function UploadStep({
  onParsed,
}: {
  onParsed: (res: ParseResponse, file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import/parse", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Parse failed");
      }
      return res.json() as Promise<ParseResponse>;
    },
    onSuccess: (data, file) => {
      setError(null);
      onParsed(data, file);
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleFile = (file: File) => {
    setError(null);
    parseMutation.mutate(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="max-w-xl mx-auto">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
          dragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-600 hover:border-slate-400"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-200 font-medium mb-1">
          Drop your CSV file here, or click to browse
        </p>
        <p className="text-slate-500 text-sm">CSV files only · max 5 MB · up to 10,000 rows</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {parseMutation.isPending && (
        <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Parsing CSV...
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-8 bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Expected CSV columns</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
          {[
            ["date / executedAt", "required"],
            ["type", "required (buy, sell, dividend…)"],
            ["amount", "required"],
            ["currency", "required (USD, EUR…)"],
            ["quantity", "optional"],
            ["price", "optional"],
            ["fee", "optional"],
            ["note", "optional"],
          ].map(([col, desc]) => (
            <div key={col} className="flex gap-1">
              <span className="font-mono text-slate-300">{col}</span>
              <span>— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Map Fields ───────────────────────────────────────────────────────

interface MappingStepProps {
  parsed: ParseResponse;
  mapping: FieldMapping;
  holdingMode: MappingMode;
  fixedHoldingId: string;
  onMappingChange: (m: FieldMapping) => void;
  onHoldingModeChange: (m: MappingMode) => void;
  onFixedHoldingChange: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

function MappingStep({
  parsed,
  mapping,
  holdingMode,
  fixedHoldingId,
  onMappingChange,
  onHoldingModeChange,
  onFixedHoldingChange,
  onBack,
  onNext,
}: MappingStepProps) {
  const { data: holdings = [] } = useHoldings();

  const update = (field: keyof FieldMapping, value: string) =>
    onMappingChange({ ...mapping, [field]: value });

  const FIELD_DEFS: { key: keyof FieldMapping; label: string; required: boolean; skip?: boolean }[] = [
    { key: "executedAt", label: "Date", required: true },
    { key: "type", label: "Transaction Type", required: true },
    { key: "quantity", label: "Quantity", required: false },
    { key: "price", label: "Price", required: false },
    { key: "amount", label: "Amount", required: true },
    { key: "currency", label: "Currency", required: true },
    { key: "fee", label: "Fee", required: false },
    { key: "note", label: "Note", required: false },
    { key: "ratioFrom", label: "Split Ratio From", required: false },
    { key: "ratioTo", label: "Split Ratio To", required: false },
  ];

  const canProceed =
    mapping.executedAt &&
    mapping.amount &&
    mapping.currency &&
    (holdingMode === "fixed" ? !!fixedHoldingId : !!mapping.ticker);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 p-3 bg-slate-800/60 rounded-lg text-sm text-slate-400">
        <FileText className="inline w-4 h-4 mr-1 mb-0.5" />
        <span className="text-slate-300 font-medium">{parsed.totalRows.toLocaleString()} rows</span>{" "}
        detected · Map each field to a CSV column below.
      </div>

      {/* Holding assignment */}
      <div className="mb-6 bg-slate-800/60 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Assign Holding</h3>
        <div className="flex gap-3 mb-3">
          {(["fixed", "column"] as MappingMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onHoldingModeChange(m)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                holdingMode === m
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              )}
            >
              {m === "fixed" ? "All to one holding" : "Map from column"}
            </button>
          ))}
        </div>
        {holdingMode === "fixed" ? (
          <select
            value={fixedHoldingId}
            onChange={(e) => onFixedHoldingChange(e.target.value)}
            className="w-full bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select holding —</option>
            {holdings.map((h: { id: string; name: string; ticker?: string | null }) => (
              <option key={h.id} value={h.id}>
                {h.name}{h.ticker ? ` (${h.ticker})` : ""}
              </option>
            ))}
          </select>
        ) : (
          <div>
            <p className="text-xs text-slate-400 mb-2">
              Map the ticker/symbol column — rows will be matched to your existing holdings by ticker.
            </p>
            <ColumnSelect
              label="Ticker / Symbol column"
              headers={parsed.headers}
              value={mapping.ticker}
              onChange={(v) => update("ticker", v)}
              required
            />
          </div>
        )}
      </div>

      {/* Field mappings */}
      <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Field Mapping</h3>
        {FIELD_DEFS.map((f) => (
          <ColumnSelect
            key={f.key}
            label={f.label}
            headers={parsed.headers}
            value={mapping[f.key]}
            onChange={(v) => update(f.key, v)}
            required={f.required}
          />
        ))}
      </div>

      {/* Preview */}
      {parsed.preview.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Data Preview (first {parsed.preview.length} rows)
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="text-xs w-full">
              <thead className="bg-slate-800">
                <tr>
                  {parsed.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-slate-400 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.preview.map((row, i) => (
                  <tr key={i} className="border-t border-slate-700/50">
                    {parsed.headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-[160px] truncate">
                        {row[h] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          disabled={!canProceed}
          onClick={onNext}
          className={cn(
            "flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors",
            canProceed
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          )}
        >
          Review Import
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
  required,
}: {
  label: string;
  headers: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 text-sm text-slate-400 shrink-0">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-slate-700 text-slate-200 rounded-md px-2 py-1.5 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">— skip —</option>
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────

interface ConfirmStepProps {
  parsed: ParseResponse;
  mapping: FieldMapping;
  holdingMode: MappingMode;
  fixedHoldingId: string;
  onBack: () => void;
  onDone: (result: ConfirmResult) => void;
}

function ConfirmStep({
  parsed,
  mapping,
  holdingMode,
  fixedHoldingId,
  onBack,
  onDone,
}: ConfirmStepProps) {
  const { data: holdings = [] } = useHoldings();
  const [errors, setErrors] = useState<string[]>([]);

  // Build the row payload from raw CSV + mapping
  const buildRows = useCallback(() => {
    const holdingsByTicker: Record<string, string> = {};
    for (const h of holdings as { id: string; ticker?: string | null }[]) {
      if (h.ticker) holdingsByTicker[h.ticker.toUpperCase()] = h.id;
    }

    const rowErrors: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validRows: any[] = [];

    parsed.preview; // only used for preview; actual import uses re-parsed full CSV
    // For confirm, we send the mapping + full raw file re-parse is server-side.
    // Instead we use a pre-built row list.

    const allRows: Record<string, string>[] = parsed.preview; // preview only for step 3 display
    // NOTE: the actual /api/import/confirm accepts pre-mapped rows from the client.
    // We map all preview rows here for UX; real data comes from re-upload on confirm.

    for (let i = 0; i < allRows.length; i++) {
      const raw = allRows[i];
      const executedAt = mapping.executedAt ? raw[mapping.executedAt]?.trim() : "";
      const type = mapping.type ? raw[mapping.type]?.trim().toLowerCase().replace(/ /g, "_") : "";
      const amount = mapping.amount ? raw[mapping.amount]?.trim() : "";
      const currency = mapping.currency ? raw[mapping.currency]?.trim().toUpperCase() : "";

      let holdingId = fixedHoldingId;
      if (holdingMode === "column") {
        const ticker = mapping.ticker ? raw[mapping.ticker]?.trim().toUpperCase() : "";
        holdingId = holdingsByTicker[ticker] ?? "";
        if (!holdingId) {
          rowErrors.push(`Row ${i + 1}: ticker "${ticker}" not found in your holdings`);
        }
      }

      if (!executedAt) rowErrors.push(`Row ${i + 1}: missing date`);
      if (!type) rowErrors.push(`Row ${i + 1}: missing type`);
      if (!amount) rowErrors.push(`Row ${i + 1}: missing amount`);
      if (!currency) rowErrors.push(`Row ${i + 1}: missing currency`);

      validRows.push({
        holdingId,
        type,
        executedAt,
        quantity: mapping.quantity ? raw[mapping.quantity] || null : null,
        price: mapping.price ? raw[mapping.price] || null : null,
        amount,
        currency,
        fee: mapping.fee ? raw[mapping.fee] || null : null,
        note: mapping.note ? raw[mapping.note] || null : null,
        ratioFrom: mapping.ratioFrom ? raw[mapping.ratioFrom] || null : null,
        ratioTo: mapping.ratioTo ? raw[mapping.ratioTo] || null : null,
      });
    }

    return { validRows, rowErrors };
  }, [parsed, mapping, holdingMode, fixedHoldingId, holdings]);

  const { validRows, rowErrors: previewErrors } = buildRows();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      // Re-parse the full CSV on confirm (client-side) and send mapped rows
      const { default: Papa } = await import("papaparse");
      const text = await file.text();
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });

      const holdingsByTicker: Record<string, string> = {};
      for (const h of holdings as { id: string; ticker?: string | null }[]) {
        if (h.ticker) holdingsByTicker[h.ticker.toUpperCase()] = h.id;
      }

      const rowErrors: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = [];

      for (let i = 0; i < result.data.length; i++) {
        const raw = result.data[i];
        const executedAt = mapping.executedAt ? raw[mapping.executedAt]?.trim() : "";
        const type = mapping.type
          ? raw[mapping.type]?.trim().toLowerCase().replace(/ /g, "_")
          : "";
        const amount = mapping.amount ? raw[mapping.amount]?.trim() : "";
        const currency = mapping.currency
          ? raw[mapping.currency]?.trim().toUpperCase()
          : "";

        let holdingId = fixedHoldingId;
        if (holdingMode === "column") {
          const ticker = mapping.ticker
            ? raw[mapping.ticker]?.trim().toUpperCase()
            : "";
          holdingId = holdingsByTicker[ticker] ?? "";
          if (!holdingId) {
            rowErrors.push(`Row ${i + 1}: ticker "${ticker}" not matched`);
            continue;
          }
        }

        if (!executedAt || !type || !amount || !currency || !holdingId) continue;

        rows.push({
          holdingId,
          type,
          executedAt: new Date(executedAt).toISOString(),
          quantity: mapping.quantity ? raw[mapping.quantity] || null : null,
          price: mapping.price ? raw[mapping.price] || null : null,
          amount,
          currency,
          fee: mapping.fee ? raw[mapping.fee] || "0" : "0",
          note: mapping.note ? raw[mapping.note] || null : null,
          ratioFrom: mapping.ratioFrom ? raw[mapping.ratioFrom] || null : null,
          ratioTo: mapping.ratioTo ? raw[mapping.ratioTo] || null : null,
        });
      }

      if (rowErrors.length > 0) setErrors(rowErrors.slice(0, 20));
      if (rows.length === 0) throw new Error("No valid rows to import");

      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Import failed");
      }
      return res.json() as Promise<ConfirmResult>;
    },
    onSuccess: onDone,
    onError: (e: Error) => setErrors([e.message]),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-slate-800/60 rounded-xl p-5 mb-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Total rows to import</span>
          <span className="text-slate-200 font-medium">{parsed.totalRows.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Holding assignment</span>
          <span className="text-slate-200 font-medium">
            {holdingMode === "fixed"
              ? (holdings as { id: string; name: string }[]).find((h) => h.id === fixedHoldingId)?.name ?? "—"
              : `Mapped from column "${mapping.ticker}"`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date column</span>
          <span className="font-mono text-slate-200">{mapping.executedAt || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Amount column</span>
          <span className="font-mono text-slate-200">{mapping.amount || "—"}</span>
        </div>
      </div>

      {/* Preview of first few rows */}
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Row preview (first {validRows.length})</h3>
      <div className="overflow-x-auto rounded-lg border border-slate-700 mb-6 text-xs">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              {["Date", "Type", "Amount", "Currency", "Quantity", "Fee"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validRows.map((row, i) => (
              <tr key={i} className="border-t border-slate-700/50">
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{row.executedAt}</td>
                <td className="px-3 py-2 text-slate-300">{row.type}</td>
                <td className="px-3 py-2 text-slate-300">{row.amount}</td>
                <td className="px-3 py-2 text-slate-300">{row.currency}</td>
                <td className="px-3 py-2 text-slate-300">{row.quantity ?? "—"}</td>
                <td className="px-3 py-2 text-slate-300">{row.fee ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(previewErrors.length > 0 || errors.length > 0) && (
        <div className="mb-4 bg-yellow-900/30 border border-yellow-700/40 rounded-lg p-3 text-sm text-yellow-300 space-y-1">
          <div className="flex items-center gap-1.5 font-medium mb-1">
            <AlertCircle className="w-4 h-4" />
            Warnings ({[...previewErrors, ...errors].length})
          </div>
          {[...previewErrors, ...errors].slice(0, 5).map((e, i) => (
            <div key={i} className="text-xs">{e}</div>
          ))}
        </div>
      )}

      {importMutation.isSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/40 rounded-lg p-3 text-sm text-emerald-300">
          <CheckCircle className="w-4 h-4" />
          Import complete — {importMutation.data.inserted} transactions inserted, {importMutation.data.recalculated} holdings recalculated.
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={importMutation.isPending}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {/* Hidden file input for re-upload on confirm */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importMutation.mutate(f);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending || importMutation.isSuccess}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors",
              importMutation.isPending || importMutation.isSuccess
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            )}
          >
            {importMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {importMutation.isPending
              ? "Importing…"
              : importMutation.isSuccess
              ? "Done"
              : `Import ${parsed.totalRows.toLocaleString()} Rows`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_MAPPING: FieldMapping = {
  executedAt: "",
  type: "",
  holdingId: "",
  ticker: "",
  quantity: "",
  price: "",
  amount: "",
  currency: "",
  fee: "",
  note: "",
  ratioFrom: "",
  ratioTo: "",
};

export default function ImportPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [parsed, setParsed] = useState<ParseResponse | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<FieldMapping>(EMPTY_MAPPING);
  const [holdingMode, setHoldingMode] = useState<MappingMode>("fixed");
  const [fixedHoldingId, setFixedHoldingId] = useState("");
  const [importResult, setImportResult] = useState<ConfirmResult | null>(null);

  const handleParsed = (res: ParseResponse, file: File) => {
    setParsed(res);
    setUploadedFile(file);
    // Apply auto-suggestions
    setMapping((m) => {
      const next = { ...m };
      for (const [field, col] of Object.entries(res.suggestions)) {
        if (col && field in m) (next as Record<string, string>)[field] = col;
      }
      return next;
    });
    setStep(2);
  };

  const handleDone = (result: ConfirmResult) => {
    setImportResult(result);
    setStep(3);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Import Transactions</h1>
        <p className="text-slate-400 text-sm mt-1">
          Import transaction history from a CSV file exported from your broker.
        </p>
      </div>

      <StepIndicator step={importResult ? 3 : step} />

      {importResult ? (
        <div className="text-center py-16">
          <CheckCircle className="w-14 h-14 mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Import Complete</h2>
          <p className="text-slate-400 mb-1">
            {importResult.inserted.toLocaleString()} transaction{importResult.inserted !== 1 ? "s" : ""} imported
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Cost basis recalculated for {importResult.recalculated} holding{importResult.recalculated !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/dashboard/transactions"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              View Transactions
            </a>
            <button
              onClick={() => {
                setStep(1);
                setParsed(null);
                setUploadedFile(null);
                setMapping(EMPTY_MAPPING);
                setImportResult(null);
              }}
              className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
            >
              Import Another File
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <UploadStep onParsed={handleParsed} />
      ) : step === 2 && parsed ? (
        <MappingStep
          parsed={parsed}
          mapping={mapping}
          holdingMode={holdingMode}
          fixedHoldingId={fixedHoldingId}
          onMappingChange={setMapping}
          onHoldingModeChange={setHoldingMode}
          onFixedHoldingChange={setFixedHoldingId}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : step === 3 && parsed ? (
        <ConfirmStep
          parsed={parsed}
          mapping={mapping}
          holdingMode={holdingMode}
          fixedHoldingId={fixedHoldingId}
          onBack={() => setStep(2)}
          onDone={handleDone}
        />
      ) : null}
    </div>
  );
}
