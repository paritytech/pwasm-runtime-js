// @flow

import minimist from "minimist";
import fs from "fs";
import path from "path";
import { exec, Externalities, RuntimeContext, Address } from "."
import { bytesToHex, hexToBytes, toArrayBuffer } from "./src/utils";

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
    sender: string,
    payload?: string,
    asserts: Array<{
        Return?: string
    }>
}): Promise<number> {
    const cwd = process.cwd();
    const sourcePath = path.resolve(test.source);
    const module = fs.readFileSync(sourcePath);
    const ext = new Externalities();
    const context = RuntimeContext.default();
    const args  = hexToBytes(test.payload);
    context.withSender(Address.fromString(test.sender));
    const result = await exec(ext, toArrayBuffer(module), context, args);
    let failures = 0;
    for (let [i, assert] of test.asserts.entries()) {
        process.stdout.write("assert #" + (i + 1) + ".. ");
        if (assert.Return) {
            if (("0x" + bytesToHex(result)) == assert.Return) {
                process.stdout.write("OK\n");
            } else {
                process.stdout.write("FAIL\n");
                failures++;
            }
        }
    }

    return failures;
}
