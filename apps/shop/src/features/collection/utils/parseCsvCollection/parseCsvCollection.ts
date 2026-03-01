import type { CardCondition, GradingCompany } from '@tcg-trade-hub/database';

type ParsedCollectionItem = {
  card_name: string;
  set_name: string;
  card_number: string;
  condition: CardCondition;
  quantity: number;
  grading_company: GradingCompany | null;
  grading_score: string | null;
  purchase_price: number | null;
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

const GRADING_MAP: Record<string, GradingCompany> = {
  'psa': 'psa',
  'cgc': 'cgc',
  'bgs': 'bgs',
  'beckett': 'bgs',
};

/**
 * Parses a CSV string into collection items.
 * Supports common CSV formats from TCGPlayer and Moxfield exports,
 * plus grading and purchase price columns.
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
  const gradingIdx = headers.findIndex((h) => h === 'grading_company' || h === 'grading' || h === 'grader');
  const gradeIdx = headers.findIndex((h) => h === 'grading_score' || h === 'grade' || h === 'score');
  const priceIdx = headers.findIndex((h) => h === 'price' || h === 'purchase_price' || h === 'cost');

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

    const rawGrading = gradingIdx >= 0 ? cols[gradingIdx]?.toLowerCase() ?? '' : '';
    const grading_company = GRADING_MAP[rawGrading] ?? null;

    const grading_score = gradeIdx >= 0 && cols[gradeIdx] ? cols[gradeIdx]! : null;

    const rawPrice = priceIdx >= 0 ? cols[priceIdx] : '';
    const parsedPrice = rawPrice ? parseFloat(rawPrice) : NaN;
    const purchase_price = !isNaN(parsedPrice) ? parsedPrice : null;

    items.push({
      card_name: name,
      set_name: setIdx >= 0 ? cols[setIdx] ?? '' : '',
      card_number: numberIdx >= 0 ? cols[numberIdx] ?? '' : '',
      condition,
      quantity,
      grading_company,
      grading_score,
      purchase_price,
    });
  }

  return items;
};

export default parseCsvCollection;
