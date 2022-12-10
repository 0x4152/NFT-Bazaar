import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import NFTBox from "../components/NFTBox"
import { useMoralis, useMoralisQuery } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import { useQuery } from "@apollo/client"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const marketplaceAddress = networkMapping[chainString]["NFTMarket"][0]
    console.log(chainString)
    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">
                {chainString != 5 ? "Please connect to the Göerli testnet" : "Recently Listed NFTs"}
            </h1>
            <div className="flex flex-wrap space-x-6">
                {isWeb3Enabled ? (
                    chainString == 5 ? (
                        loading || !listedNfts ? (
                            <div>loading...</div>
                        ) : (
                            <div>
                                <div className="py-4 px-4">Click on the NFT to buy it! </div>
                                <div className="flex flex-wrap space-x-6">
                                    {listedNfts.activeItems.map((nft) => {
                                        console.log(nft)
                                        const { price, nftAddress, tokenId, seller } = nft
                                        return (
                                            <NFTBox
                                                price={price}
                                                nftAddress={nftAddress}
                                                tokenId={tokenId}
                                                marketplaceAddress={marketplaceAddress}
                                                seller={seller}
                                                key={`${nftAddress}${tokenId}`}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="py-4 px-4"> Thank you for your patience </div>
                    )
                ) : (
                    <div> Web3 currently not enabled, please connect your wallet</div>
                )}
            </div>
        </div>
    )
}
