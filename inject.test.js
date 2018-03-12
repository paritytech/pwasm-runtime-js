import fs from 'fs';
import { resolve } from 'path';
import { inject_gas_counter } from '.';

test('inject', async () => {
    let wasm = fs.readFileSync(resolve('./wasm-tests/compiled/alloc.wasm'));
    let result = await inject_gas_counter(wasm);
    console.log(result.byteLength);
});
