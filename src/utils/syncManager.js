import { indexedDB, STORES } from './indexedDB';
import { v4 as uuidv4 } from 'uuid';

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = new Set();
    this.localOnlyMode = true;

    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
  }

  handleOnlineStatus(online) {
    this.isOnline = online;
    this.notifyListeners();

    if (online) {
      console.log('🟢 Online - Local-only mode (no remote sync)');
    } else {
      console.log('🔴 Offline - Local-only mode');
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.isOnline));
  }

  async addToSyncQueue(action, storeName, data) {
    const queueItem = {
      id: uuidv4(),
      action,
      storeName,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    };

    await indexedDB.put(STORES.syncQueue, queueItem);
    console.log('📝 Added to local queue (no remote sync):', queueItem);
  }

  async processSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    const queue = await indexedDB.getAll(STORES.syncQueue);
    const pendingItems = queue.filter((item) => item.status === 'pending');

    console.log(`🔄 Processing ${pendingItems.length} local queue items...`);

    for (const item of pendingItems) {
      try {
        item.status = 'completed';
        await indexedDB.put(STORES.syncQueue, item);
        console.log('✅ Queue item marked as completed (local only):', item.id);
      } catch (error) {
        console.error('Queue processing error:', error);
        item.retries++;
        item.status = item.retries > 3 ? 'failed' : 'pending';
        await indexedDB.put(STORES.syncQueue, item);
      }
    }

    this.isSyncing = false;
    console.log('✅ Local queue processed (no remote sync)');
  }

  getSupabaseTableName(storeName) {
    const mapping = {
      customers: 'customers',
      vendors: 'vendors',
      suppliers: 'suppliers',
      labours: 'labours',
      inventory: 'inventory',
      jobs: 'jobs',
      ledgerEntries: 'ledger_entries',
      settings: 'settings',
      companies: 'companies',
    };
    return mapping[storeName] || storeName;
  }

  async syncFromSupabase(userId) {
    console.log('⚠️ Remote sync disabled - using local-only storage');
    return;
  }

  getStoreNameFromTable(tableName) {
    const mapping = {
      customers: 'customers',
      vendors: 'vendors',
      suppliers: 'suppliers',
      labours: 'labours',
      inventory: 'inventory',
      jobs: 'jobs',
      ledger_entries: 'ledgerEntries',
      settings: 'settings',
      companies: 'companies',
    };
    return mapping[tableName] || tableName;
  }

  async syncAll() {
    console.log('⚠️ Remote sync disabled - all data stored locally only');
    await this.processSyncQueue();
  }

  async clearLocalData() {
    console.log('🗑️ Clearing local IndexedDB data...');
    await indexedDB.clearAll();
    console.log('✅ Local data cleared');
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
    }, intervalMs);

    console.log(`🔄 Auto-queue processing started (every ${intervalMs / 1000}s) - local only`);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-queue processing stopped');
    }
  }
}

const syncManager = new SyncManager();

export { syncManager };
export default syncManager;
