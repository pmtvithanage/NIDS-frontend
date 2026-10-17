/**
 * Static Suricata signature catalog used by the dummy generator.
 * `severity` follows the Suricata convention: 1 = highest priority.
 * `orphan` marks signatures that can fire without an IP tuple (decode errors).
 * @module constants/signatures
 */

/** @type {ReadonlyArray<{signature:string, signature_id:number, category:string, severity:number, orphan?:boolean, weight:number}>} */
export const SURICATA_SIGNATURES = Object.freeze([
  { signature: 'SURICATA IPv4 invalid checksum', signature_id: 2200073, category: 'checksum', severity: 3, weight: 0.12 },
  { signature: 'SURICATA IPv4 truncated packet', signature_id: 2200072, category: 'decode', severity: 2, orphan: true, weight: 0.15 },
  { signature: 'SURICATA TCP invalid checksum', signature_id: 2200074, category: 'checksum', severity: 3, weight: 0.12 },
  { signature: 'SURICATA UDP invalid checksum', signature_id: 2200075, category: 'checksum', severity: 3, weight: 0.12 },
  { signature: 'SURICATA IPv6 truncated packet', signature_id: 2200095, category: 'decode', severity: 2, orphan: true, weight: 0.15 },
  { signature: 'SURICATA datatype mismatch', signature_id: 2200010, category: 'decode', severity: 2, orphan: true, weight: 0.15 },
  { signature: 'SURICATA STREAM bad window update', signature_id: 2210007, category: 'decode', severity: 2, weight: 0.15 },
  { signature: 'SURICATA ICMPv4 unknown type', signature_id: 2200060, category: 'decode', severity: 3, weight: 0.15 },
  { signature: 'SURICATA Ethernet frame too small', signature_id: 2200030, category: 'decode', severity: 2, orphan: true, weight: 0.15 },

  { signature: 'ET SCAN Potential SSH Scan', signature_id: 2001219, category: 'scan', severity: 2, weight: 0.45 },
  { signature: 'ET SCAN Nmap Scripting Engine User-Agent Detected', signature_id: 2010935, category: 'scan', severity: 2, weight: 0.45 },
  { signature: 'ET SCAN Suspicious inbound to mySQL port 3306', signature_id: 2010937, category: 'scan', severity: 2, weight: 0.45 },
  { signature: 'ET SCAN Possible SYN Flood', signature_id: 2010935, category: 'scan', severity: 2, weight: 0.45 },

  { signature: 'ET DOS Possible NTP DDoS Inbound Frequent Unicast Packets', signature_id: 2017917, category: 'ddos', severity: 1, weight: 0.8 },
  { signature: 'ET DOS Possible DNS Amplification', signature_id: 2016014, category: 'ddos', severity: 1, weight: 0.8 },
  { signature: 'GPL DOS UDP flood', signature_id: 2100498, category: 'dos', severity: 2, weight: 0.75 },
  { signature: 'ET DOS Possible SYN Flood', signature_id: 2100529, category: 'dos', severity: 2, weight: 0.75 },

  { signature: 'ET TROJAN Possible Bot Checkin', signature_id: 2019401, category: 'trojan-activity', severity: 1, weight: 0.7 },
  { signature: 'ET MALWARE Generic Bot CnC Beacon', signature_id: 2027757, category: 'malware', severity: 1, weight: 0.7 },

  { signature: 'ET WEB_SERVER SQL Injection Attempt', signature_id: 2006448, category: 'web-application-attack', severity: 1, weight: 0.65 },
  { signature: 'ET WEB_CLIENT Possible XSS', signature_id: 2010028, category: 'web-application-attack', severity: 2, weight: 0.65 },
  { signature: 'ET WEB_SERVER Command Injection', signature_id: 2011541, category: 'web-application-attack', severity: 1, weight: 0.65 },

  { signature: 'ET BRUTE_FORCE SSH brute force', signature_id: 2002911, category: 'brute-force', severity: 2, weight: 0.55 },

  { signature: 'ET POLICY Outbound SSH', signature_id: 2003068, category: 'policy-violation', severity: 3, weight: 0.25 },
  { signature: 'ET POLICY Possible Corporate Proxy', signature_id: 2013504, category: 'policy-violation', severity: 3, weight: 0.25 },
])

/** Reason strings that can fire without an IP tuple. */
export const ORPHAN_SIGNATURE_IDS = Object.freeze(
  SURICATA_SIGNATURES.filter((sig) => sig.orphan).map((sig) => sig.signature_id),
)
