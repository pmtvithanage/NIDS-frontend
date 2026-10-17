/**
 * Central TanStack Query key factory.
 * @module hooks/queryKeys
 */

export const queryKeys = {
  alerts: (params) => ['alerts', params ?? {}],
  alert: (id) => ['alert', id],
  alertDetail: (id) => ['alert-detail', id],
  alertExplain: (id) => ['alert-explain', id],
  alertPcapHint: (id) => ['alert-pcap-hint', id],
  incidents: (params) => ['incidents', params ?? {}],
  incident: (id) => ['incident', id],
  statsSummary: (params) => ['stats', 'summary', params ?? {}],
  statsTimeseries: (params) => ['stats', 'timeseries', params ?? {}],
  statsTop: (params) => ['stats', 'top', params ?? {}],
  statsGraph: (params) => ['stats', 'graph', params ?? {}],
  engineAgreement: () => ['stats', 'engine-agreement'],
  engineFeedback: () => ['stats', 'engine-feedback'],
  modelInsights: () => ['stats', 'model-insights'],
  host: (ip) => ['host', ip],
  sensors: () => ['sensors'],
  sensor: (id) => ['sensor', id],
  suppressions: () => ['suppressions'],
  labelQueue: () => ['labels', 'queue'],
  dailyReport: (date) => ['reports', 'daily', date ?? 'today'],
  analyticsOverview: (params) => ['analytics', 'overview', params ?? {}],
  featureScatter: (params) => ['analytics', 'scatter', params ?? {}],
  users: () => ['users'],
}
