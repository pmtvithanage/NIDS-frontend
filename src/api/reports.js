// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/reports.dummy.js'

/**
 * Get the daily report for a date.
 * @param {string} [date] Date as YYYY-MM-DD.
 * @returns {Promise<object>}
 */
export async function getDailyReport(date) {
  // const { data } = await http.get('/reports/daily', { params: { date } });
  // return data;
  return dummy.getDailyReport(date)
}
