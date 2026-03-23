import { describe, it, expect } from 'vitest';
import { Color, PieceType, isValidPosition } from '../../src/core/types';

describe('Domain Types', () => {
  describe('Color', () => {
    it('should have red and black colors', () => {
      expect(Color.Red).toBe('red');
      expect(Color.Black).toBe('black');
    });
  });

  describe('PieceType', () => {
    it('should have all 7 piece types', () => {
      expect(PieceType.General).toBe('general');
      expect(PieceType.Advisor).toBe('advisor');
      expect(PieceType.Elephant).toBe('elephant');
      expect(PieceType.Horse).toBe('horse');
      expect(PieceType.Chariot).toBe('chariot');
      expect(PieceType.Cannon).toBe('cannon');
      expect(PieceType.Soldier).toBe('soldier');
    });
  });

  describe('Position', () => {
    it('should validate file range (0-8)', () => {
      expect(isValidPosition({ file: 0, rank: 0 })).toBe(true);
      expect(isValidPosition({ file: 8, rank: 9 })).toBe(true);
      expect(isValidPosition({ file: 9, rank: 0 })).toBe(false);
      expect(isValidPosition({ file: -1, rank: 0 })).toBe(false);
    });

    it('should validate rank range (0-9)', () => {
      expect(isValidPosition({ file: 0, rank: 0 })).toBe(true);
      expect(isValidPosition({ file: 0, rank: 9 })).toBe(true);
      expect(isValidPosition({ file: 0, rank: 10 })).toBe(false);
      expect(isValidPosition({ file: 0, rank: -1 })).toBe(false);
    });
  });
});
