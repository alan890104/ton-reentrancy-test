import "@stdlib/deploy";

message Substract {
    queryId: Int as uint64;
    amount: Int as uint64;
}

contract ReentrantCounter with Deployable {
    id: Int as uint32;
    counter: Int as int64;

    init(id: Int) {
        self.id = id;
        self.counter = 0;
    }

    receive("Add") {
        let ctx: Context = context();
        require(ctx.value > ton("100"), "Should Send more than 100 TONs");
        nativeReserve(ton("100"), 0);
        self.counter = 100;
        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendRemainingBalance
        });
    }

    receive(msg: Substract) {
        let x: Int =  0;
        // repeat(10000) {
        //     x = 0 * 0;
        // }
        send(SendParameters{
            to: sender(),
            value: msg.amount * pow(10, 9),
            mode: SendRemainingValue,
            body: "withdraw".asComment()
        });
        self.counter = (self.counter - msg.amount);
    }

    get fun counter(): Int {
        return self.counter;
    }

    get fun id(): Int {
        return self.id;
    }

    get fun balance(): Int {
        return myBalance();
    }
}
