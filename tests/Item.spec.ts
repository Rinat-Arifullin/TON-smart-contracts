import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Item } from '../wrappers/Item';
import '@ton/test-utils';
import { Item2 } from '../build/Item/tact_Item2';
import { Item3 } from '../build/Item/tact_Item3';

describe('Item', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let item: SandboxContract<Item>;
    let item2: SandboxContract<Item2>;
    let item3: SandboxContract<Item3>;
    beforeEach(async () => {
        blockchain = await Blockchain.create();

        item = blockchain.openContract(await Item.fromInit());
        item2 = blockchain.openContract(await Item2.fromInit());
        item3 = blockchain.openContract(await Item3.fromInit(1n));
        deployer = await blockchain.treasury('deployer');

        const deployResult1 = await item.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const deployResult2 = await item2.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        const deployResult3 = await item3.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult1.transactions).toHaveTransaction({
            from: deployer.address,
            to: item.address,
            deploy: true,
            success: true,
        });

        expect(deployResult2.transactions).toHaveTransaction({
            from: deployer.address,
            to: item2.address,
            deploy: true,
            success: true,
        });

        expect(deployResult3.transactions).toHaveTransaction({
            from: deployer.address,
            to: item3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and item are ready to use
    });

    it('should return addresses', async()=>{
        const address1 = await item.getMyAddres();
        const address1FromItem2 = await item2.getOtherAddress();

        const address2 = await item2.getMyAddres()
        const address2FromItem1 = await item.getOtherAddress();

        // console.log({ address1, address1FromItem2, isEqual: address1FromItem2 === address1 });
        // console.log({ address2, address2FromItem1, isEqual: address2FromItem1 === address2 });

        expect(address1).toEqualAddress(address1FromItem2);
        expect(address2).toEqualAddress(address2FromItem1);
    })

    it('should deploy new contract', async () => {
        const id = 5n;
        const notExistAddress = await item3.getOtherAddress(id);

        const deployNewItem = await item3.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            {
                $$type: "DeployContract",
                id,
            },
        );

        const newItem = blockchain.openContract(await Item3.fromInit(id));
        const newItemAddress = await newItem.getMyAddres()
        const newItemId = await newItem.getId();

        expect(newItemAddress).toEqualAddress(notExistAddress);
        expect(newItemId).toEqual(id);
    });
});
