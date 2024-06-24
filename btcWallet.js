const {BIP32Factory} = require('bip32')
const ecc = require('tiny-secp256k1')
const bip32 = BIP32Factory(ecc)
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const axios = require('axios');

const createWallet = () => {
    // Define the network
    const network = bitcoin.networks.bitcoin; // use networks.testnet for testnet

    // Derivation path
    const path = `m/44'/0'/0'/0'`; // Use m/44'/1'/0'/0' for testnet

    // Load your private key (WIF)
    let mnemonic = bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    let root = bip32.fromSeed(seed, network)

    let account = root.derivePath(path)
    let node = account.derive(0).derive(0)
    // let btcAddress = bitcoin.payments.p2pkh({  // Address Format: Legacy Address (P2PKH),            Example: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2
    // let btcAddress = bitcoin.payments.p2sh({   // Address Format: SegWit Address (P2SH) ,            Example: 3JvL6Ymt8MVWiCNHC7oWU6nLeHNJKLZGLN
    // let btcAddress = bitcoin.payments.p2wpkh({ // Address Format: Native SegWit Address (bech32) ,   Example: bc1qqkvgqtpwq6g59xgwr2sccvmudejfxwyl8g9xg0
    let btcAddress = bitcoin.payments.p2wpkh({
        pubkey: node.publicKey,
        network: network,
    }).address;

    const wallet = {
        address: btcAddress,
        privateKey: node.toWIF(),
        mnemonic: mnemonic
    };

    console.log(`
        Wallet generated:
        - Address : ${wallet.address}, 
        - Private Key : ${wallet.privateKey}, 
        - Mnemonic : ${wallet.mnemonic} 
    `);

    return wallet;
}

const getBalance = async (address) => {
    try {
        const response = await axios.get(`https://blockchain.info/balance?active=${address}`);
        const balance = response.data[address].final_balance / 100000000;
        console.log(`Your balance for address ${address} is: ${balance} BTC`);
    } catch (error) {
        console.error(error);
    }
};
    
// getBalance('bc1q0hpu8d4hunynvk9yttx9e74ftgl4mj5w49c9qp');
// getBalance('bc1qqkvgqtpwq6g59xgwr2sccvmudejfxwyl8g9xg0');
// getBalance('tb1qq8u98kq3hjsulerpuyj329vv8kk8amlc986aym');

createWallet();