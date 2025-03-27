import abi from "../../contracts/abi.js";
import bytecode from "../../contracts/bytecode.js";
import { ContractFactory } from "ethers";

const contractDeployFcn = async (provider) => {
	console.log(`\n=======================================`);
	console.log(`- Deploying smart contract on Hedera...🟠`);
	console.log("Provider received:", provider);
  
	const signer = provider.getSigner();
	const address = await signer.getAddress();
	console.log("Signer address:", address);
  
	let contractAddress;
	const maxRetries = 5;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
	  try {
		const gasLimit = 8000000;
		const myContract = new ContractFactory(abi, bytecode, signer);
		const contractDeployTx = await myContract.deploy({ gasLimit: gasLimit });
		console.log(`- Attempt ${attempt} - Deploy TX Hash:`, contractDeployTx.deployTransaction.hash);
		console.log(`- Attempt ${attempt} - Deploy TX:`, contractDeployTx);
		const contractDeployRx = await contractDeployTx.deployTransaction.wait();
		console.log(`- Attempt ${attempt} - Deploy Receipt:`, contractDeployRx);
		contractAddress = contractDeployRx.contractAddress;
		console.log(`- Contract deployed to address: \n${contractAddress} ✅`);
		break; // Exit loop on success
	  } catch (deployError) {
		console.log(`- Attempt ${attempt} failed:`, deployError);
		if (attempt === maxRetries) {
		  console.log(`- All retries exhausted`);
		  return undefined;
		}
		await new Promise(res => setTimeout(res, 3000)); // Wait 3s before retry
	  }
	}
  
	return contractAddress;
  };
  
  export default contractDeployFcn;