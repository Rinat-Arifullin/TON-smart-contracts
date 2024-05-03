import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Company } from '../wrappers/Company';
import '@ton/test-utils';
import { Fund } from '../wrappers/Fund';

describe('Company', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let company: SandboxContract<Company>;
    let fund: SandboxContract<Fund>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        company = blockchain.openContract(await Company.fromInit());
        fund = blockchain.openContract(await Fund.fromInit());
        deployer = await blockchain.treasury('deployer');

        const deployCompany = await company.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const deployFund = await fund.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployCompany.transactions).toHaveTransaction({
            from: deployer.address,
            to: company.address,
            deploy: true,
            success: true,
        });

        expect(deployFund.transactions).toHaveTransaction({
            from: deployer.address,
            to: fund.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and company are ready to use
    });

    it('should increase balance', async ()=>{
        const deposit = 10n;

        const fundBalance = await fund.getBalance();

        await fund.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Deposit',
                amount: deposit,
            },
        );

        const fundBalanceAfter = await fund.getBalance();
        
        expect(fundBalanceAfter - fundBalance).toEqual(deposit);
    });

    it('should withdraw', async () => {
        const withdraw = 100n;

        const companyBalance = await company.getBalance();
        const fundBefore = await fund.getBalance();


        const res = await fund.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            {
                $$type: 'Withdraw',
                amount: withdraw,
                target: company.address
            },
        );

        console.log(res)

        const fundAfeter = await fund.getBalance();
        const companyBalanceAfter = await company.getBalance();

        expect(fundBefore - fundAfeter).toEqual(withdraw);
        expect(companyBalanceAfter - companyBalance).toEqual(withdraw);

    });
});
