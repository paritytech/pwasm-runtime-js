// @flow
import BigNumber from "bn.js";
import Long from "long";
import type { CallType } from "./externalities";
import { bytesToHex, hexToBytes } from "./utils";

export class ActionParams {
    code_address: Address;
    sender: Address;
    origin: Address;
    code_hash: ?H256;
    code: ?Uint8Array;
    data: ?Uint8Array;
    gas: BigNumber;
    gas_price: BigNumber;
    value: BigNumber;
    callType: CallType;
    params_type: ParamsType;
}

export class EnvInfo {
    blocknumber: Long;
    timestamp: Long;
    author: Address;
    difficulty: BigNumber;
    gasLimit: BigNumber;
    lastHashes: Array<H256>;
    gasUsed: BigNumber;

    static default() {
        const env = new EnvInfo();
        env.blocknumber = Long.fromNumber(0);
        env.timestamp = Long.fromNumber(0);
        env.author = new Address(new Uint8Array([]));
        env.difficulty = new BigNumber(0);
        env.gasLimit = new BigNumber(0);
        env.gasUsed = new BigNumber(0);
        env.lastHashes = [];
        return env;
    }
}

export class FixedArray {
    bytes: Uint8Array;

    write(buf: ArrayBuffer, ptr: number) {
        let into = new Uint8Array(buf, ptr);
        into.set(this.bytes);
    }

    toString(): string {
        return "0x" + bytesToHex(this.bytes);
    }

    isZero(): boolean {
        return this.bytes.every((b) => b === 0);
    }
}

export class H256 extends FixedArray {

    constructor(bytes: Uint8Array) {
        super();
        this.bytes = bytes;
    }

    static fromString(hex: string): H256 {
        let bytes = new Uint8Array(32);
        let origin = Uint8Array.from(hexToBytes(hex));
        let startFrom = 32 - origin.byteLength;
        bytes.set(origin, startFrom);
        return new H256(bytes);
    }

    static copy(buffer: ArrayBuffer, offset: number): H256 {
        const copied = new Uint8Array(buffer.slice(offset, offset + 32));
        return new H256(copied);
    }

    static view(buffer: ArrayBuffer, offset: number) {
        const view = new Uint8Array(buffer, offset, 32);
        return new H256(view);
    }
}

export class Address extends FixedArray {

    constructor(bytes: Uint8Array) {
        super();
        this.bytes = bytes;
    }

    static fromString(hex: string): Address {
        return new Address(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer: ArrayBuffer, offset: number): Address {
        const copied = new Uint8Array(buffer.slice(offset, offset + 20));
        return new Address(copied);
    }

    static view(buffer: ArrayBuffer, offset: number): Address {
        const view = new Uint8Array(buffer, offset, 20);
        return new Address(view);
    }
}


export type Result = {
    gasLeft: Long;
    data: Uint8Array;
}

export type Schedule = {
    exceptional_failed_code_deposit: boolean,
    have_delegate_call: boolean,
    have_create2: boolean,
    have_revert: boolean,
    have_return_data: boolean,
    stack_limit: number,
    max_depth: number,
    tier_step_gas: Array<number>,
    exp_gas: number,
    exp_byte_gas: number,
    sha3_gas: number,
    sha3_word_gas: number,
    sload_gas: number,
    sstore_set_gas: number,
    sstore_reset_gas: number,
    sstore_refund_gas: number,
    jumpdest_gas: number,
    log_gas: number,
    log_data_gas: number,
    log_topic_gas: number,
    create_gas: number,
    call_gas: number,
    call_stipend: number,
    call_value_transfer_gas: number,
    call_new_account_gas: number,
    suicide_refund_gas: number,
    memory_gas: number,
    quad_coeff_div: number,
    create_data_gas: number,
    create_data_limit: number,
    tx_gas: number,
    tx_create_gas: number,
    tx_data_zero_gas: number,
    tx_data_non_zero_gas: number,
    copy_gas: number,
    extcodesize_gas: number,
    extcodecopy_base_gas: number,
    balance_gas: number,
    suicide_gas: number,
    suicide_to_new_account_cost: number,
    sub_gas_cap_divisor?: number,
    no_empty: null,
    kill_empty: null,
    blockhash_gas: 20,
    have_static_call: boolean,
    kill_dust: null,
    eip86: boolean,
    wasm: WasmSchedule
}

export type WasmSchedule = {
    regular: number,
    div: number,
    mul: number,
    mem: number,
    static_u256: number,
    static_address: number,
    initial_mem: number,
    grow_mem: number,
    max_stack_height: number,
    opcodes_mul: number,
    opcodes_div: number,
}

export const PARAMS_TYPES = {
    Embedded: (0:0),
    Separate: (1:1),
};

type ParamsType = $Values<typeof PARAMS_TYPES>;
