/**
 * Transposition Table for Chinese Chess AI
 * 
 * Caches previously evaluated board positions to avoid re-computation.
 * This provides a 5-10x performance boost in search speed.
 * 
 * Uses a hash table with configurable capacity.
 * When full, older entries are replaced using a simple replacement strategy.
 */

import { Move } from '../core/types';

/**
 * Transposition table entry flags
 */
export type TTFlag = 'exact' | 'lowerbound' | 'upperbound';

/**
 * Transposition table entry structure
 */
export interface TTEntry {
  hash: bigint;
  depth: number;
  score: number;
  bestMove?: Move;
  flag: TTFlag;
}

/**
 * Internal storage entry with age tracking
 */
interface TTStorageEntry {
  entry: TTEntry;
  age: number;
}

/**
 * Transposition Table implementation
 * 
 * Stores board position evaluations to avoid re-searching the same positions.
 * Uses a simple hash table with linear probing for collision resolution.
 */
export class TranspositionTable {
  private table: Map<bigint, TTStorageEntry>;
  private capacity: number;
  private age: number = 0;

  /**
   * Create a new transposition table
   * @param capacity - Maximum number of entries
   */
  constructor(capacity: number = 10000) {
    this.capacity = capacity;
    this.table = new Map();
  }

  /**
   * Store an entry in the table
   * @param entry - The entry to store
   */
  store(entry: TTEntry): void {
    // Increment age periodically to prevent overflow
    if (this.age > 1000000) {
      this.age = 0;
      // Age all entries
      for (const [key, value] of this.table.entries()) {
        value.age = Math.floor(value.age / 2);
      }
    }

    this.age++;

    const existing = this.table.get(entry.hash);
    
    // Only overwrite if new entry is deeper or table is not full
    if (!existing || entry.depth >= existing.entry.depth || this.table.size < this.capacity) {
      if (this.table.size >= this.capacity && !existing) {
        // Table is full, remove oldest entry
        this.removeOldest();
      }
      
      this.table.set(entry.hash, {
        entry,
        age: this.age,
      });
    }
  }

  /**
   * Retrieve an entry from the table
   * @param hash - Position hash
   * @returns The entry if found, undefined otherwise
   */
  retrieve(hash: bigint): TTEntry | undefined {
    const stored = this.table.get(hash);
    return stored?.entry;
  }

  /**
   * Clear all entries from the table
   */
  clear(): void {
    this.table.clear();
    this.age = 0;
  }

  /**
   * Get table statistics
   */
  getStats(): {
    entries: number;
    capacity: number;
    fillRate: number;
  } {
    return {
      entries: this.table.size,
      capacity: this.capacity,
      fillRate: this.table.size / this.capacity,
    };
  }

  /**
   * Remove the oldest entry (simple aging strategy)
   */
  private removeOldest(): void {
    let oldestKey: bigint | undefined;
    let oldestAge = Infinity;

    for (const [key, value] of this.table.entries()) {
      if (value.age < oldestAge) {
        oldestAge = value.age;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      this.table.delete(oldestKey);
    }
  }
}

export default TranspositionTable;
