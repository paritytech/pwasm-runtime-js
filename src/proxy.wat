(module
	(import "env" "timestamp_u64" (func $timestamp_u64 (result i32)))
	(import "env" "blocknumber_u64" (func $blocknumber_u64 (result i32)))
	(global $hi (mut i32) (i32.const 0))

	(func (export "i64setHi") (param i32)
		(set_global $hi (get_local 0))
	)

	(func (export "i64getHi") (result i32)
		(get_global $hi)
	)

	(func $ret_i64 (param i32) (result i64)
		(i64.or
			(i64.extend_u/i32
				(get_local 0)
			)
			(i64.shl
				(i64.extend_u/i32
					(get_global $hi)
				)
				(i64.const 32)
			)
		)
	)

	(func (export "timestamp") (result i64)
		(call $ret_i64 (call $timestamp_u64))
	)

	(func (export "blocknumber") (result i64)
		(call $ret_i64 (call $blocknumber_u64))
	)
)
