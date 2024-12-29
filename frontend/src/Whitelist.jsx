import React, { useState,useEffect } from "react";
import { ethers } from "ethers";

import tokenABIJson from "../../SmartContract/artifacts/contracts/TribeSTO.sol/TribeSTO.json";

const tokenABI = tokenABIJson.abi;

const tokenContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Whitelist = () => {
    const [whitelist,setWhitelist] = useState([]);
    const [Input,setInput] = useState("");
    const [Check,setCheck] = useState("");

    const WhitelistCheck = async() => {
        if (!ethers.isAddress(Check)) {
            console.error("Invalid address:", Check);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, provider);
            const tx = await tokenContract.isWhitelisted(Check);
        
            console.log("Is the wallet whitelisted?:",tx);
        } catch (error) {
            console.error("Transaction test failed:", error);
        }
    };

    const handleWhitelist = async() => {
        if (!ethers.isAddress(Input)) {
            console.error("Invalid address:", Input);
            return;
        } else if (whitelist.includes(Input)) {
            console.error("Address is already whitelisted", Input);
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);
            //{gasLimit: ethers.parseUnits("1","gwei")}
            const tx = await tokenContract.whitelistAddress(Input, true);
        
            console.log("Transaction sent:", tx);
        
            const receipt = await tx.wait(); // Warten, bis die Transaktion bestätigt wird
            console.log("Transaction confirmed:", receipt);
        
            // Zustand nur aktualisieren, wenn die Transaktion erfolgreich war
            setWhitelist((prevWhitelist) => [...prevWhitelist, Input]);
            setInput("");
        } catch (error) {
            console.error("Transaction test failed:", error);
        }
    };

    return (
        <div>
            <button onClick={handleWhitelist}>Add to Whitelist</button>
            <input type="text" value={Input} onChange={(e) => {setInput(e.target.value)}}></input>
            <button onClick={WhitelistCheck}>Whitelist Check</button>
            <input type="text" value={Check} onChange={(e) => {setCheck(e.target.value)}}></input>
            <p>Whitelist:</p>
            <ul>
                {whitelist.map((item, index) => (<li key={index}>{item}</li>))}
            </ul>
        </div>
    )
}


export default Whitelist;