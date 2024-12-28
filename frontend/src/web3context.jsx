import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import tokenABIJson from "../../SmartContract/artifacts/contracts/TribeSTO.sol/TribeSTO.json";
import exchangeABIJson from "../../SmartContract/artifacts/contracts/Exchange.sol/Exchange.json";

const tokenABI = tokenABIJson.abi;
const exchangeABI = exchangeABIJson.abi;

const tokenContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const exchangeContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// Context to share the Web3 data
const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(new ethers.BrowserProvider(window.ethereum));
  const [signer, setSigner] = useState(async () => {
    const sign = await provider.getSigner()
    return sign;
  });
  const [contract, setContract] = useState(new ethers.Contract(exchangeContractAddress, exchangeABI, signer));
  const [account, setAccount] = useState(async() => {
    const accounts = await provider.listAccounts();
    return accounts[0];
  }); 

  /*useEffect(() => {
    const initWeb3 = async () => {
      // Initialize provider (for reading data)
      const provider = new ethers.BrowserProvider(window.ethereum);
      //await provider.send("eth_requestAccounts", []); // Request account access

      // Get the signer (for writing data)
      const signer = await provider.getSigner();

      // Get the current account
      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);

      // Initialize the contract instance with the signer
      const contract = new ethers.Contract(exchangeContractAddress, exchangeABI, signer);

      // Update state with provider, signer, contract, and account
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
    };

    if (window.ethereum) {
      initWeb3();
    }
  }, []); // Runs once when the component is mounted*/

  return (
    <Web3Context.Provider value={{ provider, signer, contract, account }}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to access Web3Context values
export const useWeb3 = () => useContext(Web3Context);
