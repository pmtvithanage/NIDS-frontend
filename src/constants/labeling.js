/**
 * Labeling page constants: keyboard map and queue display limits.
 * @module constants/labeling
 */

import { LABEL } from './labels.js'

/** Single-key → human label bindings for fast triage. */
export const LABEL_KEY_MAP = Object.freeze({
  b: LABEL.BENIGN,
  d: LABEL.DDOS,
  p: LABEL.PORT_SCAN,
  o: LABEL.BOT,
  w: LABEL.WEB_ATTACK,
})

/** Key that skips the current card without labeling. */
export const SKIP_KEY = 's'

/** Number of upcoming cards previewed under the active card. */
export const UPCOMING_LIMIT = 4
