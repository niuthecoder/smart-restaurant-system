import { describe, it, expect } from 'vitest';
import { toMenuKey } from './menuTranslations';

describe('menuTranslations', () => {
  describe('toMenuKey', () => {
    it('normalizes empty string to empty string', () => {
      expect(toMenuKey('')).toBe('');
    });

    it('replaces leading and trailing spaces with underscores', () => {
      expect(toMenuKey('  Chicken Kebab  ')).toBe('_Chicken_Kebab_');
    });

    it('handles string with only internal spaces', () => {
      expect(toMenuKey('Chicken Kebab')).toBe('Chicken_Kebab');
    });

    it('replaces spaces with underscores', () => {
      expect(toMenuKey('Lamb Soltani')).toBe('Lamb_Soltani');
    });

    it('handles single word', () => {
      expect(toMenuKey('Ghormeh')).toBe('Ghormeh');
    });

    it('removes parentheses and replaces & with and', () => {
      expect(toMenuKey('Chelo Kabab (Koobideh)')).toBe('Chelo_Kabab_Koobideh');
      expect(toMenuKey('Rice & Saffron')).toBe('Rice_and_Saffron');
    });
  });
});
