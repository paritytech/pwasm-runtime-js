#! /usr/bin/env node

// @flow
import minimist from "minimist";
import fs from "fs";
import path from "path";
import { exec, Externalities, RuntimeContext, Address, H256 } from "."
import { bytesToHex, hexToBytes, toArrayBuffer } from "./utils";
import Long from "long";

try {
    (async function() {
        const argv = minimist(process.argv.slice(2));
        if (argv._.length === 1) {
            let fileOrDir = argv._[0];
            if (fs.lstatSync(fileOrDir).isDirectory()) {
                let files = fs.readdirSync(fileOrDir).filter((name) => name.substr(-5) == ".json");
                for (let file of files) {
                    console.log(file);
                    console.log("=========================================");
                    await runTestFile(fileOrDir + "/" + file);
                    console.log("");
                }
            } else {
                await runTestFile(fileOrDir);
            }
        } else {
            console.log("Usage: pwasm-test <file>");
        }
    })();
} catch(e) {
    console.log(e);
}

async function runTestFile(fileName): Promise<number> {
    const file = fs.readFileSync(path.resolve(fileName), 'utf8');
    const tests = JSON.parse(file);
    let failures = 0;
    for (let test of tests) {
        process.stdout.write(test.caption + ".. \n");
        failures += await runTest(test);
    }
    return failures;
}

async function runTest(test: {
    source: string,
    storage?: Object,
    sender: string,
    payload?: string,
    gasLimit: number,
    asserts?: Array<{
        Return?: string,
        HasCall? : Object
    }>
}): Promise<number> {
    const cwd = process.cwd();
    const sourcePath = path.resolve(test.source);
    const module = fs.readFileSync(sourcePath);
    const ext = new Externalities();
    const context = RuntimeContext.default();
    if (typeof test.sender === "string") {
        context.withSender(Address.fromString(test.sender));
    }
    if (typeof test.storage === "object") {
        for (let [key, value] of Object.entries(test.storage)) {
            // $FlowFixMe
            ext.setStorage(H256.fromString(key), H256.fromString(value));
        }
    }
    const args  = hexToBytes(test.payload || "");
    context.withSender(Address.fromString(test.sender));
    const result = await exec(ext, toArrayBuffer(module), context, Long.fromNumber(test.gasLimit), args);
    let failures = 0;
    if (typeof test.asserts === "object") {
                    // $FlowFixMe
        for (let [i, assert] of test.asserts.entries()) {
            process.stdout.write("- assert #" + (i + 1) + ".. ");
            if (typeof assert.HasCall === "object") {
                for(let [i, call] of ext.getCalls().entries()) {
                    // $FlowFixMe
                    for(let prop of Object.getOwnPropertyNames(assert.HasCall)) {
                        let callProp = {"sender": "senderAddress", "receiver": "receiveAddress"}[prop] || prop;
                        // $FlowFixMe
                        if (call[callProp].toString() !== assert.HasCall[prop]) {

                            process.stdout.write("FAIL:");
                            // $FlowFixMe
                            process.stdout.write(`assert.HasCall.${prop} = ${assert.HasCall[prop].toString()}, but ext.getCalls().${i}.${prop} = ${call[callProp]}\n`);

                            failures++;
                        } else {
                            process.stdout.write("OK\n");
                        }
                    }
                }
            }
            if (assert.Return) {
                if (("0x" + bytesToHex(result.data)) == assert.Return) {
                    process.stdout.write("OK\n");
                } else {
                    process.stdout.write("FAIL:");
                    // $FlowFixMe
                    process.stdout.write(`assert.Return = ${assert.Return}, but result.data = ${"0x" + bytesToHex(result.data)}\n`);
                    failures++;
                }
            }
        }
    }

    return failures;
}
