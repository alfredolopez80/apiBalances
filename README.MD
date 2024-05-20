
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

To get the balance in ETH or USDT for a given Ethereum address, make GET requests to the `/eth-balance` or `/usdt-balance` endpoints with the `address` query parameter.

### Example Requests

- To get the ETH balance for the address `0x28C6c06298d514Db089934071355E5743bf21d60`:

  ```sh
  curl -G http://localhost:3000/eth-balance --data-urlencode "address=0x28C6c06298d514Db089934071355E5743bf21d60"
  ```

- To get the USDT balance for the address `0x28C6c06298d514Db089934071355E5743bf21d60`:

  ```sh
  curl -G http://localhost:3000/usdt-balance --data-urlencode "address=0x28C6c06298d514Db089934071355E5743bf21d60"
  ```

These requests will return the balance in ETH or USDT for the provided address on the Ethereum Mainnet.
