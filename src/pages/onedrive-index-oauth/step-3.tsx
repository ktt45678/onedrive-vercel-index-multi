import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../../../config/site.config'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export async function getServerSideProps({ query, locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default function OAuthStep3() {
  const router = useRouter()

  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>
        <title>{t('OAuth Step 3 - {{title}}', { title: siteConfig.title })}</title>
      </Head>

      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />

        <div className="mx-auto w-full max-w-5xl p-4">
          <div className="rounded bg-white p-3 dark:bg-gray-900 dark:text-gray-100">
            <div className="mx-auto w-52">
              <Image
                src="/images/fabulous-celebration.png"
                width={912}
                height={912}
                alt="fabulous celebration"
                priority
              />
            </div>
            <h3 className="mb-4 text-center text-xl font-medium">
              {t('Welcome to your new OneDrive-Index 🎉')}
            </h3>

            <h3 className="mt-4 mb-2 text-lg font-medium">{t('Step 3/3: Finish')}</h3>

            <div>
              <p className="py-1 font-medium">{t('Success! The API returned what we needed.')}</p>

              <p className="py-1 text-sm font-medium text-teal-500">
                <FontAwesomeIcon icon="exclamation-circle" className="mr-1" />{' '}
                {t('These tokens may take a few seconds to populate after you click the button below. ') +
                  t('If you go back home and still see the welcome page telling you to re-authenticate, ') +
                  t('revisit home and do a hard refresh.')}
              </p>

              <div className="mb-2 mt-6 text-right">
                <button
                  className={`rounded-lg bg-gradient-to-br px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:ring-4 from-green-500 to-teal-300 focus:ring-green-200 dark:focus:ring-green-800`}
                  onClick={() => {
                    router.push('/')
                  }}
                >
                  <span>{t('Home')}</span> <FontAwesomeIcon className="ml-2" icon={faHome} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
