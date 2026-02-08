import type { TcgType, CardCondition } from '@tcg-trade-hub/database';

type CsvRow = {
  name: string;
  set?: string;
  number?: string;
  condition?: string;
  quantity: number;
};

type ParsedCollectionItem = {
  card_name: string;
  set_name: string;
  card_number: string;
  condition: CardCondition;
  quantity: number;
};

const CONDITION_MAP: Record<string, CardCondition> = {
  'near mint': 'nm',
  'nm': 'nm',
  'lightly played': 'lp',
  'lp': 'lp',
  'moderately played': 'mp',
  'mp': 'mp',
  'heavily played': 'hp',
  'hp': 'hp',
  'damaged': 'dmg',
  'dmg': 'dmg',
};

/**
 * Parses a CSV string into collection items.
 * Supports common CSV formats from TCGPlayer and Moxfield exports.
 */
const parseCsvCollection = (csvText: string): ParsedCollectionItem[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0]!;
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));

  const nameIdx = headers.findIndex((h) => h === 'name' || h === 'card name' || h === 'card');
  const setIdx = headers.findIndex((h) => h === 'set' || h === 'set name' || h === 'edition');
  const numberIdx = headers.findIndex((h) => h === 'number' || h === 'card number' || h === 'collector number');
  const condIdx = headers.findIndex((h) => h === 'condition' || h === 'cond');
  const qtyIdx = headers.findIndex((h) => h === 'quantity' || h === 'qty' || h === 'count');

  if (nameIdx === -1) return [];

  const items: ParsedCollectionItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;

    const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''));
    const name = cols[nameIdx];
    if (!name) continue;

    const rawCondition = condIdx >= 0 ? cols[condIdx]?.toLowerCase() ?? '' : '';
    const condition = CONDITION_MAP[rawCondition] ?? 'nm';

    const rawQty = qtyIdx >= 0 ? cols[qtyIdx] : '1';
    const quantity = Math.max(1, parseInt(rawQty ?? '1', 10) || 1);

    items.push({
      card_name: name,
      set_name: setIdx >= 0 ? cols[setIdx] ?? '' : '',
      card_number: numberIdx >= 0 ? cols[numberIdx] ?? '' : '',
      condition,
      quantity,
    });
  }

  return items;
};

export default parseCsvCollection;
