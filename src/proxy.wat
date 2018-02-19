(module
	(import "env" "timestamp_i64" (func $timestamp_i64))
	(global $hi (mut i32) (i32.const 0))
	(global $lo (mut i32) (i32.const 0))

	(func (export "i64set") (param i32 i32)
		(set_global $hi (get_local 0))
		(set_global $lo (get_local 1))
	)

	(func (export "i64getHi") (result i32) (get_global $hi))
	(func (export "i64getLo") (result i32) (get_global $lo))

	(func (export "timestamp") (result i64)
			(call $timestamp_i64)
			(i64.or
				(i64.extend_u/i32
					(get_global $lo)
				)
				(i64.shl
					(i64.extend_u/i32
						(get_global $hi)
					)
					(i64.const 32)
				)
			)
		)
)
