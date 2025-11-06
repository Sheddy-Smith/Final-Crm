import { supabase } from '@/lib/supabase';
import { indexedDB, STORES } from './indexedDB';
import { v4 as uuidv4 } from 'uuid';

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = new Set();

    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
  }

  handleOnlineStatus(online) {
    this.isOnline = online;
    this.notifyListeners();

    if (online) {
      console.log('🟢 Online - Starting sync...');
      this.syncAll();
    } else {
      console.log('🔴 Offline - Queue mode activated');
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
    console.log('📝 Added to sync queue:', queueItem);

    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    const queue = await indexedDB.getAll(STORES.syncQueue);
    const pendingItems = queue.filter((item) => item.status === 'pending');

    console.log(`🔄 Processing ${pendingItems.length} pending sync items...`);

    for (const item of pendingItems) {
      try {
        await this.syncItem(item);
        await indexedDB.delete(STORES.syncQueue, item.id);
      } catch (error) {
        console.error('Sync error:', error);
        item.retries++;
        item.status = item.retries > 3 ? 'failed' : 'pending';
        await indexedDB.put(STORES.syncQueue, item);
      }
    }

    this.isSyncing = false;
    console.log('✅ Sync queue processed');
  }

  async syncItem(item) {
    const { action, storeName, data } = item;
    const userId = data.user_id;

    if (!userId) {
      throw new Error('No user_id in sync item');
    }

    const tableName = this.getSupabaseTableName(storeName);

    switch (action) {
      case 'create':
        const { error: createError } = await supabase.from(tableName).insert(data);
        if (createError) throw createError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', data.id)
          .eq('user_id', userId);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId);
        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
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
    if (!this.isOnline) {
      console.log('⚠️ Offline - Cannot sync from Supabase');
      return;
    }

    console.log('📥 Syncing data from Supabase...');

    try {
      const tables = [
        'customers',
        'vendors',
        'suppliers',
        'labours',
        'inventory',
        'jobs',
        'ledger_entries',
        'settings',
        'companies',
      ];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        if (data && data.length > 0) {
          const storeName = this.getStoreNameFromTable(table);
          await indexedDB.bulkPut(storeName, data);
          console.log(`✅ Synced ${data.length} ${table} records`);
        }
      }

      console.log('✅ Sync from Supabase complete');
    } catch (error) {
      console.error('Sync from Supabase error:', error);
      throw error;
    }
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
    if (!this.isOnline) return;

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
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }, intervalMs);

    console.log(`🔄 Auto-sync started (every ${intervalMs / 1000}s)`);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }
}

const syncManager = new SyncManager();

export { syncManager };
export default syncManager;
