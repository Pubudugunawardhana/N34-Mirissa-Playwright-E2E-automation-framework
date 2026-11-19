/** Reads the amount out of a price such as "LKR 28,000" or "LKR 1,500.50". */
export function parseLKR(text: string): number {
  const match = text.replace(/\s+/g, ' ').match(/(?:LKR|Rs\.?)\s?([\d,]+(?:\.\d+)?)/);
  if (!match) {
    throw new Error(`Could not find an LKR amount in "${text}"`);
  }
  return Number(match[1].replace(/,/g, ''));
}
