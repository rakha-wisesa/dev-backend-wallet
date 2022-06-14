/*
    =============== Messy Code =====================
    =============== Just for reviewing, NOT PRODUCTION =======================
 */

const ApiBuilder = require('claudia-api-builder');
const Web3 = require('web3');

const api = new ApiBuilder();
const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
// const web3 = new Web3(Web3.givenProvider);
// const provider = "https://rinkeby.infura.io/v3/215592e0e4724a359039bcb9702971e9";
// const web3Provider = new Web3.providers.HttpProvider(provider);
// const web3 = new Web3(web3Provider);
// const web3 = new Web3("https://rinkeby.infura.io/v3/215592e0e4724a359039bcb9702971e9");

module.exports = api;


// Check Web3 Version if any
api.get('/check-version', () => {
    if(web3.version !== "" || web3.version !== 'undefined'){
        return {
            "web3_status": "Available",
            "web3_version": web3.version
        }
    }else{
        return {
            "web3_status": "Unavailable",
            "web3_version": web3.version
        }
    }
});

// Create Etherium Accounts 
// Not Used
api.post('/create-account', async () => {
    const account = web3.eth.accounts.create();
    return {
        "account address" :  account.address,
        "account private key" : account.privateKey,
    };
});


// Get Etherium Accounts
api.get('/get-accounts', async () => {
    const accounts = await web3.eth.getAccounts();
    return {
        "data": accounts,
    };
});


// Check if the node is sync in blockchain
api.get('/check-node', async () => {
    const nodeSync = await web3.eth.isSyncing();
    return nodeSync;
});

/* ============================= Wallet API ========================================== */

// Create wallet
api.post('/wallet/create-wallet', async () => {
    const wallet = web3.eth.accounts.wallet.create(1);
    return wallet[0];
});

// get all accounts in wallet
api.get('/wallet/get-all-accounts', () => {
    const wallets = web3.eth.accounts.wallet;
    let arrWallets = [];
    for (let index = 0; index < wallets.length; index++) {
        arrWallets.push(wallets[index]);
    };
    return {
        "data": arrWallets,
        "length": wallets.length
    };
});

// Add Etherium Account to the wallet using private key
api.post('/wallet/add', (request) => {
    const wallet = web3.eth.accounts.wallet.add(String(request.body.privateKey));
    return wallet;
});

// Remove Etherium Account from wallet using private key
api.delete('/wallet/remove', (request) => {
    const status = web3.eth.accounts.wallet.add(String(request.body.privateKey));
    return status;
});

// Get Balance from selected wallet using account address
api.get('/wallet/get-balance', async (request) => {
    const balance = await web3.eth.getBalance(String(request.body.accountAddress));
    return {
        "Account Address": String(request.body.accountAddress),
        "Account Balance": balance
    }
});


/* ======================== Transaction ============================== */

api.post('/wallet/send-signed-transaction', async (request) => {
    const recipientAddress = String(request.body.recipientAddress);
    // const from = String(request.body.accountAddress);
    const accountKey = String(request.body.accountKey);
    const gas = String(request.body.gas);
    const valueTxn = String(web3.utils.toWei(String(request.body.value), "ether"));
    const signed = await web3.eth.accounts.signTransaction({
        // from: from,
        to: recipientAddress,
        value: valueTxn,
        gas: gas,
    }, accountKey);
    // const signed = await web3.eth.signTransaction({
    //     from: from,
    //     to: recipientAddress,
    //     value: valueTxn,
    //     gas: gas,
    // });
    const rawTx = signed.rawTransaction;
    const statusSending = await web3.eth.sendSignedTransaction(rawTx);
    return statusSending;
    // try{
        
    // }catch(error){
    //     return {
    //         "status": "Error",
    //         "error_message": error,
    //     }
    // }
});


// Estimate Gas from latest transaction
api.get('/get-block/gas-used', async () => {
    return await (web3.eth.getBlock("latest")).gasUsed;
});