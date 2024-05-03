import { FirstContract } from '../wrappers/FirstContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const firstContract = provider.open(await FirstContract.fromInit(BigInt(123123)));

    const counter = await firstContract.getCounter();
    const id = await firstContract.getId();

    console.log({counter, id})
}
