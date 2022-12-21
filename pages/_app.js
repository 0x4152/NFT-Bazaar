import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://api.studio.thegraph.com/query/37227/bazaar-goerli/v0.0.4", //subrgaphAPI/details window deployment query url
})
function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>NFT Bazaar</title>
                <meta name="description" content="Buy and sell your NFTs" />
                <link rel="icon" href="/iconoNFT.png" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Header />

                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
