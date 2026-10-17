import { useQuery } from '@tanstack/react-query'

import { getSensor, getSensors } from '../api/sensors.js'
import { queryKeys } from './queryKeys.js'

const SENSORS_STALE = 15_000

/** List sensors with health metrics. */
export function useSensors() {
  return useQuery({
    queryKey: queryKeys.sensors(),
    queryFn: getSensors,
    staleTime: SENSORS_STALE,
    refetchInterval: 30_000,
  })
}

/**
 * Query a single sensor.
 * @param {string} id Sensor id.
 */
export function useSensor(id) {
  return useQuery({
    queryKey: queryKeys.sensor(id),
    queryFn: () => getSensor(id),
    enabled: Boolean(id),
    staleTime: SENSORS_STALE,
  })
}
