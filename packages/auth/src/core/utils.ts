export const setCorsHeaders = (res: Response): void => {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
  res.headers.set('Access-Control-Allow-Headers', '*')
}

export const createRedirectResponse = (url: string | URL): Response =>
  new Response(null, {
    status: 302,
    headers: { location: url.toString() },
  })
