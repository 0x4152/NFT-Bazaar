import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, Card } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import NFTABI from "../constants/BasicNft.json"
import NFTMarketABI from "../constants/NFTMarket.json"
import networkMapping from "../constants/networkMapping.json"
import { useNotification } from "web3uikit"
import { useState, useEffect } from "react"
export default function Home() {
    const [proceedsState, setProceeds] = useState(0)
    ///////////////////////////////////////////////
    //USENOTIFICATION
    ///////////////////////////////////////////////
    const dispatch = useNotification()
    ///////////////////////////////////////////////
    //MARKETPLACE ADDRESS SOURCING
    //chain Id from Moralis comes in HEX
    //////////////////////////////////////////
    const { chainId, isWeb3Enabled, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"
    const marketplaceAddress = networkMapping[chainString]["NFTMarket"][0]
    /////////////////////////////////////////////////////////////////
    //APPROVE AND LIST CONTRACT CALL
    //when we hit the submit button on form, its going to automatically pass the data object to the function that is executed onSubmit.
    /////////////////////////////////////////////////////////////////
    //import { useMoralis, useWeb3Contract } from "react-moralis"
    //import { ethers } from "ethers"
    /////////////////////////////////////////////////////////////////
    const { runContractFunction } = useWeb3Contract()
    ////////////
    //APPROVE///
    ////////////
    async function approveAndList(data) {
        console.log("approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult).toString()

        //This is a different way we can call runContractFunction from Moralis, where we set params on a separate object,

        const approveOptions = {
            abi: NFTABI,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }
        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }
    ////////////
    ///LIST/////
    ////////////
    //we create a separate function that will execute onSuccess of approval to our NFTMarket contract
    //it will execute the "listItem" function from our NFTMarket contract
    ////////////
    async function handleApproveSuccess(nftAddress, tokenId, price) {
        const listOptions = {
            abi: NFTMarketABI,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }
    //////////////////////////////////////////////////////////////
    //USENOTIFICATION
    //NotificationProvider around body, _app.js
    /////////////////////////////////////////////////////////////
    //import { useNotification } from "web3uikit"
    /////////////////////////////////////////////////////////////
    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "Item listed",
            title: "Item listed!",
            position: "topR",
        })
    }
    //////
    const { runContractFunction: getProceeds } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
            seller: account,
        },
    })
    async function updateUI() {
        const proceeds = await getProceeds()
        console.log(proceeds.toString())
        //ipfs gateway: everyone should be able to see the nfts

        setProceeds(proceeds.toString())
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            console.log(`rerendered from Sell page use effect, isWeb3Enabledd ${isWeb3Enabled}`)
        }
    }, [isWeb3Enabled])

    /////////////////////////////////
    //withdraw proceeds function
    ////////////////////////////////
    const handleWithdrawProceedsSuccess = () => {
        dispatch({
            type: "success",
            message: "The proceeds from the sale of your NFT's have been sent to your accountS",
            title: "Proceeds Withdrawn!",
            position: "topR",
        })
    }
    const { runContractFunction: withdrawProceeds } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "withdrawProceeds",
        params: {},
    })
    const handleProceedsCardClick = () => {
        console.log("handleProceedsCardClick")

        withdrawProceeds({
            onError: (error) => console.log(error),
            onSuccess: handleWithdrawProceedsSuccess,
        })
    }
    /////////////////////////////////////////////////////////////
    //FORM
    //We use Web3uikit Form that already handles the work of tracking state and submitting to a function
    //when we hit the submit button on form, its going to automatically pass the data object to the function that is executed onSubmit.
    /////////////////////////////////////////////////////////////
    //import { Form } from "web3uikit"
    /////////////////////////////////////////////////////////////
    return (
        <div className="container justify-center align-middle m-10">
            <div className="max-w-xl place-self-center justify-center space-y-16 ">
                <Form
                    className="p-12"
                    onSubmit={approveAndList}
                    title="Sell your NFT!"
                    id="Main Form"
                    data={[
                        {
                            name: "NFT Address",
                            type: "text",
                            inputWidth: "50%",
                            value: "",
                            key: "nftAddress",
                        },
                        {
                            name: "Token ID",
                            type: "number",
                            value: "",
                            key: "tokenId",
                        },
                        {
                            name: "Price (int ETH)",
                            type: "number",
                            value: "",
                            key: "price",
                        },
                    ]}
                />
                <Card
                    title="Click to withdraw your proceeds"
                    className="justify-center text-left"
                    onClick={handleProceedsCardClick}
                >
                    <div className=" text-left ">
                        <div className="m-4">
                            <div className="fond-bold ">
                                {ethers.utils.formatEther(proceedsState)} ETH
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
