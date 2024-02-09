import Redis from 'ioredis'
import siteConfig from '../../config/site.config'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
const kv = new Redis(process.env.REDIS_URL || '')

export async function getOdAuthTokens(user: string = ''): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const tokenPrefix = user ? `${siteConfig.kvPrefix}${user}_` : siteConfig.kvPrefix
  const accessToken = await kv.get(`${tokenPrefix}access_token`)
  const refreshToken = await kv.get(`${tokenPrefix}refresh_token`)

  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
  user = '',
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
  user: string
}): Promise<void> {
  const tokenPrefix = user ? `${siteConfig.kvPrefix}${user}_` : siteConfig.kvPrefix
  if (accessToken && accessTokenExpiry)
    await kv.set(`${tokenPrefix}access_token`, accessToken, 'EX', accessTokenExpiry)
  await kv.set(`${tokenPrefix}refresh_token`, refreshToken)
}

export async function hasOdAuthTokens({
  user = '',
}: {
  user: string
}): Promise<boolean> {
  const tokenPrefix = user ? `${siteConfig.kvPrefix}${user}_` : siteConfig.kvPrefix
  const hasAccessToken = await kv.exists(`${tokenPrefix}access_token`)
  const hasRefreshToken = await kv.exists(`${tokenPrefix}refresh_token`)
  return hasAccessToken === 1 || hasRefreshToken === 1
}