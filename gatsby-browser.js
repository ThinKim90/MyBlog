/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

// You can delete this file if you're not using it

// Import PrismJS CSS for code highlighting
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"

import { bundleSlug, toAnalyticsKey } from "./src/utils/slug"

const MAX_RETRY = 10
const RETRY_INTERVAL_MS = 250

const scheduleGoatCounterCount = (payload, attempt = 0) => {
  if (typeof window === "undefined") return
  const counter = window.goatcounter
  if (counter && typeof counter.count === "function") {
    counter.count(payload)
    return
  }

  if (attempt >= MAX_RETRY) {
    return
  }

  window.setTimeout(() => scheduleGoatCounterCount(payload, attempt + 1), RETRY_INTERVAL_MS)
}

export const onClientEntry = () => {
  if (typeof window === "undefined") return
  window.goatcounter = window.goatcounter || {}
  window.goatcounter.no_onload = true
  window.goatcounter.path = (pathname) => toAnalyticsKey(pathname || window.location?.pathname || "/")
}

export const onRouteUpdate = ({ location }) => {
  if (typeof window === "undefined") return

  const { analyticsKey } = bundleSlug(location?.pathname || "/")
  const payload = {
    path: analyticsKey,
    title: typeof document !== "undefined" ? document.title : undefined,
    referrer: typeof document !== "undefined" ? document.referrer : undefined,
  }

  scheduleGoatCounterCount(payload)
}
