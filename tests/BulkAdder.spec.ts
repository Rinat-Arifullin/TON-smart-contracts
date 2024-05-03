import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BulkAdder } from '../wrappers/BulkAdder';
import '@ton/test-utils';
import { Counter } from '../wrappers/Counter';

describe('BulkAdder', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let bulkAdder: SandboxContract<BulkAdder>;
    let counter: SandboxContract<Counter>

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        bulkAdder = await blockchain.openContract(await BulkAdder.fromInit());
        counter = await blockchain.openContract(await Counter.fromInit(1n));
        deployer = await blockchain.treasury('deployer');

        const deployBulkAdder = await bulkAdder.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const deployCounter = await counter.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployBulkAdder.transactions).toHaveTransaction({
            from: deployer.address,
            to: bulkAdder.address,
            deploy: true,
            success: true,
        });

         expect(deployCounter.transactions).toHaveTransaction({
             from: deployer.address,
             to: counter.address,
             deploy: true,
             success: true,
         });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and bulkAdder are ready to use
    });

    it('should increase to target', async ()=>{
        const target = 11n;
        const countBefore = await counter.getCounter();
        
        const res = await bulkAdder.send(
            deployer.getSender(),
            {
                value: toNano('0.6'),
            },
            {
                $$type: 'Reach',
                target,
                counter: counter.address,
            },
        );

        const countAfter = await counter.getCounter();
        console.log({ countAfter , countBefore, target});
        expect(countAfter).toEqual(target);
    });
});
