import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Ensure the environment variable is defined
if (!process.env.INFURA_PROJECT_ID) {
    throw new Error('Please define INFURA_PROJECT_ID in your .env file');
}

// Default configuration for Ethereum Mainnet
const ethProviderUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;

// Function to get ETH balance
async function getEthBalance(provider: ethers.JsonRpcProvider, address: string): Promise<string> {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
}

// Function to get USDT balance
async function getUsdtBalance(provider: ethers.JsonRpcProvider, address: string): Promise<string> {
    const usdtAbi = [
        // We only need the balanceOf method from the USDT ABI
        'function balanceOf(address owner) view returns (uint256)'
    ];
    const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, provider);
    const balance = await usdtContract.balanceOf(address);
    return ethers.formatUnits(balance, 6); // USDT has 6 decimals
}

// Endpoint to get ETH balance
app.get('/eth-balance', async (req: Request, res: Response) => {
    try {
        const { address } = req.query;

        if (!address || typeof address !== 'string') {
            return res.status(400).send({ error: 'Address is required' });
        }

        const provider = new ethers.JsonRpcProvider(ethProviderUrl);
        const ethBalance = await getEthBalance(provider, address);
        res.send({ ethBalance });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Endpoint to get USDT balance
app.get('/usdt-balance', async (req: Request, res: Response) => {
    try {
        const { address } = req.query;

        if (!address || typeof address !== 'string') {
            return res.status(400).send({ error: 'Address is required' });
        }

        const provider = new ethers.JsonRpcProvider(ethProviderUrl);
        const usdtBalance = await getUsdtBalance(provider, address);
        res.send({ usdtBalance });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
