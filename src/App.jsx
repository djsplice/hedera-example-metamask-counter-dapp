import { useState } from "react";
import "./styles/App.css";
import walletConnectFcn from "./components/hedera/walletConnect.js";
import contractDeployFcn from "./components/hedera/contractDeploy.js";
import contractExecuteFcn from "./components/hedera/contractExecute.js";
import MyGroup from "./components/MyGroup.jsx";

function App() {
  const [walletData, setWalletData] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [contractAddress, setContractAddress] = useState();
  const [connectTextSt, setConnectTextSt] = useState("Connect your wallet to the Hedera network ");
  const [connectLinkSt, setConnectLinkSt] = useState("");
  const [contractTextSt, setContractTextSt] = useState("Deploy the counter smart contract ");
  const [contractLinkSt, setContractLinkSt] = useState("");
  const [executeTextSt, setExecuteTextSt] = useState("Execute the counter smart contract ");
  const [executeLinkSt, setExecuteLinkSt] = useState("");
  const [provider, setProvider] = useState(null);

  async function connectWallet() {
    console.log("connectWallet clicked!");
    if (account !== undefined) {
      console.log("Account already connected:", account);
      setConnectTextSt(`Account ${account} already connected `);
    } else {
      console.log("Calling walletConnectFcn...");
      const wData = await walletConnectFcn();
      console.log("walletConnectFcn returned:", wData);
  
      let newAccount = wData.accounts[0];
      if (newAccount !== undefined) {
        console.log("Setting new account:", newAccount);
        setConnectTextSt(`Account ${newAccount} connected `);
        setConnectLinkSt(`http://localhost:5551/account/${newAccount}`);
        setWalletData(wData);
        setAccount(newAccount);
        setProvider(wData.provider);
        console.log("Provider set to:", wData.provider);
        setContractTextSt("");
      } else {
        console.log("No account returned in wData.accounts");
      }
    }
  }

  async function contractDeploy() {
    console.log("contractDeploy clicked!");
    if (!provider || !account) {
      console.log("No provider or account available—connect wallet first");
      setContractTextSt(" Connect a wallet first! ");
      return;
    }
    console.log("Provider before calling contractDeployFcn:", provider);
    console.log("Calling contractDeployFcn...");
    try {
      const cAddress = await contractDeployFcn(provider);
      console.log("contractDeployFcn returned:", cAddress);
  
      if (cAddress === undefined) {
        console.log("Deployment failed—cAddress undefined");
        setContractTextSt(" Deployment failed! ");
      } else {
        setContractAddress(cAddress);
        setContractTextSt(`Contract ${cAddress} deployed `);
        setContractLinkSt(`http://localhost:5551/address/${cAddress}`);
        setExecuteTextSt(``);
      }
    } catch (error) {
      console.error("Error deploying contract:", error);
      setContractTextSt(" Error deploying contract! ");
    }
  }

  const [isExecuting, setIsExecuting] = useState(false);

  async function contractExecute() {
    console.log("contractExecute clicked!");
    if (contractAddress === undefined) {
      setExecuteTextSt("Deploy a contract first! ");
      return;
    }
    setIsExecuting(true);
    console.log("Calling contractExecuteFcn...");
    const [txHash, finalCount] = await contractExecuteFcn(walletData, contractAddress);
    console.log("contractExecuteFcn returned:", txHash, finalCount);
    if (txHash === undefined || finalCount === undefined) {
      console.log("Execution failed—txHash or finalCount undefined");
    } else {
      setExecuteTextSt(`Count is: ${finalCount} | Transaction hash: ${txHash} `);
      setExecuteLinkSt(`http://localhost:5551/tx/${txHash}`);
    }
    setIsExecuting(false);
  }

  return (
    <div className="App">
      <header className="App-header">
        <MyGroup
          text={connectTextSt}
          link={connectLinkSt}
          fcn={connectWallet}
          buttonLabel={"Connect Wallet"}
        />
        <MyGroup
          text={contractTextSt}
          link={contractLinkSt}
          fcn={contractDeploy}
          buttonLabel={"Deploy Contract"}
        />
       <MyGroup
  text={executeTextSt}
  link={executeLinkSt}
  fcn={contractExecute}
  buttonLabel={"Execute Contract (+1)"}
  disabled={isExecuting}
/>
      </header>
    </div>
  );
}

export default App;