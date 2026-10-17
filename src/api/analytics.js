// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/analytics.dummy.js'

/**
 * Aggregate analytics overview (heatmap, distributions, talkers, countries).
 * @param {{timezone?: string}} [params]
 * @returns {Promise<object>}
 */
export async function getAnalyticsOverview(params) {
  // const { data } = await http.get('/analytics/overview', { params });
  // return data;
  return dummy.getAnalyticsOverview(params)
}

/**
 * Numeric feature catalog for the flow-feature explorer.
 * @returns {Promise<{features: Array<{value: string, label: string}>, labels: string[]}>}
 */
export async function getFeatureCatalog() {
  // const { data } = await http.get('/analytics/features');
  // return data;
  return dummy.getFeatureCatalog()
}

/**
 * Scatter points for two features, colored by MLP label.
 * @param {{x?: string, y?: string, limit?: number}} [params]
 * @returns {Promise<{x: string, y: string, points: object[]}>}
 */
export async function getFeatureScatter(params) {
  // const { data } = await http.get('/analytics/features/scatter', { params });
  // return data;
  return dummy.getFeatureScatter(params)
}
