import { AlertTriangle, CheckCircle2, PowerOff, XCircle } from 'lucide-react'

import { SENSOR_HEALTH } from '../../constants/sensors.js'

const HEALTH_META = {
  [SENSOR_HEALTH.HEALTHY]: { label: 'Healthy', className: 'text-sev-low', Icon: CheckCircle2 },
  [SENSOR_HEALTH.DEGRADED]: { label: 'Degraded', className: 'text-sev-medium', Icon: AlertTriangle },
  [SENSOR_HEALTH.UNHEALTHY]: { label: 'Unhealthy', className: 'text-sev-high', Icon: XCircle },
  [SENSOR_HEALTH.OFFLINE]: { label: 'Offline', className: 'text-muted', Icon: PowerOff },
}

/**
 * Sensor health as an icon plus text label.
 * @param {{health: string}} props
 */
function SensorHealthBadge({ health }) {
  const meta = HEALTH_META[health] ?? HEALTH_META[SENSOR_HEALTH.OFFLINE]
  const { Icon } = meta
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export default SensorHealthBadge
