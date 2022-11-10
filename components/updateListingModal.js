import { useState } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//When we apply useNotification, we need to also import a NotificationProvider on _app.js for it to work
//import { NotificationProvider } from "web3uikit"
////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { useWeb3Contract } from "react-moralis"
import NFTMarketABI from "../constants/NFTMarket.json"
import { ethers } from "ethers"

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    marketplaceAddress,
    isVisible,
    onClose,
}) {
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0)
    const dispatch = useNotification()
    console.log(priceToUpdateListingWith)
    /////////////////////////////////////////////////////////////////
    //this function will be called on success after making the smart contract call to update listing
    // its important that the smart contract call always returns the transaction, therefore we can use wait
    // we can also access other data from the transaction
    /////////////////////////////////////////////////////////////////
    async function handleUpdateListingSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }
    //web3uikit, popup, modal
    //contract function will be called onOk of the Modal
    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith.toString()),
        },
    })
    ///////////////////////////////////////////
    //delete function////////////////
    /////////////////////////////
    const { runContractFunction: cancelListing } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "cancelListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function handleCancelListingSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "listing deleted",
            title: "Listing updated - please refresh",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }
    const handleDeleteCLick = () => {
        console.log("handleDeleteClick")

        cancelListing({
            onError: (error) => console.log(error),
            onSuccess: (tx) => handleCancelListingSuccess(tx),
        })
    }
    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                console.log("running contract function Update Listing")
                updateListing({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: (tx) => handleUpdateListingSuccess(tx),
                })
            }}
        >
            <div className="m-4 flex p-4 place-content-center gap-x-52">
                <div>
                    Update listing price in ETH
                    <Input
                        label="0"
                        type="number"
                        name="New listing price"
                        onChange={(event) => {
                            setPriceToUpdateListingWith(event.target.value)
                        }}
                    ></Input>
                </div>
                <Card onClick={handleDeleteCLick} title="Delete this listing"></Card>
            </div>
        </Modal>
    )
}
