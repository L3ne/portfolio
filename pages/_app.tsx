import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Head>
        <title>ざくろ - len</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}