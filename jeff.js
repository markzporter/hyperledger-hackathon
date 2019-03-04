'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');

const connectDb = async () => {
    try {
        const ccp = JSON.parse(ccpJSON);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    
        // Check to see if we've already enrolled the user.
        const userExists = wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
    
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
    
        // Get the contract from the network.
        const contract = await network.getContract('fabcar');
        return contract;
        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //await contract.submitTransaction('changeCarOwner', 'CAR12', 'Dave');
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

// const contract = connectDb();


const criminality = [{
    charge: 'Murder',
    jailtime: 2,
    date: '2013-04-13'
},
{
    charge: 'Fraud',
    jailtime: 4,
    date: '2013-04-13'
},
]
const newRecord = {
    charge: 'Hate Speech',
    jailtime: 7,
    date: '2013-05-13'
}
const personal_details = {
    birth: '2000-04-01',
    fingerprint: 's435457hfgdgh45taf',
    address: 'Kentucky'
}

const createCar = async (req, res) => {
    console.log('Transaction has been submitted');
    const name = req.body.name;
    const charge = req.body.charge;
    const jailtime = req.body.jailtime;
    const date = req.body.date;
    const birth = req.body.birth
    const fingerprint = req.body.fingerprint;
    const address = req.body.address;

    const contract = await connectDb();
    const personNumber = req.params.numId;

    const criminal = [{
        charge: charge,
        jailtime: jailtime,
        date: date,
    }]

    const personal = {
        birth: birth,
        fingerprint: fingerprint,
        address: address,        
    }
    try {
        const result = await contract.submitTransaction(
            'createCar',
            `PERSON${personNumber}`,
            name,
            JSON.stringify(criminal),
            JSON.stringify(personal)
        );
        console.log('Transaction has been submitted 2');
        return res.send(result);
    }
    catch (err){
        console.log('Error adding person');
        return res.send(`Server error`);
    }
}

const changeCarOwner = async (req, res) => {
    const contract = await connectDb();
    const personNumber = req.params.numId;

    const newRecord = {
        charge: req.params.charge,
        jailtime: req.params.jailtime,
        date: req.params.date,
    }
    try {
        const result = await contract.submitTransaction(
            'changeCarOwner',
            `PERSON${personNumber}`,
            JSON.stringify(newRecord),
        );
        console.log('Transaction has been submitted');
        return res.send(result);
    }
    catch (err){
        console.log('Error adding criminal record');
        return res.send(`Server error`);
    }
}

const queryAllCars = async (req, res) => {

    const contract = await connectDb();

    try {
            const result = await contract.evaluateTransaction('queryAllCars');
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            return res.send(result);

        } catch (err){
            console.log('Error query for all cars');
            res.send('Server error');
        }   
}


const queryCar = async (req, res) => {
    
    const contract = await connectDb();
    const personNumber = req.params.numId;
    try {
        const result = await contract.evaluateTransaction('queryCar', `PERSON${personNumber}`);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        return res.send(result);
    }
    catch (err){
        console.log(`[Error query car] - ${err}`);
        res.send(`Server error`);
    }
}
// Disconnect from the gateway.
// gateway.disconnect();

module.exports = {
    createCar,
    changeCarOwner,
    queryCar,
    queryAllCars
}


