import { ethers } from "ethers";

const walletConnectFcn = async () => {
  console.log("=======================================");
  console.log("Initializing provider...");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  console.log("Provider initialized:", !!provider);

  console.log("- Switching network to Hedera Private...");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x12a" }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      console.log("- Network not found, adding Hedera Private...");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x12a",
          chainName: "Hedera Private",
          rpcUrls: ["http://localhost:7546"],
          nativeCurrency: {
            name: "HBAR",
            symbol: "ℏ",
            decimals: 18,
          },
          blockExplorerUrls: ["http://localhost:5551"],
        }],
      });
    } else {
      throw switchError;
    }
  }

  console.log("- Requesting accounts...");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return { provider, accounts };
};

export default walletConnectFcn;