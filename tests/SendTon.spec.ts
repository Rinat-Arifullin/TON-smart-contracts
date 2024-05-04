import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { SendTon } from '../wrappers/SendTon';
import '@ton/test-utils';

describe('SendTon', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sendTon: SandboxContract<SendTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendTon = blockchain.openContract(await SendTon.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendTon.address,
            deploy: true,
            success: true,
        });

        await sendTon.send(deployer.getSender(), {
            value: toNano('500')
        }, null)
    });

    it('should deploy and receive ton', async () => {
        const balance = await sendTon.getBalance();
        console.log({balance})
        // the check is done inside beforeEach
        // blockchain and sendTon are ready to use
    });

// it('should allow the owner to withdraw all funds', async () => {
//     const user = await blockchain.treasury('user');
//     const balanceUser= await user.getBalance();
//     console.log(balanceUser);
//     await sendTon.send(user.getSender(), {value: toNano('0.2')}, 'withdraw all');
//     const balanceUserAfter = await user.getBalance();
//     console.log(balanceUserAfter);
// });


    // it('should save withdraw', async ()=>{
    //     const balanceBefore = await sendTon.getBalance();
    //     const deployerBalanceBefore = await deployer.getBalance();
    //     console.log({ balanceBefore, deployerBalanceBefore });

    //     await sendTon.send(deployer.getSender(), {value: toNano('0.2')}, 'withdraw save');

    //     const deployerBalanceAfter = await deployer.getBalance();
    //     const balanceAfter = await sendTon.getBalance();

    //     console.log({ balanceAfter, deployerBalanceAfter });

    // })

    it("withdraw", async ()=>{
        const balanceBefore = await sendTon.getBalance();
        const deployerBalanceBefore = await deployer.getBalance();
        // console.log({ balanceBefore, deployerBalanceBefore });
        await sendTon.send(deployer.getSender(), { value: toNano('0.2') }, { $$type: 'Withdraw', amount: toNano('150') });

        const deployerBalanceAfter = await deployer.getBalance();
        const balanceAfter = await sendTon.getBalance();
        // console.log({ balanceAfter, deployerBalanceAfter });
    })

});
