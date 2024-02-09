import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation, Trans } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../../../config/site.config'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { LoadingIcon } from '../../components/Loading'
import SwitchUser, { users } from '../../components/SwitchUser'
import { sendTokenToServer } from '../../utils/oAuthHandler'
import useLocalStorage from '../../utils/useLocalStorage'

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default function OAuthStep2() {
  const router = useRouter()

  const [accessToken, setAccessToken] = useState('')
  const [accessTokenExpiry, setAccessTokenExpiry] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [buttonLoading, setButtonLoading] = useState(false)
  const [errorContent, setErrorContent] = useState(<></>)

  const [preferredUser, _] = useLocalStorage('preferredUser', users[0])

  const { t } = useTranslation()

  const sendAuthTokensToServer = async () => {
    await sendTokenToServer(accessToken, refreshToken, accessTokenExpiry, preferredUser.value)
      .then(() => {
        setButtonLoading(false)
        setTimeout(() => {
          router.push({ pathname: '/onedrive-index-oauth/step-3' })
        }, 2000)
      })
      .catch(_ => {
        setButtonLoading(false)
        setErrorContent(
          <div>
            <span>{t('Error storing the token')}</span> <FontAwesomeIcon icon="exclamation-circle" />
          </div>
        )
      })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>
        <title>{t('OAuth Step 2 - {{title}}', { title: siteConfig.title })}</title>
      </Head>

      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />

        <div className="mx-auto w-full max-w-5xl p-4">
          <div className="rounded bg-white p-3 dark:bg-gray-900 dark:text-gray-100">
            <SwitchUser />
            <div className="mx-auto w-52">
              <Image
                src="/images/fabulous-come-back-later.png"
                width={912}
                height={912}
                alt="fabulous come back later"
                priority
              />
            </div>
            <h3 className="mb-4 text-center text-xl font-medium">
              {t('Welcome to your new OneDrive-Index 🎉')}
            </h3>

            <h3 className="mt-4 mb-2 text-lg font-medium">{t('Step 2/3: Get authorisation token')}</h3>

            <p className="py-1 text-sm font-medium text-red-400">
              <Trans>
                <FontAwesomeIcon icon="exclamation-circle" className="mr-1" /> If you are not the owner of this website,
                stop now, as continuing with this process may expose your personal files in OneDrive.
              </Trans>
            </p>

            <input
              className={`my-2 w-full flex-1 rounded border bg-gray-50 p-2 font-mono text-sm font-medium focus:outline-none focus:ring dark:bg-gray-800 dark:text-white ${
                accessToken
                  ? 'border-green-500/50 focus:ring-green-500/30 dark:focus:ring-green-500/40'
                  : 'border-red-500/50 focus:ring-red-500/30 dark:focus:ring-red-500/40'
              }`}
              autoFocus
              type="text"
              placeholder="Access token"
              onChange={e => {
                setAccessToken(e.target.value)
              }}
            />

            <input
              className={`my-2 w-full flex-1 rounded border bg-gray-50 p-2 font-mono text-sm font-medium focus:outline-none focus:ring dark:bg-gray-800 dark:text-white ${
                accessTokenExpiry
                  ? 'border-green-500/50 focus:ring-green-500/30 dark:focus:ring-green-500/40'
                  : 'border-red-500/50 focus:ring-red-500/30 dark:focus:ring-red-500/40'
              }`}
              type="text"
              placeholder="Access token expires in (seconds)"
              onChange={e => {
                setAccessTokenExpiry(e.target.value)
              }}
            />

            <input
              className={`my-2 w-full flex-1 rounded border bg-gray-50 p-2 font-mono text-sm font-medium focus:outline-none focus:ring dark:bg-gray-800 dark:text-white ${
                refreshToken
                  ? 'border-green-500/50 focus:ring-green-500/30 dark:focus:ring-green-500/40'
                  : 'border-red-500/50 focus:ring-red-500/30 dark:focus:ring-red-500/40'
              }`}
              type="text"
              placeholder="Refresh token"
              onChange={e => {
                setRefreshToken(e.target.value)
              }}
            />

            <div className="mb-2 mt-6 text-right">
              <button
                className="rounded-lg bg-gradient-to-br from-green-500 to-cyan-400 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:grayscale dark:focus:ring-green-800"
                disabled={refreshToken === ''}
                onClick={() => {
                  setButtonLoading(true)
                  sendAuthTokensToServer()
                }}
              >
                {buttonLoading ? (
                  <>
                    <span>{t('Saving tokens')}</span> <LoadingIcon className="ml-1 inline h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>{t('Save tokens')}</span> <FontAwesomeIcon className="ml-2" icon={faFloppyDisk} />
                  </>
                )}
              </button>
            </div>
            { errorContent }
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
