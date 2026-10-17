/**
 * Traffic / classifier label constants.
 * @module constants/labels
 */

/** @type {Readonly<Record<string, string>>} */
export const LABEL = Object.freeze({
  BENIGN: 'BENIGN',
  DDOS: 'DDoS',
  PORT_SCAN: 'PortScan',
  BOT: 'Bot',
  WEB_ATTACK: 'WebAttack',
  BRUTE_FORCE: 'BruteForce',
  INFILTRATION: 'Infiltration',
  HEARTBLEED: 'Heartbleed',
  PATATOR: 'Patator',
  DOS: 'DoS',
  UNKNOWN: 'Unknown',
})

/** All known labels in display order. */
export const LABELS = Object.values(LABEL)

/** Labels that represent malicious traffic. */
export const ATTACK_LABELS = LABELS.filter((label) => label !== LABEL.BENIGN)
