import "@/styles/global.scss";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import Head from "next/head";


export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: any;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page: ReactElement) => page);

  return (
    <>
      <Head>
        <title>{pageProps?.scope?.title}</title>
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}

export default MyApp;
