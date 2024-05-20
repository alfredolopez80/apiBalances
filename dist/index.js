"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Ensure the environment variable is defined
if (!process.env.INFURA_PROJECT_ID) {
    throw new Error('Please define INFURA_PROJECT_ID in your .env file');
}
// Default configuration for Ethereum Mainnet
const ethProviderUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
// Function to get ETH balance
function getEthBalance(provider, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield provider.getBalance(address);
        return ethers_1.ethers.formatEther(balance);
    });
}
// Function to get USDT balance
function getUsdtBalance(provider, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const usdtAbi = [
            // We only need the balanceOf method from the USDT ABI
            'function balanceOf(address owner) view returns (uint256)'
        ];
        const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const usdtContract = new ethers_1.ethers.Contract(usdtContractAddress, usdtAbi, provider);
        const balance = yield usdtContract.balanceOf(address);
        return ethers_1.ethers.formatUnits(balance, 6); // USDT has 6 decimals
    });
}
// Function to get the balances in ETH and USDT
function getBalances(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(ethProviderUrl);
        const ethBalance = yield getEthBalance(provider, address);
        const usdtBalance = yield getUsdtBalance(provider, address);
        return {
            ethBalance,
            usdtBalance
        };
    });
}
app.get('/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.query;
        if (!address || typeof address !== 'string') {
            return res.status(400).send({ error: 'Address is required' });
        }
        const balances = yield getBalances(address);
        res.send(balances);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
