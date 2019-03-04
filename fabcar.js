/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const people = [
            {
                name: 'Bobby Lee',
                criminality: [{
                    charge: 'Public Urination',
                    jailtime: 6,
                    date: '2018-02-28'
                }],
                personal_details: {
                    birth: '1998-12-10',
                    fingerprint: 'sedfgsdrtg345taf',
                    address: 'Some HQ'
                }
            },

            {
                name: 'Jeff Green',
                criminality: [{
                    charge: 'Theft',
                    jailtime: 9,
                    date: '2018-01-18'
                }],
                personal_details: {
                    birth: '1960-03-18',
                    fingerprint: 's4356sdrtg345taf',
                    address: 'Some other place'
                }
            },

            {
                name: 'Jimbo Jolly',
                criminality: [{
                    charge: 'Hacker',
                    jailtime: 37,
                    date: '2014-08-09'
                }],
                personal_details: {
                    birth: '1940-01-19',
                    fingerprint: 's4357897990g345taf',
                    address: 'Waterloo'
                }
            },
        ];

        // cd ../../first-network/
        // ./byfn.sh down -y
        // docker rm -f $(docker ps -aq)
        // docker rmi -f $(docker images | grep fabcar | awk '{print $3}')
        // cd ../fabcar/
        // ./startFabric.sh javascript
        // cd javascript/


        for (let i = 0; i < people.length; i++) {
            people[i].docType = 'person';
            await ctx.stub.putState('PERSON' + i, Buffer.from(JSON.stringify(people[i])));
            console.info('Added <--> ', people[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, personNumber) {
        const personAsBytes = await ctx.stub.getState(personNumber); // get the car from chaincode state
        if (!personAsBytes || personAsBytes.length === 0) {
            throw new Error(`${personNumber} does not exist`);
        }
        console.log(personAsBytes.toString());
        return personAsBytes.toString();
    }

    async createCar(ctx, personNumber, name, criminality, personal_details) {
        console.info('============= START : Create Car ===========');

        const person = {
            name,
            criminality: JSON.parse(criminality),
            personal_details: JSON.parse(personal_details),
        };

        await ctx.stub.putState(personNumber, Buffer.from(JSON.stringify(person)));
        console.info('============= END : Create Car ===========');
    }

    async queryAllCars(ctx) {
        const startKey = 'PERSON0';
        const endKey = 'PERSON999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // async changeCarOwner(ctx, carNumber, newOwner) {
    //     console.info('============= START : changeCarOwner ===========');

    //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    //     if (!carAsBytes || carAsBytes.length === 0) {
    //         throw new Error(`${carNumber} does not exist`);
    //     }
    //     const car = JSON.parse(carAsBytes.toString());
    //     car.owner = newOwner;

    //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    //     console.info('============= END : changeCarOwner ===========');
    // }



    async changeCarOwner(ctx, personNumber, record) {
        console.info('============= START : addCriminalRecord ===========');

        const personAsBytes = await ctx.stub.getState(personNumber); // get the car from chaincode state
        if (!personAsBytes || personAsBytes.length === 0) {
            throw new Error(`${personNumber} does not exist`);
        }
        const person = JSON.parse(personAsBytes.toString());
        
        person.criminality.push(record);

        await ctx.stub.putState(personNumber, Buffer.from(JSON.stringify(person)));
        console.info('============= END : addCriminalRecord ===========');
    }
}
module.exports = FabCar;
