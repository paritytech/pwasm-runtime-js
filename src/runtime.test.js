import fs from 'fs';
import { exec } from './runtime';
import Externalities from './externalities';
import { H256 } from './types';

test('storage_read', async () => {
  let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/storage_read.wasm');
  let ext = new Externalities();

  ext.setStorage(
    H256.fromString(
        "0x010000000000000000000000000000000000000000000000000000000000000"),
    H256.fromString(
        "0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"
    )
  );

  let result = await exec(ext, wasm);
  expect(new H256(result)).toEqual(
    H256.fromString(
      '0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd'
    )
  );
});
