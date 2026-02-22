import type { SelectedCard } from '../../schemas';

/**
 * Generates a display title from bundle items.
 * 1 item: "Charizard VMAX"
 * 2 items: "Charizard VMAX + 1 more"
 * 3+ items: "Charizard VMAX + 2 more"
 */
const generateBundleTitle = (cards: SelectedCard[]): string => {
  if (cards.length === 0) return '';
  const firstName = cards[0]!.card.name;
  if (cards.length === 1) return firstName;
  return `${firstName} + ${cards.length - 1} more`;
};

export default generateBundleTitle;
