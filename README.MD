
# Ethereum Balance API

This project provides an API to get the balance of ETH and USDT for a given Ethereum address.

## Setup

### Step 1: Initialize the Project

1. Initialize a Node.js project (if not already done):

   ```sh
   npm init -y
   ```

2. Install the necessary dependencies:

   ```sh
   npm install express ethers dotenv
   npm install --save-dev typescript ts-node @types/node @types/express
   ```

3. Create a TypeScript configuration file (`tsconfig.json`):

   ```json
   {
     "compilerOptions": {
       "target": "ES6",
       "module": "commonjs",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "outDir": "./dist"
     },
     "include": ["src/**/*"]
   }
   ```

### Step 2: Configure Environment Variables

1. Create a `.env` file in the root of the project:

   ```sh
   touch .env
   ```

2. Add your Infura Project ID to the `.env` file:

   ```env
   INFURA_PROJECT_ID=your_infura_project_id
   ```

### Step 3: Create the Server and API Logic

1. Create a directory `src` and a file `index.ts` inside it:

   ```sh
   mkdir src
   touch src/index.ts
   ```

2. Write the following code in `src/index.ts`:

   ```typescript
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
   async function getEthBalance(provider: ethers.providers.JsonRpcProvider, address: string): Promise<string> {
     const balance = await provider.getBalance(address);
     return ethers.utils.formatEther(balance);
   }

   // Function to get USDT balance
   async function getUsdtBalance(provider: ethers.providers.JsonRpcProvider, address: string): Promise<string> {
     const usdtAbi = [
       // We only need the balanceOf method from the USDT ABI
       'function balanceOf(address owner) view returns (uint256)'
     ];
     const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
     const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, provider);
     const balance = await usdtContract.balanceOf(address);
     return ethers.utils.formatUnits(balance, 6); // USDT has 6 decimals
   }

   // Function to get the balances in ETH and USDT
   async function getBalances(address: string): Promise<{ ethBalance: string; usdtBalance: string }> {
     const provider = new ethers.providers.JsonRpcProvider(ethProviderUrl);

     const ethBalance = await getEthBalance(provider, address);
     const usdtBalance = await getUsdtBalance(provider, address);

     return {
       ethBalance,
       usdtBalance
     };
   }

   app.get('/balance', async (req: Request, res: Response) => {
     try {
       const { address } = req.query;

       if (!address || typeof address !== 'string') {
         return res.status(400).send({ error: 'Address is required' });
       }

       const balances = await getBalances(address);
       res.send(balances);
     } catch (error) {
       console.error(error);
       res.status(500).send({ error: 'Internal Server Error' });
     }
   });

   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

### Step 4: Compile and Run the Server

1. Compile the TypeScript code:

   ```sh
   npx tsc
   ```

2. Run the server:

   ```sh
   node dist/index.js
   ```

## Usage

To get the balance in ETH and USDT for a given Ethereum address, make a GET request to the `/balance` endpoint with the `address` query parameter.

### Example Request

Use the following `curl` command to get the balance for the address `0x28C6c06298d514Db089934071355E5743bf21d60`:

```sh
curl -G http://localhost:3000/balance --data-urlencode "address=0x28C6c06298d514Db089934071355E5743bf21d60"
```

This will return the balance in ETH and USDT for the provided address on the Ethereum Mainnet.
