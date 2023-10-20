import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { ReentrantCounter } from '../wrappers/ReentrantCounter';
import '@ton-community/test-utils';

describe('ReentrantCounter', () => {
    let blockchain: Blockchain;
    let reentrantCounter: SandboxContract<ReentrantCounter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        reentrantCounter = blockchain.openContract(await ReentrantCounter.fromInit(0n));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await reentrantCounter.send(
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
            to: reentrantCounter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and reentrantCounter are ready to use
    });

    it('Should decrease counter', async () => {
        const amountToIncrease = 100n;
        const deployer = await blockchain.treasury('deployer');
        await reentrantCounter.send(
            deployer.getSender(),
            {
                value: toNano(amountToIncrease + 100n),
            },
            'Add'
        );

        expect(await reentrantCounter.getCounter()).toEqual(amountToIncrease);
        expect(await reentrantCounter.getBalance()).toBeGreaterThanOrEqual(toNano(amountToIncrease));
        console.log('balance Before', await reentrantCounter.getBalance());
        console.log('counter Before', await reentrantCounter.getCounter());

        // Withdraw ton coins parallelly
        const decreaseTimes = 100n;
        const amoutPerDecrease = 1n;
        const promises = [];
        const decreaser = await blockchain.treasury('decreaser');
        for (let i = 0; i < decreaseTimes; i++) {
            // console.log(`decrease ${i + 1}/${decreaseTimes}`);
            let result = reentrantCounter.send(
                decreaser.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'Substract',
                    queryId: 0n,
                    amount: amoutPerDecrease,
                }
            );
            promises.push(result);
        }
        const completed = await Promise.all(promises);
        for (let i = 0; i < completed.length; i++) {
            console.log(`Check decrease ${i + 1}/${decreaseTimes}`);
            expect(completed[i].transactions).toHaveTransaction({
                from: decreaser.address,
                to: reentrantCounter.address,
                success: true,
            });
        }

        expect(await reentrantCounter.getCounter()).toEqual(amountToIncrease - decreaseTimes * amoutPerDecrease);
        expect(await reentrantCounter.getBalance()).toBeGreaterThan(
            toNano(amountToIncrease - decreaseTimes * amoutPerDecrease)
        );
        console.log('balance After', await reentrantCounter.getBalance());
        console.log('counter After', await reentrantCounter.getCounter());
    });
});
