import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '../../queryKeys';
import parseCsvCollection from '../../utils/parseCsvCollection/parseCsvCollection';
import type { NormalizedCard, TcgTypeSchema } from '@tcg-trade-hub/database';
import type { z } from 'zod';

type MatchedRow = {
  card_name: string;
  set_name: string;
  card_number: string;
  condition: string;
  quantity: number;
  grading_company: string | null;
  grading_score: string | null;
  purchase_price: number | null;
  match: NormalizedCard | null;
  status: 'pending' | 'searching' | 'matched' | 'unmatched';
};

type CsvImportFlowProps = {
  onSuccess?: () => void;
};

const STEPS = ['Upload', 'Preview', 'Confirm'] as const;

export const CsvImportFlow = ({ onSuccess }: CsvImportFlowProps) => {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [csvText, setCsvText] = useState('');
  const [tcg, setTcg] = useState<z.infer<typeof TcgTypeSchema>>('pokemon');
  const [rows, setRows] = useState<MatchedRow[]>([]);
  const [insertedCount, setInsertedCount] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  }, []);

  const handleParse = async () => {
    const parsed = parseCsvCollection(csvText);
    if (parsed.length === 0) return;

    const matchedRows: MatchedRow[] = parsed.map((item) => ({
      ...item,
      match: null,
      status: 'pending' as const,
    }));
    setRows(matchedRows);
    setStep(1);

    // Search for each unique card name with concurrency limit
    const uniqueNames = [...new Set(parsed.map((p) => p.card_name))];
    const matchMap = new Map<string, NormalizedCard | null>();

    const batchSize = 3;
    for (let i = 0; i < uniqueNames.length; i += batchSize) {
      const batch = uniqueNames.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (name) => {
          const cards = await client.card.search({ query: name, tcg });
          return { name, card: cards[0] ?? null };
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          matchMap.set(result.value.name, result.value.card);
        }
      }

      // Update rows with matches found so far
      setRows((prev) =>
        prev.map((row) => {
          const match = matchMap.get(row.card_name);
          if (match !== undefined) {
            return { ...row, match, status: match ? 'matched' : 'unmatched' };
          }
          return { ...row, status: 'searching' };
        }),
      );
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const matched = rows.filter((r) => r.match);
      if (matched.length === 0) throw new Error('No matched cards');

      const items = matched.map((row) => ({
        user_id: '', // overridden server-side
        tcg: row.match!.tcg,
        external_id: row.match!.externalId,
        card_name: row.match!.name,
        set_name: row.match!.setName,
        set_code: row.match!.setCode,
        card_number: row.match!.number,
        image_url: row.match!.imageUrl,
        rarity: row.match!.rarity,
        market_price: row.match!.marketPrice,
        condition: row.condition as 'nm' | 'lp' | 'mp' | 'hp' | 'dmg',
        quantity: row.quantity,
        grading_company: row.grading_company as 'psa' | 'cgc' | 'bgs' | null,
        grading_score: row.grading_score,
        purchase_price: row.purchase_price,
        is_wishlist: false,
        is_tradeable: true,
      }));

      return client.collection.batchAdd({ items });
    },
    onSuccess: (data) => {
      setInsertedCount(data.inserted_count);
      setStep(2);
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      onSuccess?.();
    },
  });

  const matchedCount = rows.filter((r) => r.status === 'matched').length;
  const unmatchedCount = rows.filter((r) => r.status === 'unmatched').length;
  const searchingCount = rows.filter((r) => r.status === 'pending' || r.status === 'searching').length;

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </span>
            <span className={`text-sm ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 text-muted-foreground">—</span>}
          </div>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <label className="text-sm font-medium text-foreground">TCG:</label>
            <select
              value={tcg}
              onChange={(e) => setTcg(e.target.value as z.infer<typeof TcgTypeSchema>)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="pokemon">Pokemon</option>
              <option value="mtg">MTG</option>
              <option value="onepiece">One Piece</option>
            </select>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center"
          >
            <p className="text-muted-foreground">
              Drag and drop a CSV file here, or{' '}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-primary underline"
              >
                browse
              </button>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Or paste CSV:</label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              placeholder="Name,Set,Condition,Quantity&#10;Charizard VMAX,Darkness Ablaze,NM,2"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={!csvText.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Parse & Match
          </button>
        </div>
      )}

      {/* Step 1: Preview */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-success">{matchedCount} matched</span>
            <span className="text-destructive">{unmatchedCount} unmatched</span>
            {searchingCount > 0 && (
              <span className="text-muted-foreground">{searchingCount} searching...</span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-border bg-card text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Card Name</th>
                  <th className="px-3 py-2">Set</th>
                  <th className="px-3 py-2">Condition</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, i) => (
                  <tr key={i} className="bg-background">
                    <td className="px-3 py-2">
                      {row.status === 'matched' && <span className="text-success">&#10003;</span>}
                      {row.status === 'unmatched' && <span className="text-destructive">&#10007;</span>}
                      {(row.status === 'pending' || row.status === 'searching') && (
                        <span className="text-muted-foreground">...</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-foreground">{row.card_name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.set_name}</td>
                    <td className="px-3 py-2">{row.condition.toUpperCase()}</td>
                    <td className="px-3 py-2">{row.quantity}</td>
                    <td className="px-3 py-2">
                      {row.match && (
                        <div className="flex items-center gap-2">
                          {row.match.imageUrl && (
                            <img src={row.match.imageUrl} alt="" className="h-8 w-6 rounded object-cover" />
                          )}
                          <span className="text-xs text-muted-foreground">{row.match.name}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep(0); setRows([]); }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => submitMutation.mutate()}
              disabled={matchedCount === 0 || submitMutation.isPending || searchingCount > 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Importing...' : `Import ${matchedCount} Cards`}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mb-2 text-3xl">&#10003;</div>
          <h3 className="text-lg font-semibold text-foreground">Import Complete</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Successfully imported {insertedCount} cards into your collection.
          </p>
        </div>
      )}
    </div>
  );
};
