/**
 * Incidents page constants: filter defaults and attack-phase classification.
 * @module constants/incidents
 */

/** Default incident filter state; also the URL query-string schema. */
export const INCIDENT_FILTER_DEFAULTS = Object.freeze({
  severity: '',
  status: '',
})

/** Canonical kill-chain ordering used for the phase summary. */
export const INCIDENT_PHASE_ORDER = Object.freeze(['recon', 'exploit', 'impact'])

/** Display metadata per phase. */
export const INCIDENT_PHASE_META = Object.freeze({
  recon: { short: 'Recon', label: 'Reconnaissance' },
  exploit: { short: 'Exploit', label: 'Exploitation' },
  impact: { short: 'DoS/exfil', label: 'Impact (DoS / exfil)' },
})

/** MLP label → incident phase. */
export const PHASE_BY_LABEL = Object.freeze({
  PortScan: 'recon',
  WebAttack: 'exploit',
  Bot: 'exploit',
  BruteForce: 'exploit',
  Infiltration: 'exploit',
  Heartbleed: 'exploit',
  Patator: 'exploit',
  DDoS: 'impact',
  DoS: 'impact',
})

/** Suricata category → incident phase. */
export const PHASE_BY_CATEGORY = Object.freeze({
  scan: 'recon',
  'attempted-recon': 'recon',
  'attempted-admin': 'recon',
  'web-application-attack': 'exploit',
  'brute-force': 'exploit',
  'trojan-activity': 'exploit',
  malware: 'exploit',
  'policy-violation': 'exploit',
  dos: 'impact',
  ddos: 'impact',
})

/** Maximum number of hosts rendered before a "+N more" note. */
export const INCIDENT_HOST_LIMIT = 8
