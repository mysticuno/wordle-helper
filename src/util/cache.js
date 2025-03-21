/**
 * Manages a cache with size limits and LRU eviction
 */
class CacheManager {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.accessOrder = new Set();
    }

    /**
     * Get a value from the cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or undefined if not found
     */
    get(key) {
        if (!this.cache.has(key)) return undefined;
        
        // Update access order
        this.accessOrder.delete(key);
        this.accessOrder.add(key);
        
        return this.cache.get(key);
    }

    /**
     * Set a value in the cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     */
    set(key, value) {
        // If key exists, update access order
        if (this.cache.has(key)) {
            this.accessOrder.delete(key);
        }
        
        // If cache is full, remove least recently used item
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.accessOrder.values().next().value;
            this.cache.delete(oldestKey);
            this.accessOrder.delete(oldestKey);
        }
        
        this.cache.set(key, value);
        this.accessOrder.add(key);
    }

    /**
     * Clear the cache
     */
    clear() {
        this.cache.clear();
        this.accessOrder.clear();
    }

    /**
     * Get current cache size
     * @returns {number} Number of items in cache
     */
    size() {
        return this.cache.size;
    }
} 