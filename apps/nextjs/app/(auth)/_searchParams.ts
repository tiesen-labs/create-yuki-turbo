import { createSearchParamsCache, parseAsString } from 'nuqs/server'

export const redirect = {
  parsers: { redirectTo: parseAsString.withDefault('/') },
  configs: { urlKeys: { redirectTo: 'redirect_to' } },
}

export const redirectCaches = createSearchParamsCache(
  redirect.parsers,
  redirect.configs,
)
