import minimist from "minimist";
import fs from "fs";
import path from "path";
import { exec, Externalities, RuntimeContext } from "."

try {
    (async function() {
        const argv = minimist(process.argv.slice(2));
        if (argv._.length === 1) {
            const fileName = argv._[0];
            const file = fs.readFileSync(path.resolve(fileName), 'utf8');
            const tests = JSON.parse(file);

            for (let test of tests) {
                await runTest(test);
            }
        } else {
            console.log("Usage: pwasm-test <file>");
        }
    })();
} catch(e) {
    console.log(e);
}

async function runTest(test) {
    const cwd = process.cwd();
    const sourcePath = path.resolve(test.source);
    const module = fs.readFileSync(sourcePath);
    const ext = new Externalities();
    const context = RuntimeContext.default();
    context.withSender(test.sender);
    await exec(ext, module, context);
}
