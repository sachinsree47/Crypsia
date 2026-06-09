import { ethers } from "ethers";

// Crypsia Supply Chain Smart Contract ABI
const SUPPLY_CHAIN_ABI = [
  "function registerProduct(string productId, bytes32 productHash) external",
  "function updateProductStage(string productId, string stage, address actor) external",
  "function getProductHistory(string productId) external view returns (tuple(string stage, address actor, uint256 timestamp)[])",
  "event ProductRegistered(string indexed productId, bytes32 productHash, address manufacturer)",
  "event StageUpdated(string indexed productId, string stage, address actor)",
];

export interface BlockchainEvent {
  stage: string;
  actor: string;
  timestamp: number;
}

export interface BlockchainTxResult {
  txHash: string;
  blockNumber: number;
  network: string;
  actorAddress: string;
}

/**
 * Hash product data into a bytes32 value for on-chain registration
 */
export function hashProductData(data: {
  productId: string;
  productName: string;
  batchNumber: string;
  productionDate: string;
  quantity: number;
  factoryLocation: string;
}): string {
  const encoded = ethers.solidityPacked(
    ["string", "string", "string", "string", "uint256", "string"],
    [data.productId, data.productName, data.batchNumber, data.productionDate, data.quantity, data.factoryLocation]
  );
  return ethers.keccak256(encoded);
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string | null = null;

  /**
   * Connect to MetaMask and optionally bind a smart contract
   */
  async connect(contractAddress?: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask or compatible wallet not found. Please install MetaMask.");
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();

    if (contractAddress) {
      this.contractAddress = contractAddress;
      this.contract = new ethers.Contract(contractAddress, SUPPLY_CHAIN_ABI, this.signer);
    }

    return address;
  }

  async getNetwork(): Promise<{ name: string; chainId: bigint }> {
    if (!this.provider) throw new Error("Not connected to wallet");
    return this.provider.getNetwork();
  }

  isConnected(): boolean {
    return !!this.signer;
  }

  hasContract(): boolean {
    return !!this.contract;
  }

  /**
   * Register a product on the blockchain with its data hash.
   * If no contract is deployed, simulates a transaction for demo purposes.
   */
  async registerProduct(productId: string, productHash: string): Promise<BlockchainTxResult> {
    if (!this.signer) throw new Error("Wallet not connected");

    if (this.contract) {
      const tx = await this.contract.registerProduct(productId, productHash);
      const receipt = await tx.wait();
      const network = await this.getNetwork();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        network: network.name,
        actorAddress: await this.signer.getAddress(),
      };
    }

    // Simulation mode: sign a message as proof of intent
    return this.simulateTransaction("registerProduct", productId, productHash);
  }

  /**
   * Record a stage update on the blockchain.
   */
  async updateProductStage(productId: string, stage: string): Promise<BlockchainTxResult> {
    if (!this.signer) throw new Error("Wallet not connected");
    const actorAddress = await this.signer.getAddress();

    if (this.contract) {
      const tx = await this.contract.updateProductStage(productId, stage, actorAddress);
      const receipt = await tx.wait();
      const network = await this.getNetwork();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        network: network.name,
        actorAddress,
      };
    }

    return this.simulateTransaction("updateProductStage", productId, stage);
  }

  /**
   * Get on-chain history for a product
   */
  async getProductHistory(productId: string): Promise<BlockchainEvent[]> {
    if (!this.contract) return [];
    const history = await this.contract.getProductHistory(productId);
    return history.map((entry: any) => ({
      stage: entry.stage,
      actor: entry.actor,
      timestamp: Number(entry.timestamp),
    }));
  }

  /**
   * Simulation mode: creates a deterministic "tx hash" by signing a message.
   * This allows the full UX flow without a deployed contract.
   */
  private async simulateTransaction(method: string, ...args: string[]): Promise<BlockchainTxResult> {
    if (!this.signer || !this.provider) throw new Error("Wallet not connected");

    const message = JSON.stringify({ method, args, timestamp: Date.now() });
    const signature = await this.signer.signMessage(message);
    const txHash = ethers.keccak256(ethers.toUtf8Bytes(signature));
    const network = await this.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();

    return {
      txHash,
      blockNumber,
      network: `${network.name} (simulated)`,
      actorAddress: await this.signer.getAddress(),
    };
  }
}

export const blockchainService = new BlockchainService();
