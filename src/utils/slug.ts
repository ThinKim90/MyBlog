/*
 * Shared slug/path helpers used across browser and server code.
 * The actual implementations live in utils/path-helpers.js (CommonJS)
 * so Gatsby's Node APIs can reuse them.
 */

type Normaliser = (value: string) => string

type LegacyNormaliser = (value: string) => string | null

type HelperModule = {
  canonicalise: Normaliser
  stripTrailingSlash: Normaliser
  toAnalyticsKey: Normaliser
  normaliseExplicitSlug: Normaliser
  normaliseLegacyPath: LegacyNormaliser
}

const helpers = require('../../utils/path-helpers') as HelperModule

export const toCanonicalPath = (value: string) => helpers.canonicalise(value)

export const toCanonicalPathWithoutTrailingSlash = (value: string) =>
  helpers.stripTrailingSlash(value)

export const toAnalyticsKey = (value: string) => helpers.toAnalyticsKey(value)

export const normaliseExplicitSlug = (value: string) => helpers.normaliseExplicitSlug(value)

export const normaliseLegacyPath = (value: string) => helpers.normaliseLegacyPath(value)

export type SlugBundle = {
  canonical: string
  withoutTrailingSlash: string
  analyticsKey: string
}

export const bundleSlug = (value: string): SlugBundle => {
  const canonical = toCanonicalPath(value)
  return {
    canonical,
    withoutTrailingSlash: toCanonicalPathWithoutTrailingSlash(canonical),
    analyticsKey: toAnalyticsKey(canonical),
  }
}
