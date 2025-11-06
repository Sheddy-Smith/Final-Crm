import { supabase } from '@/lib/supabase';
import { indexedDB, STORES } from './indexedDB';
import { syncManager } from './syncManager';

class OfflineDataManager {
  constructor() {
    this.isOnline = navigator.onLine;
  }

  async saveData(storeName, data, userId) {
    try {
      await indexedDB.put(storeName, { ...data, user_id: userId });

      if (this.isOnline) {
        await this.syncToSupabase(storeName, data, 'update', userId);
      } else {
        await syncManager.addToSyncQueue('update', storeName, { ...data, user_id: userId });
      }

      return { success: true };
    } catch (error) {
      console.error('Save data error:', error);
      return { success: false, error: error.message };
    }
  }

  async createData(storeName, data, userId) {
    try {
      const dataWithUser = { ...data, user_id: userId };
      await indexedDB.put(storeName, dataWithUser);

      if (this.isOnline) {
        await this.syncToSupabase(storeName, dataWithUser, 'create', userId);
      } else {
        await syncManager.addToSyncQueue('create', storeName, dataWithUser);
      }

      return { success: true, data: dataWithUser };
    } catch (error) {
      console.error('Create data error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteData(storeName, id, userId) {
    try {
      await indexedDB.delete(storeName, id);

      if (this.isOnline) {
        await this.syncToSupabase(storeName, { id }, 'delete', userId);
      } else {
        await syncManager.addToSyncQueue('delete', storeName, { id, user_id: userId });
      }

      return { success: true };
    } catch (error) {
      console.error('Delete data error:', error);
      return { success: false, error: error.message };
    }
  }

  async getData(storeName, userId) {
    try {
      if (this.isOnline) {
        const tableName = syncManager.getSupabaseTableName(storeName);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        if (data) {
          await indexedDB.bulkPut(storeName, data);
        }

        return data || [];
      } else {
        const data = await indexedDB.getByIndex(storeName, 'user_id', userId);
        return data || [];
      }
    } catch (error) {
      console.error('Get data error:', error);
      const localData = await indexedDB.getByIndex(storeName, 'user_id', userId);
      return localData || [];
    }
  }

  async syncToSupabase(storeName, data, action, userId) {
    const tableName = syncManager.getSupabaseTableName(storeName);

    try {
      switch (action) {
        case 'create':
          const { error: createError } = await supabase.from(tableName).insert(data);
          if (createError) throw createError;
          break;

        case 'update':
          const { error: updateError } = await supabase
            .from(tableName)
            .upsert(data, { onConflict: 'id' });
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

      return { success: true };
    } catch (error) {
      console.error('Sync to Supabase error:', error);
      return { success: false, error: error.message };
    }
  }

  async getById(storeName, id) {
    try {
      const data = await indexedDB.getById(storeName, id);
      return data;
    } catch (error) {
      console.error('Get by ID error:', error);
      return null;
    }
  }

  async syncAll(userId) {
    if (!navigator.onLine) {
      console.log('⚠️ Offline - Cannot sync all data');
      return { success: false, message: 'Offline' };
    }

    try {
      await syncManager.syncFromSupabase(userId);
      return { success: true };
    } catch (error) {
      console.error('Sync all error:', error);
      return { success: false, error: error.message };
    }
  }
}

const offlineDataManager = new OfflineDataManager();

export { offlineDataManager };
export default offlineDataManager;
