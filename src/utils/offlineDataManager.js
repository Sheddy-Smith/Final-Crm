import { indexedDB, STORES } from './indexedDB';
import { syncManager } from './syncManager';

class OfflineDataManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.localOnlyMode = true;
  }

  async saveData(storeName, data, userId) {
    try {
      await indexedDB.put(storeName, { ...data, user_id: userId });
      await syncManager.addToSyncQueue('update', storeName, { ...data, user_id: userId });
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
      await syncManager.addToSyncQueue('create', storeName, dataWithUser);
      return { success: true, data: dataWithUser };
    } catch (error) {
      console.error('Create data error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteData(storeName, id, userId) {
    try {
      await indexedDB.delete(storeName, id);
      await syncManager.addToSyncQueue('delete', storeName, { id, user_id: userId });
      return { success: true };
    } catch (error) {
      console.error('Delete data error:', error);
      return { success: false, error: error.message };
    }
  }

  async getData(storeName, userId) {
    try {
      const data = await indexedDB.getByIndex(storeName, 'user_id', userId);
      return data || [];
    } catch (error) {
      console.error('Get data error:', error);
      return [];
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
    console.log('⚠️ Remote sync disabled - all data stored locally in IndexedDB');
    return { success: true, message: 'Local-only mode' };
  }
}

const offlineDataManager = new OfflineDataManager();

export { offlineDataManager };
export default offlineDataManager;
