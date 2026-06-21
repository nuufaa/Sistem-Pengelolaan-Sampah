/**
 * TabSync.js
 * Utility to synchronize data across multiple tabs using BroadcastChannel.
 */

const SYNC_CHANNEL = 'sistem_sampah_sync';
const channel = typeof window !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL) : null;

export const TabSync = {
  /**
   * Broadcast an event to other tabs.
   * @param {string} event - Event name (e.g., 'tps_updated', 'jadwal_changed')
   * @param {any} data - Optional data payload
   */
  emit(event, data = {}) {
    if (channel) {
      channel.postMessage({ event, data, timestamp: Date.now() });
    }
  },

  /**
   * Listen for events from other tabs.
   * @param {Function} callback - Function(event, data)
   * @returns {Function} - Unsubscribe function
   */
  listen(callback) {
    if (!channel) return () => {};

    const handler = (msg) => {
      if (msg.data && msg.data.event) {
        callback(msg.data.event, msg.data.data);
      }
    };

    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }
};
