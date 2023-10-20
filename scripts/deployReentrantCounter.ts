import { toNano } from 'ton-core';
import { ReentrantCounter } from '../wrappers/ReentrantCounter';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const reentrantCounter = provider.open(await ReentrantCounter.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await reentrantCounter.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(reentrantCounter.address);

    console.log('ID', await reentrantCounter.getId());
}
