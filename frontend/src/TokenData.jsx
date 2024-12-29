import React, { useState,useEffect } from "react";
import { ethers } from "ethers";

import tokenABIJson from "../../SmartContract/artifacts/contracts/TribeSTO.sol/TribeSTO.json";
const tokenABI = tokenABIJson.abi;
const tokenContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Tokendata = () => {
    const [holderAddress, setHolderAddress] = useState("");
    const [transferRecipient, setTransferRecipient] = useState("");
    const [transferValue, setTransferValue] = useState("");
    const [balance,setBalance] = useState("0");
    const [approveAddress,setApproveAddress] = useState("");
    const [approveValue,setApproveValue] = useState("");
    const [allowanceAddress,setAllowanceAddress] = useState("");
    const [allowanceValue,setAllowanceValue] = useState("");

    const [name, setName] = useState(() => {
        const savedName = sessionStorage.getItem("nameKey");
        return savedName ? JSON.parse(savedName) : "";
      });
    const [symbol, setSymbol] = useState(() => {
        const savedSymbol = sessionStorage.getItem("symbolKey");
        return savedSymbol ? JSON.parse(savedSymbol) : "";
      });
    const [totalSupply, setTotalSupply] = useState(() => {
        const savedSupply = sessionStorage.getItem("supplyKey");
        return savedSupply ? JSON.parse(savedSupply) : "";
      });

    useEffect(() => {
        sessionStorage.setItem("nameKey", JSON.stringify(name));
      }, [name]);

    useEffect(() => {
    sessionStorage.setItem("symbolKey", JSON.stringify(symbol));
    }, [symbol]);

    useEffect(() => {
    sessionStorage.setItem("supplyKey", JSON.stringify(totalSupply));
    }, [totalSupply]);//
  
    useEffect(() => {
      fetchData();
    }, []);

    const allowance = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);
          const tx = await tokenContract.allowance("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",allowanceAddress);
          const bla = ethers.formatEther(tx);
          setAllowanceValue(bla);
      } catch (error){
        console.error("Transaction failed",error);
      }
    }

    const approve = async () => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);
          const tx = await tokenContract.approve(approveAddress,ethers.parseEther(approveValue));
      } catch (error){
        console.error("Transaction failed",error);
      }
    }
  
    const fetchData = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);
  
          const _name = await tokenContract.name();
          const _symbol = await tokenContract.symbol();
          const _totalSupply = await tokenContract.totalSupply();
  
          setName(_name);
          setSymbol(_symbol);
          setTotalSupply(ethers.formatUnits(_totalSupply, 18)); // Assuming 18 decimals
        } catch (error) {
          console.error("Error fetching token data:", error);
        }
    };

    const transfer = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);
  
        const tx = await tokenContract.transfer(transferRecipient, ethers.parseUnits(transferValue, 18)); // Assuming 18 decimals
        await tx.wait(); // Wait for transaction to be mined
        alert("Transfer successful!");
      } catch (error) {
        console.error("Transfer failed:", error);
      }
    };

    const balanceOf = async () => {
         if (!ethers.isAddress(holderAddress)) {
            console.error("Invalid address:", holderAddress);
            return;
         };
        try{
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, provider);
            const tx = await tokenContract.balanceOf(holderAddress);
            const decimals = await tokenContract.decimals();
            const tokenBalance = ethers.formatUnits(tx,decimals);
            setBalance(tokenBalance);
            //console.log("balance:" , balance);
        } catch (error) {
            console.error("Transfer failed:", error);
        }
        
    };
  
    return (
      <div>
        <h1>Token Data</h1>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Symbol:</strong> {symbol}</p>
        <p><strong>Total Supply:</strong> {totalSupply}</p>
  
        <div>
          <h2>Transfer Tokens</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={transferRecipient}
            onChange={(e) => setTransferRecipient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={transferValue}
            onChange={(e) => setTransferValue(e.target.value)}
          />
          <button onClick={transfer}>Send Token</button>
        </div>
        <div>
          <h2>Approve Transfers</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={approveAddress}
            onChange={(e) => setApproveAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={approveValue}
            onChange={(e) => setApproveValue(e.target.value)}
          />
          <button onClick={approve}>Approve</button>
        </div>
        <div>
          <input
              type="text"
              placeholder="Address"
              value={holderAddress}
              onChange={(e) => setHolderAddress(e.target.value)}
            />
            <button onClick={balanceOf}>Get Balance</button>
            <p>Balance: {balance} Tribe Token</p>
        </div>
        <div>
          <input
              type="text"
              placeholder="Address"
              value={allowanceAddress}
              onChange={(e) => setAllowanceAddress(e.target.value)}
            />
            <button onClick={allowance}>Get Allowance</button>
            <p>Allowance Value: {allowanceValue}</p>
        </div>
      </div>
    );
  };

export default Tokendata;