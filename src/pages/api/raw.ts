import { posix as pathPosix } from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosResponseHeaders } from 'axios'
import Cors from 'cors'

import { driveApi, cacheControlHeader, redirectCacheControlHeader } from '../../../config/api.config'
import { protectedRoutes } from '../../../config/site.config'
import { encodePath, getAccessToken, checkAuthRoute } from '.'

// CORS middleware for raw links: https://nextjs.org/docs/api-routes/api-middlewares
export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const cors = Cors({ methods: ['GET', 'HEAD'] })
  return new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = '/', odpt = '', proxy = false, redirect = '308', user } = req.query

  const userPrefix = Array.isArray(user) ? user[0] : user

  const accessToken = await getAccessToken(userPrefix)
  if (!accessToken) {
    res.status(403).json({ error: 'No access token.' })
    return
  }

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    res.status(400).json({ error: 'Path query invalid.' })
    return
  }
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  if (protectedRoutes.length) {
    // Handle protected routes authentication
    const odTokenHeader = (req.headers['od-protected-token'] as string) ?? odpt

    const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
    // Status code other than 200 means user has not authenticated yet
    if (code !== 200) {
      res.status(code).json({ error: message })
      return
    }
    // If message is empty, then the path is not protected.
    // Conversely, protected routes are not allowed to serve from cache.
    if (message !== '') {
      res.setHeader('Cache-Control', 'no-cache')
    }
  }

  await runCorsMiddleware(req, res)
  try {
    // Handle response from OneDrive API
    const requestUrl = `${driveApi}/root${encodePath(cleanPath)}`
    const { data } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
        select: 'id,size,@microsoft.graph.downloadUrl',
      },
    })

    if ('@microsoft.graph.downloadUrl' in data) {
      // Only proxy raw file content response for files up to 4MB
      if (proxy && 'size' in data && data['size'] < 4194304) {
        const { headers, data: stream } = await axios.get(data['@microsoft.graph.downloadUrl'] as string, {
          responseType: 'stream',
        })
        headers['Cache-Control'] = cacheControlHeader
        // Send data stream as response
        res.writeHead(200, headers as AxiosResponseHeaders)
        stream.pipe(res)
      } else {
        const redirectCode = +redirect
        const statusCode = redirectCode >= 300 && redirectCode <= 308 ? redirectCode : 308
        res.setHeader('Cache-Control', redirectCacheControlHeader);
        res.redirect(statusCode, data['@microsoft.graph.downloadUrl'])
      }
    } else {
      res.status(404).json({ error: 'No download url found.' })
    }
    return
  } catch (error: any) {
    res.status(error?.response?.status ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
    return
  }
}
