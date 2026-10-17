import { useQuery } from '@tanstack/react-query'

import { getDailyReport } from '../api/reports.js'
import { queryKeys } from './queryKeys.js'

/**
 * Query the daily report for a date.
 * @param {string} [date] Date as YYYY-MM-DD.
 */
export function useDailyReport(date) {
  return useQuery({
    queryKey: queryKeys.dailyReport(date),
    queryFn: () => getDailyReport(date),
    staleTime: 60_000,
  })
}
