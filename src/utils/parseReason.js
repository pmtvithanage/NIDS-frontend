/**
 * Parse a single `reasons[]` string emitted by the fusion engine.
 *
 * Supported formats (doc appendix):
 * - `suricata:<signature>`
 * - `mlp:<label>(<confidence>)`
 * - `ae:<ratio>x_threshold`
 *
 * @param {string} reason Raw reason string.
 * @returns {{ type: 'suricata', signature: string }
 *   | { type: 'mlp', label: string, confidence: number|null }
 *   | { type: 'ae', ratio: number|null }
 *   | { type: 'unknown', raw: string }
 *   | null}
 */
export function parseReason(reason) {
  if (typeof reason !== 'string' || reason.length === 0) return null

  if (reason.startsWith('suricata:')) {
    return { type: 'suricata', signature: reason.slice('suricata:'.length) }
  }

  if (reason.startsWith('mlp:')) {
    const body = reason.slice('mlp:'.length)
    const match = body.match(/^(.*)\(([0-9]*\.?[0-9]+)\)$/)
    if (match) {
      return { type: 'mlp', label: match[1], confidence: Number(match[2]) }
    }
    return { type: 'mlp', label: body, confidence: null }
  }

  if (reason.startsWith('ae:')) {
    const body = reason.slice('ae:'.length)
    const match = body.match(/^([0-9]*\.?[0-9]+)x_threshold$/)
    if (match) {
      return { type: 'ae', ratio: Number(match[1]) }
    }
    return { type: 'ae', ratio: null }
  }

  return { type: 'unknown', raw: reason }
}

/**
 * Parse a list of reason strings, dropping unparseable entries.
 * @param {string[]} [reasons=[]] Reason strings.
 * @returns {Array<ReturnType<typeof parseReason>>} Parsed reasons.
 */
export function parseReasons(reasons = []) {
  return reasons.map(parseReason).filter(Boolean)
}
