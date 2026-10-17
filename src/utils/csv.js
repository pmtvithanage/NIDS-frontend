/**
 * RFC 4180-ish CSV serialization and browser download helpers.
 * @module utils/csv
 */

/**
 * Escape a single CSV field: quote when it contains a comma, quote or newline.
 * @param {unknown} value Raw value.
 * @returns {string} Escaped field.
 */
export function escapeCsvField(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * Serialize rows to CSV text.
 * @param {Array<Record<string, unknown>>} rows Row objects.
 * @param {ReadonlyArray<{key: string, label: string}>} columns Column definitions.
 * @returns {string} CSV document.
 */
export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCsvField(column.label)).join(',')
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvField(row[column.key])).join(','),
  )
  return [header, ...lines].join('\n')
}

/**
 * Trigger a client-side download of a text payload.
 * @param {string} filename Suggested file name.
 * @param {string} text File content.
 * @returns {void}
 */
export function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
