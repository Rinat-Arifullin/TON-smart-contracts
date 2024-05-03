import { toNano } from '@ton/core';
import { FirstContract } from '../wrappers/FirstContract';
import { NetworkProvider } from '@ton/blueprint';


export async function run(provider: NetworkProvider) {
    const firstContract = provider.open(await FirstContract.fromInit(BigInt(123123)));

    await firstContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        },
    );

    await provider.waitForDeploy(firstContract.address);
}
