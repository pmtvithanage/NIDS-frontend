// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/stats.dummy.js'

/**
 * KPI summary for a time window.
 * @param {{from?: string, to?: string}} [params] Window bounds (ISO).
 * @returns {Promise<object>}
 */
export async function getSummary(params) {
  // const { data } = await http.get('/stats/summary', { params });
  // return data;
  return dummy.getSummary(params)
}

/**
 * Alert count time series.
 * @param {object} [params] { interval, from, to, group_by }.
 * @returns {Promise<object>}
 */
export async function getTimeseries(params) {
  // const { data } = await http.get('/stats/timeseries', { params });
  // return data;
  return dummy.getTimeseries(params)
}

/**
 * Top-N breakdown.
 * @param {object} [params] { by, limit }.
 * @returns {Promise<object>}
 */
export async function getTop(params) {
  // const { data } = await http.get('/stats/top', { params });
  // return data;
  return dummy.getTop(params)
}

  /**
   * Suricata vs MLP agreement matrix.
   * @returns {Promise<object>}
   */
  export async function getEngineAgreement() {
    // const { data } = await http.get('/stats/engine-agreement');
    // return data;
    return dummy.getEngineAgreement()
  }
  
  /**
   * Analyst feedback per engine.
   * @returns {Promise<object>}
   */
  export async function getEngineFeedback() {
    // const { data } = await http.get('/stats/engine-feedback');
    // return data;
    return dummy.getEngineFeedback()
  }
  
  /**
   * Model insight charts.
   * @returns {Promise<object>}
   */
  export async function getModelInsights() {
    // const { data } = await http.get('/stats/model-insights');
    // return data;
    return dummy.getModelInsights()
  }

  /**
   * Communication graph between hosts (who talks to whom).
   * @param {{minutes?: number}} [params]
   * @returns {Promise<object>}
   */
  export async function getCommunicationGraph(params = {}) {
    // const { data } = await http.get('/stats/graph', { params: { minutes: params?.minutes ?? 15 } });
    // return data;
    return dummy.getCommunicationGraph(params)
  }

