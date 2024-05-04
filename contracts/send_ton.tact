import "@stdlib/deploy";

message Withdraw {
    amount: Int as coins; 
}

contract SendTon with Deployable {
    const MinTonForStorage: Int = ton("0.01");
    owner: Address;
    init() {
        self.owner = sender();
    }

    fun onlyOwnder() {
        require(sender() == self.owner, "only owner is allowed to withdraw");
    }

    receive () {
        // accept incomint TON transfers
    }

     receive ("withdraw all") {
        self.onlyOwnder();

        send(SendParameters{
            to: sender(),
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    receive ("withdraw save") {
        self.onlyOwnder();
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.MinTonForStorage,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    receive (msg: Withdraw) {
        self.onlyOwnder();
        let amount: Int = min(msg.amount, myBalance() - context().value - self.MinTonForStorage);

        send(SendParameters{
            to: sender(),
            bounce: true,
            value: amount,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    get fun balance():Int {
        return myBalance();
    }
}
