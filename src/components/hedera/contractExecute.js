import { ethers } from "ethers";

const abi = [
  {"inputs":[],"name":"count","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"increment","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

const contractExecuteFcn = async (walletData, contractAddress) => {
  console.log(`\n=======================================`);
  console.log(`- Executing the smart contract...`);
  console.log("Wallet Data received:", walletData);

  const provider = walletData.provider;
  const signer = provider.getSigner();

  let txHash;
  let finalCount;
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const myContract = new ethers.Contract(contractAddress, abi, signer);

      // CHECK INITIAL STATE
      const initialCount = (await myContract.count()).toString();
      console.log(`- Attempt ${attempt} - Initial count: ${initialCount}`);

      // EXECUTE INCREMENT
      const incrementTx = await myContract.increment({ gasLimit: 1000000 });
      const incrementRx = await incrementTx.wait();
      txHash = incrementRx.transactionHash;

      // CHECK FINAL STATE
      finalCount = (await myContract.count()).toString();
      console.log(`- Attempt ${attempt} - Final count: ${finalCount}`);
      console.log(`- Contract executed. Transaction hash: \n${txHash} `);
      break; // Exit on success
    } catch (executeError) {
      console.log(`- Attempt ${attempt} failed:`, executeError);
      if (attempt === maxRetries) {
        console.log(`- All retries exhausted`);
        return [undefined, undefined];
      }
      await new Promise(res => setTimeout(res, 3000)); // Wait 3s before retry
    }
  }

  return [txHash, finalCount];
};

export default contractExecuteFcn;