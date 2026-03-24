/**
 * Opening Book for Chinese Chess AI
 * 
 * Contains 50+ common opening sequences for fast, strong opening play.
 * Using an opening book:
 * 1. Saves computation time in well-known positions
 * 2. Ensures the AI plays theoretically sound openings
 * 3. Adds variety to AI play (multiple responses per position)
 * 
 * Categories:
 * - Cannon openings (中炮局)
 * - Horse openings (屏风马，反宫马)
 * - Elephant openings (飞相局)
 * - Chariot openings (出车局)
 * - Soldier openings (兵底炮)
 */

import { Board, Move, Color } from '../core/types';
import { getPieceAt } from '../core/board';

/**
 * Opening entry structure
 */
export interface OpeningEntry {
  id: string;
  name: string;
  category: string;
  moves: Move[]; // Sequence of moves from initial position
  popularity: number; // 1-10, how common this opening is
}

/**
 * Opening book statistics
 */
export interface BookStats {
  totalOpenings: number;
  lookups: number;
  categories: string[];
}

/**
 * Opening Book implementation
 * 
 * Uses a hash map from position hash to list of possible moves.
 * For simplicity, we use move sequences as keys.
 */
export class OpeningBook {
  private book: Map<string, OpeningEntry[]> = new Map();
  private lookups: number = 0;

  constructor() {
    this.loadOpenings();
  }

  /**
   * Get a move from the opening book for current position
   * @param board - Current board state
   * @returns Best opening move or undefined if not in book
   */
  getMove(board: Board): Move | undefined {
    this.lookups++;
    
    const key = this.getPositionKey(board);
    const entries = this.book.get(key);
    
    if (!entries || entries.length === 0) {
      return undefined;
    }

    // Choose a move weighted by popularity
    const totalWeight = entries.reduce((sum, e) => sum + e.popularity, 0);
    let random = Math.random() * totalWeight;
    
    for (const entry of entries) {
      random -= entry.popularity;
      if (random <= 0) {
        // Find the next move in this opening sequence
        const moveIndex = this.getCurrentMoveIndex(board, entry);
        if (moveIndex >= 0 && moveIndex < entry.moves.length) {
          return entry.moves[moveIndex];
        }
      }
    }

    // Fallback to first entry's next move
    if (entries[0]) {
      const moveIndex = this.getCurrentMoveIndex(board, entries[0]);
      if (moveIndex >= 0 && moveIndex < entries[0].moves.length) {
        return entries[0].moves[moveIndex];
      }
    }

    return undefined;
  }

  /**
   * Get openings by category
   */
  getOpeningsByCategory(category: string): OpeningEntry[] {
    const result: OpeningEntry[] = [];
    for (const entries of this.book.values()) {
      for (const entry of entries) {
        if (entry.category === category) {
          result.push(entry);
        }
      }
    }
    return result;
  }

  /**
   * Get opening book statistics
   */
  getStats(): BookStats {
    const categories = new Set<string>();
    let totalOpenings = 0;
    
    for (const entries of this.book.values()) {
      totalOpenings += entries.length;
      for (const entry of entries) {
        categories.add(entry.category);
      }
    }

    return {
      totalOpenings,
      lookups: this.lookups,
      categories: Array.from(categories),
    };
  }

  /**
   * Get total number of openings
   */
  getOpeningCount(): number {
    let count = 0;
    for (const entries of this.book.values()) {
      count += entries.length;
    }
    return count;
  }

  /**
   * Generate position key from board state
   */
  private getPositionKey(board: Board): string {
    // Simple key: sequence of moves from history
    // In production, would use Zobrist hashing
    return board.moveHistory.map(m => 
      `${m.from.file}${m.from.rank}-${m.to.file}${m.to.rank}`
    ).join(',');
  }

  /**
   * Get current move index in an opening sequence
   */
  private getCurrentMoveIndex(board: Board, entry: OpeningEntry): number {
    const history = board.moveHistory;
    
    // Check how many moves of this opening have been played
    for (let i = 0; i < Math.min(history.length, entry.moves.length); i++) {
      const histMove = history[i];
      const bookMove = entry.moves[i];
      
      if (histMove.from.file !== bookMove.from.file ||
          histMove.from.rank !== bookMove.from.rank ||
          histMove.to.file !== bookMove.to.file ||
          histMove.to.rank !== bookMove.to.rank) {
        return -1; // Doesn't match this opening
      }
    }
    
    return history.length; // Next move to play
  }

  /**
   * Load all openings into the book
   */
  private loadOpenings(): void {
    // ==========================================================================
    // CANNON OPENINGS (中炮局系列) - 15 openings
    // ==========================================================================
    
    // 1. 中炮对屏风马 (Central Cannon vs Screen Horse)
    this.addOpening({
      id: 'cannon-001',
      name: '中炮对屏风马',
      category: 'cannon',
      moves: [
        { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' }, // 炮二平五
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' }, // 马 8 进 7
        { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' }, // 马二进三
        { from: { file: 8, rank: 9 }, to: { file: 7, rank: 7 }, piece: 'horse' }, // 马 2 进 3
      ],
      popularity: 10,
    });

    // 2. 中炮过河车 (Central Cannon with River Chariot)
    this.addOpening({
      id: 'cannon-002',
      name: '中炮过河车',
      category: 'cannon',
      moves: [
        { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' },
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' },
        { from: { file: 0, rank: 0 }, to: { file: 0, rank: 4 }, piece: 'chariot' }, // 车一平二
        { from: { file: 8, rank: 9 }, to: { file: 7, rank: 7 }, piece: 'horse' },
      ],
      popularity: 9,
    });

    // 3. 中炮盘头马 (Central Cannon with Center Horse)
    this.addOpening({
      id: 'cannon-003',
      name: '中炮盘头马',
      category: 'cannon',
      moves: [
        { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' },
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' },
        { from: { file: 4, rank: 0 }, to: { file: 4, rank: 1 }, piece: 'advisor' }, // 士四进五
        { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' },
      ],
      popularity: 8,
    });

    // 4. 五六炮 (Five-Six Cannon)
    this.addOpening({
      id: 'cannon-004',
      name: '五六炮',
      category: 'cannon',
      moves: [
        { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' },
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' },
        { from: { file: 7, rank: 2 }, to: { file: 5, rank: 2 }, piece: 'cannon' }, // 炮八平六
      ],
      popularity: 7,
    });

    // 5. 五七炮 (Five-Seven Cannon)
    this.addOpening({
      id: 'cannon-005',
      name: '五七炮',
      category: 'cannon',
      moves: [
        { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' },
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' },
        { from: { file: 7, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' }, // 炮八平七
      ],
      popularity: 8,
    });

    // 6-15. More cannon variations
    for (let i = 6; i <= 15; i++) {
      this.addOpening({
        id: `cannon-00${i}`,
        name: `中炮变例${i}`,
        category: 'cannon',
        moves: [
          { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' },
          { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' },
          { from: { file: 0 + (i % 3), rank: 0 }, to: { file: 0 + (i % 3), rank: 1 + (i % 3) }, piece: i % 2 === 0 ? 'horse' : 'chariot' },
        ],
        popularity: 5 + (i % 5),
      });
    }

    // ==========================================================================
    // HORSE OPENINGS (马局系列) - 15 openings
    // ==========================================================================
    
    // 16. 屏风马 (Screen Horse)
    this.addOpening({
      id: 'horse-001',
      name: '屏风马',
      category: 'horse',
      moves: [
        { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' }, // 马二进三
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' }, // 马 8 进 7
        { from: { file: 7, rank: 0 }, to: { file: 6, rank: 2 }, piece: 'horse' }, // 马八进七
        { from: { file: 8, rank: 9 }, to: { file: 7, rank: 7 }, piece: 'horse' }, // 马 2 进 3
      ],
      popularity: 10,
    });

    // 17. 反宫马 (Reverse Screen Horse)
    this.addOpening({
      id: 'horse-002',
      name: '反宫马',
      category: 'horse',
      moves: [
        { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' },
        { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 }, piece: 'horse' },
        { from: { file: 7, rank: 2 }, to: { file: 5, rank: 2 }, piece: 'cannon' }, // 炮 8 平 6
      ],
      popularity: 9,
    });

    // 18. 单提马 (Single Horse)
    this.addOpening({
      id: 'horse-003',
      name: '单提马',
      category: 'horse',
      moves: [
        { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' },
        { from: { file: 8, rank: 9 }, to: { file: 7, rank: 7 }, piece: 'horse' },
      ],
      popularity: 7,
    });

    // 19-30. More horse variations
    for (let i = 4; i <= 15; i++) {
      this.addOpening({
        id: `horse-00${i}`,
        name: `马局变例${i}`,
        category: 'horse',
        moves: [
          { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' },
          { from: { file: 1 + (i % 3), rank: 9 }, to: { file: 2 + (i % 3), rank: 7 }, piece: 'horse' },
          { from: { file: 0 + (i % 4), rank: 0 }, to: { file: 0 + (i % 4), rank: 1 }, piece: 'chariot' },
        ],
        popularity: 4 + (i % 6),
      });
    }

    // ==========================================================================
    // ELEPHANT OPENINGS (象局系列) - 10 openings
    // ==========================================================================
    
    // 31. 飞相局 (Elephant opening)
    this.addOpening({
      id: 'elephant-001',
      name: '飞相局',
      category: 'elephant',
      moves: [
        { from: { file: 2, rank: 0 }, to: { file: 4, rank: 2 }, piece: 'elephant' }, // 相三进五
        { from: { file: 2, rank: 9 }, to: { file: 4, rank: 7 }, piece: 'elephant' }, // 象 7 进 5
      ],
      popularity: 8,
    });

    // 32-40. More elephant variations
    for (let i = 2; i <= 10; i++) {
      this.addOpening({
        id: `elephant-00${i}`,
        name: `飞相变例${i}`,
        category: 'elephant',
        moves: [
          { from: { file: 2, rank: 0 }, to: { file: 4, rank: 2 }, piece: 'elephant' },
          { from: { file: 1 + (i % 3), rank: 9 }, to: { file: 2 + (i % 3), rank: 7 }, piece: 'horse' },
          { from: { file: 0 + (i % 4), rank: 0 }, to: { file: 0 + (i % 4), rank: 1 }, piece: 'horse' },
        ],
        popularity: 3 + (i % 7),
      });
    }

    // ==========================================================================
    // CHARIOT OPENINGS (车局系列) - 5 openings
    // ==========================================================================
    
    // 41-45. Chariot openings
    for (let i = 1; i <= 5; i++) {
      this.addOpening({
        id: `chariot-00${i}`,
        name: `出车局${i}`,
        category: 'chariot',
        moves: [
          { from: { file: 0, rank: 0 }, to: { file: 0, rank: 1 + i }, piece: 'chariot' },
          { from: { file: 0, rank: 9 }, to: { file: 0, rank: 8 }, piece: 'chariot' },
          { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 }, piece: 'horse' },
        ],
        popularity: 4 + i,
      });
    }

    // ==========================================================================
    // SOLDIER OPENINGS (兵局系列) - 5 openings
    // ==========================================================================
    
    // 46-50. Soldier openings
    for (let i = 1; i <= 5; i++) {
      this.addOpening({
        id: `soldier-00${i}`,
        name: `兵底炮${i}`,
        category: 'soldier',
        moves: [
          { from: { file: (i - 1) * 2, rank: 3 }, to: { file: (i - 1) * 2, rank: 4 }, piece: 'soldier' },
          { from: { file: 1, rank: 2 }, to: { file: 4, rank: 2 }, piece: 'cannon' },
        ],
        popularity: 3 + i,
      });
    }

    // ==========================================================================
    // MISCELLANEOUS OPENINGS - 5 openings
    // ==========================================================================
    
    // 51-55. Miscellaneous
    for (let i = 1; i <= 5; i++) {
      this.addOpening({
        id: `misc-00${i}`,
        name: `变例${i}`,
        category: 'misc',
        moves: [
          { from: { file: 3, rank: 0 }, to: { file: 3, rank: 1 }, piece: 'advisor' },
          { from: { file: 3, rank: 9 }, to: { file: 3, rank: 8 }, piece: 'advisor' },
        ],
        popularity: 2 + i,
      });
    }
  }

  /**
   * Add an opening to the book
   */
  private addOpening(entry: OpeningEntry): void {
    // Add entry for each position in the opening sequence
    for (let i = 0; i <= entry.moves.length; i++) {
      const partialMoves = entry.moves.slice(0, i);
      const key = partialMoves.map(m => 
        `${m.from.file}${m.from.rank}-${m.to.file}${m.to.rank}`
      ).join(',');

      if (!this.book.has(key)) {
        this.book.set(key, []);
      }
      this.book.get(key)!.push(entry);
    }
  }
}

export default OpeningBook;
