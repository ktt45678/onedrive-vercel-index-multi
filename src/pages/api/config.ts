import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    clientId: process.env.CLIENT_ID || '',
    userPrincipalName: process.env.USER_PRINCIPAL_NAME || '',
    baseDirectory: process.env.BASE_DIRECTORY || '/',
    userList: process.env.USER_LIST ? process.env.USER_LIST.split(',') : []
  })
}
