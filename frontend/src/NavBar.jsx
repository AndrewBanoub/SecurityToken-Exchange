import React, { useState,useEffect } from "react";
import { ethers } from "ethers";

const NavBar = () => {
    const [account, setAccount] = useState("");

    useEffect(() => {
            getCurrentWalletConnected();
            addWalletListener();
            }, [account]);

    const connectWallet = async () => {
        if(typeof window != "undefined" && typeof window.ethereum != "undefined"){
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                //setProvider(provider);
                //const accounts = await provider.send("eth_requestAccounts", []);
                const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
                //setSigner(signer);
                //console.log(signer.address);
                //console.log(accounts[0]);
                setAccount(accounts[0]);
            } catch(err) {
                console.error(err.message);
            }
        } else {
            console.log("Pls install metamask!");
        }
    }
    
    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                //console.log(accounts[0]);
            } else {
                console.log("Connect to MetaMask using the Connect button");
            }
            } catch (err) {
            console.error(err.message);
            }
        } else {
            /* MetaMask is not installed */
            console.log("Please install MetaMask");
        }
        };
        
    const addWalletListener = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0]);
            //console.log(accounts[0]);
            });
        } else {
            /* MetaMask is not installed */
            setAccount("");
            console.log("Please install MetaMask");
        }
    };
    
    const networkInfo = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            const chainId = await window.ethereum.request({ method: "eth_chainId" })
            console.log("Current Network:", network);
            console.log("Current Network:", network.name);  // 'mainnet', 'goerli', etc.
            //console.log("Chain ID:", network.chainId);
            console.log("Chain ID:", chainId);
        } else {
        console.log("MetaMask is not installed!");
        }
    };

    return (
        <div className="exchange-container">
          {/* Navbar */}
          <nav className="navbar">
            <div className="logo">Uniswap Clone</div>
            <div className="nav-links">
              <a href="#swap">Swap</a>
              <a href="#pool">Pool</a>
              <a href="#analytics">Analytics</a>
            </div>
            <button className="wallet-button" onClick={networkInfo}>Network Info</button>
            {account && account.length > 0 ? (<p className="wallet-button">Connected Account: {account.substring(0,5)}...{account.substring(37)}</p>) : (<button className="wallet-button" onClick={connectWallet}>Connect Wallet</button>)}
          </nav>
        </div>
    )
}

export default NavBar;