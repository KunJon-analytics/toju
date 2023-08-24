# Toju Project Backend

This folder contains the backend code for the Toju Project. The backend is built using Hardhat and houses the smart contracts, tests, and deployment scripts for the Toju platform.

## Getting Started

Before running the backend code, make sure you have Node.js and npm (or yarn) installed on your machine.

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/KunJon-analytics/toju.git
   ```

2. Navigate to the `backend` folder:

   ```bash
   cd backend
   ```

3. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Configure Ethereum Network:

   - Set up a compatible Ethereum wallet (e.g., MetaMask) with access to the Sepolia testnet.
   - Ensure you have Alchemy set up and configured.

5. Deploy Smart Contracts:

   - Update the deployment script (`scripts/deploy.js`) with your wallet's private key and Ethereum node URL.
   - Run the deployment script to deploy the smart contracts to the Sepolia testnet:

     ```bash
     npx hardhat run scripts/deploy.js --network sepolia
     ```

6. Interact with the smart contracts by using the generated contract artifacts in the `frontend` code.

## Smart Contracts

The smart contracts in this project facilitate the core functionality of Toju, including project creation, funding, and management. Here are some of the key contracts:

- **TojuToken.sol**: The TOJU token contract, which represents the platform's native token.

- **Toju.sol**: A contract for creating new projects on the Toju platform, representing individual projects, with functions for accepting contributions, checking milestones, and more.

- **ExceptionMessages.sol**: A library of errors for the contract.

- **TojuLibrary.sol**: A helper library of functions for the ToJu platform.

- ...

## Testing

To ensure the correctness of the smart contracts, run the provided tests:

```bash
npx hardhat test
```

## Technologies Used

- Hardhat: A development environment for Ethereum that makes it easy to compile, test, and deploy smart contracts.

- Solidity: The programming language used for writing Ethereum smart contracts.

- Ethereum (Sepolia testnet): The blockchain network used for testing and deployment.

- Faker Js for creating sample projects.

## License

This backend code for the Toju Project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback related to the backend, please feel free to contact us:

- Email: [johnadelakun1@gmail.com](mailto:johnadelakun1@gmail.com)
- Twitter: [@kunjongroup](https://twitter.com/kunjongroup)
