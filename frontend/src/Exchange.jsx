import React, { useState,useEffect } from "react";
import { ethers } from "ethers";
//import Web3Modal from "web3modal";
//import WalletConnectProvider from "@walletconnect/web3-provider";
import tokenABIJson from "../../SmartContract/artifacts/contracts/TribeSTO.sol/TribeSTO.json";
import exchangeABIJson from "../../SmartContract/artifacts/contracts/Exchange.sol/Exchange.json";

const tokenABI = tokenABIJson.abi;
const exchangeABI = exchangeABIJson.abi;

const tokenContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const exchangeContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const Exchange = () => {   

    const [switchButton, SetSwitchButton] = useState(true);
    const [Input1, SetInput1] = useState("");
    const [Input2, SetInput2] = useState("");
    const [placeHolder1, SetPlaceHolder1] = useState("");
    const [placeHolder2, SetPlaceHolder2] = useState("");
    const [depositAmount, setDepositAmount] = useState("");

    const [contractLiquidity,setContractLiquidity] = useState(() => {
      const savedLiquidity = sessionStorage.getItem("liquidityKey");
      return savedLiquidity ? JSON.parse(savedLiquidity) : "";
    });

    const [contractTokenBalance,setContractTokenBalance] = useState(() => {
      const savedBalance = sessionStorage.getItem("balanceKey");
      return savedBalance ? JSON.parse(savedBalance) : "";
    });
    const [contractEthBalance,setContractEthBalance] = useState(() => {
      const savedEthBalance = sessionStorage.getItem("ethbalanceKey");
      return savedEthBalance ? JSON.parse(savedEthBalance) : "";
    });

    useEffect(() => {
      tokenInContract();
      ethInContract();
      contractTotalLiquidity();
    },[]) 
    
    useEffect(() => {
      sessionStorage.setItem("balanceKey", JSON.stringify(contractTokenBalance));
    },[contractTokenBalance]);

    useEffect(() => {
      sessionStorage.setItem("ethbalanceKey", JSON.stringify(contractEthBalance));
    },[contractEthBalance]);

    useEffect(() => {
      sessionStorage.setItem("liquidityKey", JSON.stringify(contractLiquidity));
    },[contractLiquidity]);

    useEffect(() => {
      calculateInput1();
    },[Input2]);

    useEffect(() => {
      calculateInput2();
    },[Input1]);

    const switchCurrencyDirections = () => {
      if(switchButton == true){
        SetSwitchButton(false);
        SetInput2(placeHolder2);
      } else if (switchButton == false){
        SetSwitchButton(true);
        SetInput1(placeHolder1);
      }
    }

    const ownCalculations = (inputAmount,inputReserve,outputReserve) => {
      const inputAmountWithFee = BigInt((Number(inputAmount) * (1000 - 3)) / 1000);
      const outputAmount = outputReserve - ((outputReserve * inputReserve) / (inputAmountWithFee + inputReserve));
      return outputAmount;
    }

    const ownCalculations2 = (outputAmount,outputReserve,inputReserve) => {
      const outputAmountWithFee = BigInt((Number(outputAmount) * (1000 + 3)) / 1000);
      const inputAmount = ((outputReserve * inputReserve) / (outputReserve - outputAmountWithFee)) - inputReserve;
      return inputAmount;
    }

    const calculateInput1 = async() => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer);
      const tokenContract = new ethers.Contract(tokenContractAddress,tokenABI,signer);
      const tokenInContract = await tokenContract.balanceOf(exchangeContract);
      const ethInContract = await provider.getBalance(exchangeContractAddress);
      try{
        const tx = await exchangeContract.getOutputAmount(ethers.parseEther(Input2),ethInContract,tokenInContract);
        //(ethInContract-(ethers.parseEther(Input2)))
        const tx2 = ownCalculations(ethers.parseEther(Input2),ethInContract,tokenInContract);
        const tx3 = ownCalculations2(ethers.parseEther(Input2),ethInContract,tokenInContract);
        if(switchButton){
          SetPlaceHolder1(ethers.formatEther(tx3));
        } else if (!switchButton){
          SetPlaceHolder1(ethers.formatEther(tx));
        }
        //SetPlaceHolder1(ethers.formatEther(tx));
        console.log("check");
        console.log(ethers.formatEther(tx3));
        console.log(ethers.formatEther(tx));
      } catch (error){
        console.error("error",error);
      }
    };

    const calculateInput2 = async() => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer);
      const tokenContract = new ethers.Contract(tokenContractAddress,tokenABI,signer);
      const tokenInContract = await tokenContract.balanceOf(exchangeContract);
      const ethInContract = await provider.getBalance(exchangeContractAddress);
      try{
        const tx = await exchangeContract.getOutputAmount(ethers.parseEther(Input1),tokenInContract,ethInContract);
        const tx2 = ownCalculations(ethers.parseEther(Input1),tokenInContract,ethInContract);
        const tx3 = ownCalculations2(ethers.parseEther(Input1),tokenInContract,ethInContract);
        //console.log("Token", tokenInContract, "Eth:", ethInContract, "input:", ethers.parseEther(Input1));
        if(switchButton){
          SetPlaceHolder2(ethers.formatEther(tx));
        } else if (!switchButton){
          SetPlaceHolder2(ethers.formatEther(tx3));
        }
        //SetPlaceHolder2(ethers.formatEther(tx));
        console.log(ethers.formatEther(tx3));
        console.log(ethers.formatEther(tx));
      } catch (error){
        console.error("error",error);
      }
    };

    const contractTotalLiquidity = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer);
        const tx = await exchangeContract.totalLiquidity();
        const bla = ethers.formatEther(tx)
        setContractLiquidity(bla);
      } catch (error) {
        console.error("Transaction failed", error);
      }
    }

    const ethInContract = async () => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contractEthBalance = await provider.getBalance(exchangeContractAddress);
        const bla = ethers.formatEther(contractEthBalance)
        setContractEthBalance(bla);
      } catch (error){
        console.error("Transfer failed:", error);
      }
    }

    const tokenInContract = async () => {
        try{
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);
            const tx = await tokenContract.balanceOf(exchangeContractAddress);
            const decimals = await tokenContract.decimals();
            const tokenBalance = ethers.formatUnits(tx,decimals);
            setContractTokenBalance(tokenBalance);
            //console.log("balance:" , balance);
        } catch (error) {
            console.error("Transfer failed:", error);
        } 
    };

    const depositDividends = async () => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(tokenContractAddress,tokenABI,signer);
        const tx = await tokenContract.depositDividends({
            value: ethers.parseEther(depositAmount)
          });
        console.log("Hello", tx);
        await tx.wait(); // Wait for the transaction to be mined
        console.log("Transaction confirmed");
      } catch (error){
        console.error("Transaction failed",error);
      }
    }

    const returnOwner = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(tokenContractAddress,tokenABI,provider);
        const signedTokenContract = tokenContract.connect(signer);
        const tx = await signedTokenContract.owner();
        console.log("Owner:", tx);
    }

    const addLiquidity = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer)
        const tx = await exchangeContract.addLiquidity(500,{
          value: ethers.parseEther("2.5")
        });
        console.log("Hello", tx);
        await tx.wait(); // Wait for the transaction to be mined
        console.log("Transaction confirmed");
        //setContractLiquidity(contractLiquidity+tx.value)
        //setContractEthBalance(contractEthBalance+tx.value)
      } catch (error) {
        console.error("Transaction f failed", error);
      }
        
    };

    return (
      <div className="exchange-container">
        {/* Swap Interface */}
        <div className="swap-section">
          <h1>Swap</h1>
          <div className="swap-card">
            
            {switchButton ? (
            <div>
                {/* Token Input 1 */}
              <div className="token-input">
                <label>From</label>
                <div className="input-group">
                  <input type="text" value={placeHolder1} onChange={(e) => {
                    SetInput1(e.target.value);
                    SetPlaceHolder1(e.target.value);
                  }} placeholder="0" />
                  <button className="token-select">TRIBE ▼</button>
                </div>
                <p>Balance: 0.00</p>
              </div>
    
              {/* Swap Icon */}
              <button className="swap-icon" onClick={()=>{
                switchCurrencyDirections();
              }}>↓</button>
    
              {/* Token Input 2 */}
              <div className="token-input">
                <label>To</label>
                <div className="input-group">
                  <input type="text" value={placeHolder2} onChange={(e) => {
                    SetInput2(e.target.value);
                    SetPlaceHolder2(e.target.value);
                    }} placeholder="0" />
                  <button className="token-select">ETH ▼</button>
                </div>
                <p>Balance: 0.00</p>
              </div>
            </div>
            ) : (
            <div>
                {/* Token Input 2 */}
              <div className="token-input">
                <label>From</label>
                <div className="input-group">
                  <input type="text" value={placeHolder2} onChange={(e) => {
                    SetInput2(e.target.value);
                    SetPlaceHolder2(e.target.value);
                    }} placeholder="0" />
                  <button className="token-select">ETH ▼</button>
                </div>
                <p>Balance: 0.00</p>
              </div>
    
              {/* Swap Icon */}
              <button className="swap-icon" onClick={()=>{
                switchCurrencyDirections();
              }}>↓</button>

              {/* Token Input 1 */}
              <div className="token-input">
                <label>To</label>
                <div className="input-group">
                  <input type="text" value={placeHolder1} onChange={(e) => {
                    SetInput1(e.target.value);
                    SetPlaceHolder1(e.target.value);
                    }} placeholder="0" />
                  <button className="token-select">TRIBE ▼</button>
                </div>
                <p>Balance: 0.00</p>
              </div>
            </div>
            )}
            
  
            {/* Price Info */}
            <div className="price-info">
              <p>Price: 1 ETH = 2000 USDT</p>
              <p>Slippage: 0.5%</p>
            </div>
  
            {/* Swap Button */}
            <button className="swap-button">Swap</button>
          </div>
        </div>
        <div className="test-buttons">
            <input type="number" min="0.1" max="100" placeholder="1" value={depositAmount} onChange={(e) => {setDepositAmount(e.target.value)}}></input>
            <button onClick={depositDividends}>Deposit Dividends</button>
            <button onClick={addLiquidity}>Add liquidity</button>
            <p>Total Liquidity: {contractLiquidity}</p>
            <p>ETH Balance: {contractEthBalance}</p>
            <p>Token Balance: {contractTokenBalance}</p>
        </div>
      </div>
    );
};
  export default Exchange;
  