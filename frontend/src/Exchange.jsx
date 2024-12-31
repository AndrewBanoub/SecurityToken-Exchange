import React, { useState,useEffect } from "react";
import { ethers } from "ethers";
//import Web3Modal from "web3modal";
//import WalletConnectProvider from "@walletconnect/web3-provider";
import tokenABIJson from "../../SmartContract/artifacts/contracts/TribeSTO.sol/TribeSTO.json";
import exchangeABIJson from "../../SmartContract/artifacts/contracts/Exchange.sol/Exchange.json";

const tokenABI = tokenABIJson.abi;
const exchangeABI = exchangeABIJson.abi;

const tokenContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const exchangeContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const Exchange = () => {   

    const [switchButton, SetSwitchButton] = useState(true);
    const [Input1, SetInput1] = useState("");
    const [Input2, SetInput2] = useState("");
    const [placeHolder1, SetPlaceHolder1] = useState("");
    const [placeHolder2, SetPlaceHolder2] = useState("");
    const [addLiquidityAmountEth, setAddLiquidityAmountEth] = useState("");
    const [addLiquidityAmountToken, setAddLiquidityAmountToken] = useState("");
    const [userBalanceEth, setUserBalanceEth] = useState("");
    const [userBalanceToken, setUserBalanceToken] = useState("");

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
      UserBalance();
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

    const swap = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer);
        if (switchButton){
          const tx = await exchangeContract.tokenToEthSwap(ethers.parseEther(placeHolder1),ethers.parseEther(placeHolder2));
          console.log("Swap", tx);
          await tx.wait();
          console.log("Transaction confirmed");
          //console.log("Event", receipt.events);
          const events = await exchangeContract.queryFilter('Swap');
          const lastEvent = events[events.length-1];
          console.log("Swap from", ethers.formatEther(lastEvent.args.inputAmount), "TRIBE to", ethers.formatEther(lastEvent.args.outputAmount), "ETH");
        
        } else if (!switchButton){
          const tx = await exchangeContract.ethToTokenSwap(ethers.parseEther(placeHolder1),{value:ethers.parseEther(placeHolder2)});
          console.log("Swap", tx);
          await tx.wait();
          console.log("Transaction confirmed");
          //console.log("Event", receipt.events[0]);
          const events = await exchangeContract.queryFilter('Swap');
          const lastEvent = events[events.length-1];
          console.log("Swap from", ethers.formatEther(lastEvent.args.inputAmount), "ETH to", ethers.formatEther(lastEvent.args.outputAmount), "TRIBE");
        }
        UserBalance();
        tokenInContract();
        ethInContract();
        contractTotalLiquidity();
      } catch (error){
        console.error("Transaction failed", error)
      }
    }

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
        //const tx2 = ownCalculations(ethers.parseEther(Input2),ethInContract,tokenInContract);
        const tx3 = ownCalculations2(ethers.parseEther(Input2),ethInContract,tokenInContract);
        if(switchButton){
          SetPlaceHolder1(ethers.formatEther(tx3));
        } else if (!switchButton){
          SetPlaceHolder1(ethers.formatEther(tx));
        }
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
        //const tx2 = ownCalculations(ethers.parseEther(Input1),tokenInContract,ethInContract);
        const tx3 = ownCalculations2(ethers.parseEther(Input1),tokenInContract,ethInContract);
        //console.log("Token", tokenInContract, "Eth:", ethInContract, "input:", ethers.parseEther(Input1));
        if(switchButton){
          SetPlaceHolder2(ethers.formatEther(tx));
        } else if (!switchButton){
          SetPlaceHolder2(ethers.formatEther(tx3));
        }
      } catch (error){
        console.error("error",error);
      }
    };

    const UserBalance = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const EthBalance = await provider.getBalance(signer);
        const contract = new ethers.Contract(tokenContractAddress,tokenABI,signer)
        const TokenBalance = await contract.balanceOf(signer);
        setUserBalanceEth(ethers.formatEther(EthBalance));
        setUserBalanceToken(ethers.formatEther(TokenBalance));
      } catch (error) {
        console.error("Transaction failed", error);
      }
    }

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

    const addLiquidity = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer)
        const tx = await exchangeContract.addLiquidity(ethers.parseEther(addLiquidityAmountToken),{
          value: ethers.parseEther(addLiquidityAmountEth)
        });
        console.log("Transaction", tx);
        await tx.wait(); // Wait for the transaction to be mined
        console.log("Transaction confirmed");
        UserBalance();
        tokenInContract();
        ethInContract();
        contractTotalLiquidity();
      } catch (error) {
        console.error("Transaction failed", error);
      }
    };

    const removeLiquidity = async() => {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const exchangeContract = new ethers.Contract(exchangeContractAddress,exchangeABI,signer)
        const tx = await exchangeContract.removeLiquidity(ethers.parseEther(addLiquidityAmountEth));
        console.log("Transaction:", tx);
        await tx.wait(); 
        console.log("Transaction confirmed");
        UserBalance();
        tokenInContract();
        ethInContract();
        contractTotalLiquidity();
      } catch (error) {
        console.error("Transaction failed", error);
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
                    if(e.target.value !== ""){
                    SetInput1(e.target.value);
                    SetPlaceHolder1(e.target.value);
                  } else{
                    SetPlaceHolder1(e.target.value);
                    SetInput1("0");
                  }
                  }} placeholder="0" />
                  <button className="token-select">TRIBE ▼</button>
                </div>
                <p>Balance: {userBalanceToken}</p>
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
                    if(e.target.value !== ""){
                      SetInput2(e.target.value);
                      SetPlaceHolder2(e.target.value);
                    } else{
                      SetPlaceHolder2(e.target.value);
                      SetInput2("0");
                    }
                    }} placeholder="0" />
                  <button className="token-select">ETH ▼</button>
                </div>
                <p>Balance: {userBalanceEth}</p>
              </div>
            </div>
            ) : (
            <div>
                {/* Token Input 2 */}
              <div className="token-input">
                <label>From</label>
                <div className="input-group">
                  <input type="text" value={placeHolder2} onChange={(e) => {
                    if(e.target.value !== ""){
                      SetInput2(e.target.value);
                      SetPlaceHolder2(e.target.value);
                    } else{
                      SetPlaceHolder2(e.target.value);
                      SetInput2("0");
                    }
                    }} placeholder="0" />
                  <button className="token-select">ETH ▼</button>
                </div>
                <p>Balance: {userBalanceEth}</p>
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
                    if(e.target.value !== ""){
                      SetInput1(e.target.value);
                      SetPlaceHolder1(e.target.value);
                    } else{
                      SetPlaceHolder1(e.target.value);
                      SetInput1("0");
                    }
                    }} placeholder="0" />
                  <button className="token-select">TRIBE ▼</button>
                </div>
                <p>Balance: {userBalanceToken}</p>
              </div>
            </div>
            )}
            
  
            {/* Price Info */}
            <div className="price-info">
              <p>Price: 1 ETH = {contractTokenBalance/contractEthBalance} TRIBE</p>
              <p>Slippage: 0.5%</p>
            </div>
  
            {/* Swap Button */}
            <button onClick={swap} className="swap-button">Swap</button>
          </div>
        </div>
        <div className="test-buttons">
            <input type="number" placeholder="0 ETH" value={addLiquidityAmountEth} onChange={(e) => {setAddLiquidityAmountEth(e.target.value)}}></input>
            <input type="number" placeholder="0 TRIBE" value={addLiquidityAmountToken} onChange={(e) => {setAddLiquidityAmountToken(e.target.value)}}></input>
            <button onClick={addLiquidity}>Add liquidity</button>
            <button onClick={removeLiquidity}>Remove liquidity</button>
            <p>Total Liquidity Added: {contractLiquidity}</p>
            <p>ETH Balance: {contractEthBalance}</p>
            <p>Token Balance: {contractTokenBalance}</p>
        </div>
      </div>
    );
};
  export default Exchange;
  