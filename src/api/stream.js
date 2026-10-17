import * as dummy from '../dummy/stream.dummy.js'

/**
 * Subscribe to the real-time alert feed (Server-Sent Events).
 *
 * Real implementation (uncomment and delete the dummy line to switch):
 * `GET /api/v1/stream/alerts` pushed over SSE.
 *
 * @param {(alert: object) => void} onAlert Callback invoked per alert.
 * @param {{minSeverity?: string}} [options] Optional severity floor.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAlerts(onAlert, options = {}) {
  // const base = import.meta.env.VITE_API_URL || '/api/v1';
  // const source = new EventSource(`${base}/stream/alerts`);
  // source.onmessage = (event) => {
  //   const alert = JSON.parse(event.data);
  //   onAlert(alert);
  // };
  // return () => source.close();
  return dummy.subscribeAlerts(onAlert, options)
}
