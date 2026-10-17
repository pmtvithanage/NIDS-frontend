// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/metrics.dummy.js'

/**
 * Historical real-time metrics (one point per step).
 * @param {{minutes?: number, stepSeconds?: number}} [params]
 * @returns {Promise<object[]>} Ordered oldest-first.
 */
export async function getMetricsHistory(params) {
  // const { data } = await http.get('/stats/realtime', {
  //   params: { minutes: params?.minutes ?? 15, step: params?.stepSeconds ?? 1 },
  // });
  // return data;
  return dummy.getMetricsHistory(params)
}

/**
 * Subscribe to the live metrics feed (Server-Sent Events).
 *
 * Real implementation (uncomment and delete the dummy line to switch):
 * `GET /api/v1/stream/metrics` pushed over SSE, with reconnect/backoff and the
 * auth token passed as a query parameter (EventSource cannot set headers).
 *
 * @param {(point: object) => void} onPoint Callback invoked per metrics point.
 * @param {{intervalMs?: number}} [options] Optional cadence override.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeMetrics(onPoint, options = {}) {
  // const base = import.meta.env.VITE_API_URL || '/api/v1';
  // const token = localStorage.getItem('nids_token');
  // const url = `${base}/stream/metrics${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  // let source = null;
  // let timer = null;
  // let retry = 0;
  // let closed = false;
  // const connect = () => {
  //   if (closed) return;
  //   source = new EventSource(url);
  //   source.onmessage = (event) => {
  //     retry = 0;
  //     onPoint(JSON.parse(event.data));
  //   };
  //   source.onerror = () => {
  //     source?.close();
  //     if (closed) return;
  //     retry += 1;
  //     timer = setTimeout(connect, Math.min(30000, 1000 * 2 ** retry));
  //   };
  // };
  // connect();
  // return () => {
  //   closed = true;
  //   if (timer) clearTimeout(timer);
  //   source?.close();
  // };
  return dummy.subscribeMetrics(onPoint, options)
}

/**
 * Latest metrics point plus alert/flow counters over the last 5 minutes.
 * @returns {Promise<object>}
 */
export async function getCurrentSnapshot() {
  // const { data } = await http.get('/stats/realtime/snapshot');
  // return data;
  return dummy.getCurrentSnapshot()
}
