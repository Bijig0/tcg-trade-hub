import { describe, it, expect } from 'vitest';
import generateDefaultChatName from './generateDefaultChatName';

describe('generateDefaultChatName', () => {
  it('should return just the name when no listing title', () => {
    expect(generateDefaultChatName('Alice')).toBe('Alice');
  });

  it('should return just the name when listing title is null', () => {
    expect(generateDefaultChatName('Alice', null)).toBe('Alice');
  });

  it('should combine name and title with em dash', () => {
    expect(generateDefaultChatName('Alice', 'Evolving Skies Bundle')).toBe(
      'Alice \u2014 Evolving Skies Bundle',
    );
  });

  it('should truncate title at 30 characters', () => {
    const longTitle = 'This Is A Very Long Listing Title That Exceeds The Limit';
    const result = generateDefaultChatName('Bob', longTitle);
    expect(result).toBe('Bob \u2014 This Is A Very Long Listing Ti...');
  });

  it('should not truncate title exactly at 30 characters', () => {
    const title30 = 'A'.repeat(30);
    const result = generateDefaultChatName('Bob', title30);
    expect(result).toBe(`Bob \u2014 ${title30}`);
  });

  it('should truncate title at 31+ characters', () => {
    const title31 = 'A'.repeat(31);
    const result = generateDefaultChatName('Bob', title31);
    expect(result).toBe(`Bob \u2014 ${'A'.repeat(30)}...`);
  });
});
