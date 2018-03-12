extern crate parity_wasm;
extern crate wasm_utils;

use std::os::raw::{c_void};
use std::mem;
use parity_wasm::elements::Section;
use parity_wasm::builder::ModuleBuilder;

fn data_payload() -> &'static [u8] {
		&[
			0x0bu8,  // section id
			20,      // 20 bytes overall
			0x01,    // number of segments
			0x00,    // index
			0x0b,    // just `end` op
			0x10,
			// 16x 0x00
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00
		]
	}


#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut c_void, cap: usize) {
    unsafe  {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
}

#[no_mangle]
pub extern "C" fn inject_gas(input_ptr: *const u8, input_len: usize) -> *const i32 {
    let input = unsafe { std::slice::from_raw_parts(input_ptr, input_len) };
    let mut result = internal::inject_gas(input);
    let descriptor = vec![result.as_mut_ptr() as i32, result.len() as i32];
    descriptor.as_ptr()
}

mod internal {
    use parity_wasm;
    use wasm_utils;

    pub fn inject_gas(input: &[u8]) -> Vec<u8> {
        let module = parity_wasm::deserialize_buffer(input).expect("Error deserialize_buffer");
        // TODO: use custom Ruleset
        let module_counted = wasm_utils::inject_gas_counter(module, &wasm_utils::rules::Set::default()).expect("Error inject_gas_counter");
        parity_wasm::serialize(module_counted).expect("Error serialize")
    }
}
