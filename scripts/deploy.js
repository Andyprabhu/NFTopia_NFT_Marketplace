const hre = require("hardhat");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();

  await nftMarketplace.deployed();

  //TRANSFER FUNDS
  const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  const transferFunds = await TransferFunds.deploy();

  await transferFunds.deployed();

  console.log(
    ` deployed nftmarketplace contract Address ${nftMarketplace.address}`
  );
  console.log(
    ` deployed Transferfunds contract Address ${transferFunds.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//npx hardhat run scripts/deploy.js --network polygon_amoy
//npx hardhat run scripts/deploy.js --network localhost
