import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";

//INTERNAL  IMPORT
import {
  NFTMarketplaceAddress,
  NFTMarketplaceABI,
  transferFundsAddress,
  transferFundsABI,
  handleNetworkSwitch,
} from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract", error);
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Discover, collect, and sell NFTs in NFTopia";

  //------USESTAT
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const router = useRouter();

  //---CHECK IF WALLET IS CONNECTD

  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");
      const network = await handleNetworkSwitch();

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const getBalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getBalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        // setError("No Account Found");
        // setOpenError(true);
        console.log("No account");
      }
    } catch (error) {
      // setError("Something wrong while connecting to wallet");
      // setOpenError(true);
      console.log("not connected");
    }
  };

  //---CONNET WALLET FUNCTION
  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");
      const network = await handleNetworkSwitch();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts);
      setCurrentAccount(accounts[0]);

      connectingWithSmartContract();
    } catch (error) {
      setError("Error while connecting to wallet");
      setOpenError(true);
    }
  };

  //---UPLOAD TO IPFS FUNCTION
  const uploadToPinata = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `85df1f4bd0357870280f`,
            pinata_secret_api_key: `078ff8145e3058b42ae6b292ba072c4eec2c2d7becf5d8a2d6a4d86b578ea76d`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

        return ImgHash;
      } catch (error) {
        setError("Unable to upload image to Pinata");
        setOpenError(true);
        console.log(error);
      }
    }
    setError("File Is Missing, Kindly provide your file");
    setOpenError(true);
  };

  //---CREATENFT FUNCTION
  const createNFT = async (name, price, image, description, router) => {
    if (!name || !description || !price || !image)
      return setError("Data Is Missing"), setOpenError(true);

    const data = JSON.stringify({ name, description, image });

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `85df1f4bd0357870280f`,
          pinata_secret_api_key: `078ff8145e3058b42ae6b292ba072c4eec2c2d7becf5d8a2d6a4d86b578ea76d`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(url);

      await createSale(url, price);
      router.push("/searchPage");
    } catch (error) {
      setError("Error while creating NFT");
      setOpenError(true);
    }
  };

  //--- createSale FUNCTION
  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      const price = ethers.utils.parseUnits(formInputPrice, "ether");

      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();

      const transaction = !isReselling
        ? await contract.createToken(url, price, {
            value: listingPrice.toString(),
          })
        : await contract.resellToken(id, price, {
            value: listingPrice.toString(),
          });

      await transaction.wait();
      console.log(transaction);
    } catch (error) {
      setError("error while creating sale");
      setOpenError(true);
      console.log(error);
    }
  };

  //--FETCHNFTS FUNCTION

  const fetchNFTs = async () => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const contract = fetchContract(provider);

        const data = await contract.fetchMarketItems();

        console.log(data);

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);

              const {
                data: { image, name, description },
              } = await axios.get(tokenURI, {});
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
              };
            }
          )
        );
        console.log("NFT", items);
        return items;
      }

      // }
    } catch (error) {
      setError("Error while fetching NFTS");
      setOpenError(true);
      console.log(error);
    }
  };

  //--FETCHING MY NFT OR LISTED NFTs
  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectingWithSmartContract();

        const data =
          type == "fetchItemsListed"
            ? await contract.fetchItemsListed()
            : await contract.fetchMyNFTs();

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);
              const {
                data: { image, name, description },
              } = await axios.get(tokenURI);
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
              };
            }
          )
        );
        return items;
      }
    } catch (error) {
      setError("Error while fetching listed NFTs");
      setOpenError(true);
      console.log(error);
    }
  };

  //---BUY NFTs FUNCTION
  const buyNFT = async (nft) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectingWithSmartContract();
        const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

        const transaction = await contract.createMarketSale(nft.tokenId, {
          value: price,
        });

        await transaction.wait();
        router.push("/author");
      }
    } catch (error) {
      setError("Error While buying NFT");
      setOpenError(true);
    }
  };

  //----TRANSFER FUNDS

  const fetchTransferFundsContract = (signerOrProvider) =>
    new ethers.Contract(
      transferFundsAddress,
      transferFundsABI,
      signerOrProvider
    );

  const connectToTransferFunds = async () => {
    try {
      const web3Modal = new Wenb3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchTransferFundsContract(signer);
      return contract;
    } catch (error) {
      console.log(error);
    }
  };
  //---TRANSFER FUNDS
  const [transactionCount, setTransactionCount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const transferEther = async (address, ether, message) => {
    try {
      if (currentAccount) {
        const contract = await connectToTransferFunds();
        console.log(address, ether, message);

        const unFormatedPrice = ethers.utils.parseEther(ether);
        // //FIRST METHOD TO TRANSFER FUND
        await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: currentAccount,
              to: address,
              gas: "0x5208",
              value: unFormatedPrice._hex,
            },
          ],
        });

        const transaction = await contract.addDataToBlockchain(
          address,
          unFormatedPrice,
          message
        );

        console.log(transaction);

        setLoading(true);
        transaction.wait();
        setLoading(false);

        const transactionCount = await contract.getTransactionCount();
        setTransactionCount(transactionCount.toNumber());
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //FETCH ALL TRANSACTION
  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const contract = await connectToTransferFunds();

        const avaliableTransaction = await contract.getAllTransactions();

        const readTransaction = avaliableTransaction.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        }));

        setTransactions(readTransaction);
        console.log(transactions);
      } else {
        console.log("On Ethereum");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        uploadToPinata,
        checkIfWalletConnected,
        connectWallet,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
        currentAccount,
        titleData,
        setOpenError,
        openError,
        error,
        accountBalance,
        transferEther,
        getAllTransactions,
        transactions,
        transactionCount,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
