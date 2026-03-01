import { describe, it, expect } from 'vitest';
import parseCsvCollection from './parseCsvCollection';

describe('parseCsvCollection', () => {
  it('should parse a standard CSV with name, set, condition, quantity', () => {
    const csv = `Name,Set,Condition,Quantity
"Charizard VMAX","Darkness Ablaze","Near Mint",2
"Pikachu V","Vivid Voltage","Lightly Played",1`;

    const result = parseCsvCollection(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      card_name: 'Charizard VMAX',
      set_name: 'Darkness Ablaze',
      card_number: '',
      condition: 'nm',
      quantity: 2,
      grading_company: null,
      grading_score: null,
      purchase_price: null,
    });
    expect(result[1]?.condition).toBe('lp');
  });

  it('should handle TCGPlayer export format', () => {
    const csv = `Quantity,Card Name,Set Name,Card Number,Condition
3,Lightning Bolt,Fourth Edition,194,NM
1,Sol Ring,Commander 2021,242,HP`;

    const result = parseCsvCollection(csv);
    expect(result).toHaveLength(2);
    expect(result[0]?.card_name).toBe('Lightning Bolt');
    expect(result[0]?.quantity).toBe(3);
    expect(result[1]?.condition).toBe('hp');
  });

  it('should default condition to nm and quantity to 1 when missing', () => {
    const csv = `Name
Dark Magician`;

    const result = parseCsvCollection(csv);
    expect(result).toHaveLength(1);
    expect(result[0]?.condition).toBe('nm');
    expect(result[0]?.quantity).toBe(1);
  });

  it('should return empty array for invalid CSV', () => {
    expect(parseCsvCollection('')).toEqual([]);
    expect(parseCsvCollection('just a header')).toEqual([]);
  });

  it('should skip empty lines', () => {
    const csv = `Name,Quantity
Card A,1

Card B,2
`;
    const result = parseCsvCollection(csv);
    expect(result).toHaveLength(2);
  });

  it('should parse grading and purchase price columns', () => {
    const csv = `Name,Set,Condition,Quantity,Grading,Grade,Price
"Charizard VMAX","Darkness Ablaze","NM",1,PSA,10,250.00
"Pikachu V","Vivid Voltage","LP",2,,,`;

    const result = parseCsvCollection(csv);
    expect(result).toHaveLength(2);
    expect(result[0]?.grading_company).toBe('psa');
    expect(result[0]?.grading_score).toBe('10');
    expect(result[0]?.purchase_price).toBe(250);
    expect(result[1]?.grading_company).toBeNull();
    expect(result[1]?.grading_score).toBeNull();
    expect(result[1]?.purchase_price).toBeNull();
  });
});
