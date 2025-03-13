#!/usr/bin/env node

/**
 * Script for deploying the TARDI staking smart contract to the Sui blockchain
 * 
 * This script handles the publishing of the Move package and initialization
 * of the staking pool on the specified Sui network.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');
const ora = require('ora');
const { 
  SuiClient, 
  getFullnodeUrl,
  Ed25519Keypair,
  RawSigner,
  TransactionBlock
} = require('@mysten/sui.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants
const NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  DEVNET: 'devnet',
  LOCAL: 'local'
};

// Configure command line options
program
  .option('-n, --network <network>', 'Network to deploy to (mainnet, testnet, devnet, local)', 'testnet')
  .option('-k, --key <privateKey>', 'Private key for deployment (or use PRIVATE_KEY env var)')
  .option('-g, --gas-budget <budget>', 'Gas budget for deployment transaction', '50000000')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--dry-run', 'Perform a dry run without actual deployment')
  .parse(process.argv);

const options = program.opts();

// Setup spinner
const spinner = ora('Initializing deployment process...').start();

// Helper for verbose logging
const logVerbose = (message) => {
  if (options.verbose) {
    spinner.info(message);
    spinner.start();
  }
};

/**
 * Validate the environment and options
 */
const validateEnvironment = () => {
  // Validate network
  const network = options.network.toLowerCase();
  if (!Object.values(NETWORKS).includes(network)) {
    spinner.fail(`Invalid network: ${network}. Use one of: ${Object.values(NETWORKS).join(', ')}`);
    process.exit(1);
  }

  // Validate private key
  const privateKey = options.key || process.env.PRIVATE_KEY;
  if (!privateKey) {
    spinner.fail('No private key provided. Use --key flag or set PRIVATE_KEY environment variable.');
    process.exit(1);
  }

  // Validate that Move.toml exists
  const moveTomlPath = path.resolve(__dirname, '../contracts/Move.toml');
  if (!fs.existsSync(moveTomlPath)) {
    spinner.fail('Move.toml not found in contracts directory.');
    process.exit(1);
  }

  return { network, privateKey };
};

/**
 * Check if Sui CLI is installed
 */
const checkSuiCli = () => {
  try {
    const version = execSync('sui --version').toString().trim();
    logVerbose(`Sui CLI version: ${version}`);
  } catch (error) {
    spinner.fail('Sui CLI not found. Please install it first: https://docs.sui.io/build/install');
    process.exit(1);
  }
};

/**
 * Compile the contract
 */
const compileContract = () => {
  try {
    spinner.text = 'Compiling contract...';
    const contractsDir = path.resolve(__dirname, '../contracts');
    
    // Change to contracts directory
    process.chdir(contractsDir);
    
    // Run build command
    const buildOutput = execSync('sui move build').toString();
    logVerbose('Build output:');
    logVerbose(buildOutput);
    
    // Check for successful build
    if (!buildOutput.includes('Success')) {
      spinner.fail('Contract compilation failed.');
      console.error(buildOutput);
      process.exit(1);
    }
    
    return true;
  } catch (error) {
    spinner.fail('Contract compilation failed');
    console.error(error.toString());
    process.exit(1);
  }
};

/**
 * Get client and signer instances
 */
const getClientAndSigner = (network, privateKey) => {
  try {
    // Create Sui client for the specified network
    const nodeUrl = getFullnodeUrl(network);
    const client = new SuiClient({ url: nodeUrl });
    
    // Create keypair from private key
    // Note: Private key should be in base64 format without 0x prefix
    let keyPair;
    try {
      // Handle both formats: with or without 0x prefix
      const cleanKey = privateKey.startsWith('0x') 
        ? privateKey.slice(2) 
        : privateKey;
      
      keyPair = Ed25519Keypair.fromSecretKey(
        Buffer.from(cleanKey, 'hex')
      );
    } catch (error) {
      spinner.fail('Invalid private key format');
      throw error;
    }
    
    // Create signer
    const signer = new RawSigner(keyPair, client);
    
    return { client, signer };
  } catch (error) {
    spinner.fail('Failed to initialize Sui client');
    console.error(error);
    process.exit(1);
  }
};

/**
 * Publish the contract package
 */
const publishContract = async (signer, gasBudget) => {
  try {
    spinner.text = 'Publishing contract...';
    
    if (options.dryRun) {
      spinner.info('Dry run: Skipping contract publication');
      return { packageId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' };
    }
    
    // Build transaction for publishing
    const compiledModules = getCompiledModules();
    const tx = new TransactionBlock();
    
    // Upload modules to the transaction
    const [upgradeCap] = tx.publish({
      modules: compiledModules,
    });
    
    // Transfer upgrade capability to sender
    tx.transferObjects([upgradeCap], tx.pure(await signer.getAddress()));
    
    // Set gas budget
    tx.setGasBudget(parseInt(gasBudget));
    
    // Execute transaction
    spinner.text = 'Submitting transaction...';
    const result = await signer.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEvents: true,
        showEffects: true,
        showObjectChanges: true,
      },
    });
    
    // Check for success
    if (result.effects?.status?.status !== 'success') {
      spinner.fail('Transaction failed');
      console.error(result.effects?.status);
      process.exit(1);
    }
    
    // Extract package ID
    const publishEvent = result.events?.find(event => 
      event.type.includes('::UpgradeCap')
    );
    
    if (!publishEvent) {
      spinner.fail('Could not find package ID in events');
      console.error(result);
      process.exit(1);
    }
    
    const packageId = publishEvent.packageId;
    
    return { packageId, result };
  } catch (error) {
    spinner.fail('Contract publication failed');
    console.error(error);
    process.exit(1);
  }
};

/**
 * Initialize the staking pool
 */
const initializeStakingPool = async (signer, packageId, gasBudget) => {
  try {
    spinner.text = 'Initializing staking pool...';
    
    if (options.dryRun) {
      spinner.info('Dry run: Skipping staking pool initialization');
      return { poolId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' };
    }
    
    // Build transaction for initialization
    const tx = new TransactionBlock();
    
    // Call the init function
    tx.moveCall({
      target: `${packageId}::tardi_staking::init`,
      arguments: [],
    });
    
    // Set gas budget
    tx.setGasBudget(parseInt(gasBudget));
    
    // Execute transaction
    spinner.text = 'Submitting initialization transaction...';
    const result = await signer.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEvents: true,
        showEffects: true,
        showObjectChanges: true,
      },
    });
    
    // Check for success
    if (result.effects?.status?.status !== 'success') {
      spinner.fail('Initialization failed');
      console.error(result.effects?.status);
      process.exit(1);
    }
    
    // Extract staking pool ID
    const poolCreatedEvent = result.events?.find(event => 
      event.type.includes('::tardi_staking::StakingPool')
    );
    
    if (!poolCreatedEvent) {
      spinner.warn('Could not find staking pool ID in events. Check transaction manually.');
      console.log(JSON.stringify(result, null, 2));
      return { result };
    }
    
    const poolId = poolCreatedEvent.objectId;
    
    return { poolId, result };
  } catch (error) {
    spinner.fail('Staking pool initialization failed');
    console.error(error);
    process.exit(1);
  }
};

/**
 * Read compiled modules from the build directory
 */
const getCompiledModules = () => {
  try {
    const buildPath = path.resolve(__dirname, '../contracts/build/tardi_staking/bytecode_modules');
    const files = fs.readdirSync(buildPath);
    
    return files
      .filter(file => file.endsWith('.mv'))
      .map(file => {
        const modulePath = path.join(buildPath, file);
        return fs.readFileSync(modulePath);
      });
  } catch (error) {
    spinner.fail('Failed to read compiled modules');
    console.error(error);
    process.exit(1);
  }
};

/**
 * Update configuration files with the deployed contract address
 */
const updateConfigurations = (packageId, poolId, network) => {
  try {
    spinner.text = 'Updating configuration files...';
    
    if (options.dryRun) {
      spinner.info('Dry run: Skipping configuration updates');
      return;
    }
    
    // Update .env.local file or create it if it doesn't exist
    const envPath = path.resolve(__dirname, '../.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the package ID
    if (envContent.includes('REACT_APP_PACKAGE_ID=')) {
      envContent = envContent.replace(
        /REACT_APP_PACKAGE_ID=.*/,
        `REACT_APP_PACKAGE_ID=${packageId}`
      );
    } else {
      envContent += `\nREACT_APP_PACKAGE_ID=${packageId}`;
    }
    
    // Update or add the staking pool ID
    if (envContent.includes('REACT_APP_STAKING_POOL_ID=')) {
      envContent = envContent.replace(
        /REACT_APP_STAKING_POOL_ID=.*/,
        `REACT_APP_STAKING_POOL_ID=${poolId}`
      );
    } else {
      envContent += `\nREACT_APP_STAKING_POOL_ID=${poolId}`;
    }
    
    // Update or add the network
    if (envContent.includes('REACT_APP_NETWORK=')) {
      envContent = envContent.replace(
        /REACT_APP_NETWORK=.*/,
        `REACT_APP_NETWORK=${network}`
      );
    } else {
      envContent += `\nREACT_APP_NETWORK=${network}`;
    }
    
    // Write updated content
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    // Update constants.ts file
    const constantsPath = path.resolve(__dirname, '../src/utils/constants.ts');
    if (fs.existsSync(constantsPath)) {
      let constantsContent = fs.readFileSync(constantsPath, 'utf8');
      
      // Update package ID
      constantsContent = constantsContent.replace(
        /PACKAGE_ID: '.*?'/,
        `PACKAGE_ID: '${packageId}'`
      );
      
      // Update staking pool ID
      constantsContent = constantsContent.replace(
        /STAKING_POOL_ID: '.*?'/,
        `STAKING_POOL_ID: '${poolId}'`
      );
      
      // Write updated content
      fs.writeFileSync(constantsPath, constantsContent);
    }
    
    logVerbose('Configuration files updated successfully');
  } catch (error) {
    spinner.warn('Failed to update configuration files');
    console.error(error);
    // Continue execution, as this is not critical
  }
};

/**
 * Run the deployment process
 */
const deploy = async () => {
  try {
    // Validate environment
    const { network, privateKey } = validateEnvironment();
    
    // Check Sui CLI
    checkSuiCli();
    
    // Compile contract
    compileContract();
    
    // Get client and signer
    const { signer } = getClientAndSigner(network, privateKey);
    
    // Publish contract
    spinner.text = 'Publishing contract to Sui network...';
    const { packageId, result: publishResult } = await publishContract(signer, options.gasBudget);
    spinner.succeed(`Contract published with package ID: ${packageId}`);
    
    if (options.verbose && publishResult) {
      console.log('Publish transaction result:');
      console.log(JSON.stringify(publishResult, null, 2));
    }
    
    // Initialize staking pool
    spinner.start('Initializing staking pool...');
    const { poolId, result: initResult } = await initializeStakingPool(signer, packageId, options.gasBudget);
    
    if (poolId) {
      spinner.succeed(`Staking pool initialized with ID: ${poolId}`);
    } else {
      spinner.succeed('Staking pool initialization transaction sent');
    }
    
    if (options.verbose && initResult) {
      console.log('Initialization transaction result:');
      console.log(JSON.stringify(initResult, null, 2));
    }
    
    // Update configuration files
    spinner.start('Updating configuration files...');
    updateConfigurations(packageId, poolId || 'STAKING_POOL_ID_PLACEHOLDER', network);
    
    // Deployment completed
    spinner.succeed(`Deployment to ${network} completed successfully!`);
    
    // Print summary
    console.log('\n' + chalk.green('Deployment Summary:'));
    console.log(chalk.white(`Network: ${chalk.blue(network)}`));
    console.log(chalk.white(`Package ID: ${chalk.blue(packageId)}`));
    console.log(chalk.white(`Staking Pool ID: ${chalk.blue(poolId || 'Check transaction for ID')}`));
    
    // Explorer links
    const explorerBaseUrl = network === NETWORKS.MAINNET 
      ? 'https://explorer.sui.io' 
      : `https://${network}.explorer.sui.io`;
    
    console.log('\n' + chalk.green('Explorer Links:'));
    console.log(chalk.white(`Package: ${chalk.blue(`${explorerBaseUrl}/object/${packageId}`)}`));
    
    if (poolId) {
      console.log(chalk.white(`Staking Pool: ${chalk.blue(`${explorerBaseUrl}/object/${poolId}`)}`));
    }
    
    console.log('\n' + chalk.green('Next Steps:'));
    console.log(chalk.white('1. Verify the contract on the explorer'));
    console.log(chalk.white('2. Add initial rewards to the staking pool'));
    console.log(chalk.white('3. Run the frontend with updated contract addresses'));
    
  } catch (error) {
    spinner.fail('Deployment failed');
    console.error(error);
    process.exit(1);
  }
};

// Run the deployment process
deploy();