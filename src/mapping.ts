import { Address, BigInt, log } from '@anchor-indexer/ts';
import {
  DepositCall,
  WithdrawAndBurnCall,
  WithdrawCall,
  WithdrawV2Call,
} from '../generated/Casier/Casier';
import { Config, Locker, LockerMint } from '../generated/schema';

export {
  DepositCall,
  WithdrawAndBurnCall,
  WithdrawCall,
  WithdrawV2Call,
} from '../generated/Casier/Casier';
export { Config, Locker, LockerMint } from '../generated/schema';

export function handleDepositCall(call: DepositCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.locker;
  let locker = Locker.load(id.toBase58());
  if (locker) {
    log.debug('deposit: updating locker {}', [id.toBase58()]);
  } else {
    log.debug('deposit: initializing locker {}', [id.toBase58()]);
    locker = new Locker(id.toBase58());
    locker.owner = accounts.owner;
    locker.save();
  }
  let lockerMintId = id.toBase58() + '-' + accounts.mint.toBase58();
  let lockerMint = LockerMint.load(lockerMintId);
  if (lockerMint) {
    log.debug('deposit: updating locker mint {}', [lockerMintId]);
    lockerMint.amount = lockerMint.amount.plus(args.depositAmount);
  } else {
    log.debug('deposit: initializing locker mint {}', [lockerMintId]);
    lockerMint = new LockerMint(lockerMintId);
    lockerMint.locker = id;
    lockerMint.mint = accounts.mint;
    lockerMint.amount = BigInt.fromU64(0);
  }
  lockerMint.save();
}

export function handleWithdrawCall(call: WithdrawCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.locker;
  withdraw('withdraw', id, accounts.mint, args.finalAmount);
}

export function handleWithdrawAndBurnCall(call: WithdrawAndBurnCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.locker;
  withdraw('withdrawAndBurn', id, accounts.mint, args.finalAmount);
}

export function handleWithdrawV2Call(call: WithdrawV2Call): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.locker;
  withdraw('withdrawV2', id, accounts.mint, args.finalAmount);
}

function withdraw(
  t: string,
  id: Address,
  mint: Address,
  finalAmount: BigInt
): void {
  let locker = Locker.load(id.toBase58());
  if (!locker) {
    log.debug('{}: locker does not exist {}', [t, id.toBase58()]);
  } else {
    log.debug('{}: updating locker {}', [t, id.toBase58()]);

    let lockerMintId = id.toBase58() + '-' + mint.toBase58();
    let lockerMint = LockerMint.load(lockerMintId);
    if (!lockerMint) {
      log.debug('{}: locker mint does not exist {}', [t, lockerMintId]);
    } else {
      log.debug('{}: updating locker mint {}', [t, lockerMintId]);

      lockerMint.amount = BigInt.fromU64(0);

      if (finalAmount.gt(BigInt.fromU64(0))) {
        lockerMint.amount = finalAmount;
      } else {
        lockerMint.amount = BigInt.fromU64(0);
      }

      lockerMint.save();
    }
  }
}
