import minimist from "minimist";
import fs from "fs";
import path from "path";
import { exec } from "./src"

const argv = minimist(process.argv.slice(2));

if (argv._.length === 1) {
    const fileName = argv._[0];
    const json = fs.readFileSync(fileName, 'utf8');

} else {
    console.log("Usage: pwasm-test <file>");
}

async function runTest(test) {
    const cwd = process.cwd();
    const sourcePath = path.resolve([test.source]);
    exec
}
