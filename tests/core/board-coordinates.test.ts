/**
 * Board Coordinate Tests - Issue #1
 * Verify that board coordinates (10×9) match piece position modeling
 */

import { describe, it, expect } from 'vitest';
import { createInitialBoard, getPieceAt } from '../../src/core/board';
import { createPosition, Color, PieceType } from '../../src/core/types';

describe('Board Coordinates - Issue #1', () => {
  describe('Board Dimensions', () => {
    it('should have 9 files (0-8)', () => {
      const board = createInitialBoard();
      const files = new Set(board.pieces.map(p => p.position.file));
      
      // All files from 0 to 8 should be present
      for (let file = 0; file <= 8; file++) {
        expect(files.has(file)).toBe(true);
      }
    });

    it('should have pieces on most ranks (0-9), but some ranks may be empty', () => {
      const board = createInitialBoard();
      const ranks = new Set(board.pieces.map(p => p.position.rank));
      
      // In standard Chinese Chess setup:
      // Rank 0: Red back rank
      // Rank 2: Red cannons
      // Rank 3: Red soldiers
      // Rank 6: Black soldiers
      // Rank 7: Black cannons
      // Rank 9: Black back rank
      // Ranks 1, 4, 5, 8 are empty in initial position
      expect(ranks.has(0)).toBe(true);  // Red back rank
      expect(ranks.has(2)).toBe(true);  // Red cannons
      expect(ranks.has(3)).toBe(true);  // Red soldiers
      expect(ranks.has(6)).toBe(true);  // Black soldiers
      expect(ranks.has(7)).toBe(true);  // Black cannons
      expect(ranks.has(9)).toBe(true);  // Black back rank
    });
  });

  describe('Initial Piece Placement', () => {
    it('should place Red General at (4, 0)', () => {
      const board = createInitialBoard();
      const general = getPieceAt(board, createPosition(4, 0));
      
      expect(general).toBeDefined();
      expect(general?.type).toBe(PieceType.General);
      expect(general?.color).toBe(Color.Red);
    });

    it('should place Black General at (4, 9)', () => {
      const board = createInitialBoard();
      const general = getPieceAt(board, createPosition(4, 9));
      
      expect(general).toBeDefined();
      expect(general?.type).toBe(PieceType.General);
      expect(general?.color).toBe(Color.Black);
    });

    it('should place Red pieces in ranks 0-4 (bottom)', () => {
      const board = createInitialBoard();
      const redPieces = board.pieces.filter(p => p.color === Color.Red);
      
      redPieces.forEach(piece => {
        expect(piece.position.rank).toBeGreaterThanOrEqual(0);
        expect(piece.position.rank).toBeLessThanOrEqual(4);
      });
    });

    it('should place Black pieces in ranks 5-9 (top)', () => {
      const board = createInitialBoard();
      const blackPieces = board.pieces.filter(p => p.color === Color.Black);
      
      blackPieces.forEach(piece => {
        expect(piece.position.rank).toBeGreaterThanOrEqual(5);
        expect(piece.position.rank).toBeLessThanOrEqual(9);
      });
    });

    it('should place Red Chariots at corners (0,0) and (8,0)', () => {
      const board = createInitialBoard();
      const chariot1 = getPieceAt(board, createPosition(0, 0));
      const chariot2 = getPieceAt(board, createPosition(8, 0));
      
      expect(chariot1?.type).toBe(PieceType.Chariot);
      expect(chariot1?.color).toBe(Color.Red);
      expect(chariot2?.type).toBe(PieceType.Chariot);
      expect(chariot2?.color).toBe(Color.Red);
    });

    it('should place Black Chariots at corners (0,9) and (8,9)', () => {
      const board = createInitialBoard();
      const chariot1 = getPieceAt(board, createPosition(0, 9));
      const chariot2 = getPieceAt(board, createPosition(8, 9));
      
      expect(chariot1?.type).toBe(PieceType.Chariot);
      expect(chariot1?.color).toBe(Color.Black);
      expect(chariot2?.type).toBe(PieceType.Chariot);
      expect(chariot2?.color).toBe(Color.Black);
    });
  });

  describe('Coordinate System Consistency', () => {
    it('should maintain consistent file indexing (left to right: 0-8)', () => {
      const board = createInitialBoard();
      
      // Red back rank should be in order from file 0 to 8
      const redBackRank = board.pieces
        .filter(p => p.color === Color.Red && p.position.rank === 0)
        .sort((a, b) => a.position.file - b.position.file);
      
      const expectedOrder = [
        PieceType.Chariot,
        PieceType.Horse,
        PieceType.Elephant,
        PieceType.Advisor,
        PieceType.General,
        PieceType.Advisor,
        PieceType.Elephant,
        PieceType.Horse,
        PieceType.Chariot,
      ];
      
      expect(redBackRank.map(p => p.type)).toEqual(expectedOrder);
    });

    it('should maintain consistent rank indexing (bottom to top: 0-9)', () => {
      const board = createInitialBoard();
      
      // Red soldiers should be at rank 3
      const redSoldiers = board.pieces.filter(
        p => p.color === Color.Red && p.type === PieceType.Soldier
      );
      redSoldiers.forEach(soldier => {
        expect(soldier.position.rank).toBe(3);
      });
      
      // Black soldiers should be at rank 6
      const blackSoldiers = board.pieces.filter(
        p => p.color === Color.Black && p.type === PieceType.Soldier
      );
      blackSoldiers.forEach(soldier => {
        expect(soldier.position.rank).toBe(6);
      });
    });
  });
});
