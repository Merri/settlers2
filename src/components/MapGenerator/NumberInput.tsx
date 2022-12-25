import { useCallback, useRef } from 'preact/compat'

interface Props {
	onChange: (value: bigint) => void
	value: bigint
}

export function NumberInput({ onChange, value }: Props) {
	const ref = useRef<HTMLInputElement>(null)

	const onInput = useCallback(() => {
		let value = ref.current?.value
		if (value != null) {
			const cleanValue = value.replace(/\D/g, '')
			console.log('cleanValue', cleanValue)
			if (cleanValue !== '') onChange(BigInt(cleanValue))
			if (cleanValue !== value) ref.current!.value = cleanValue
		}
	}, [ref])

	return (
		<input
			ref={ref}
			min="1"
			type="text"
			pattern="[0-9]*"
			inputMode="numeric"
			value={value.toString()}
			onInput={onInput}
		/>
	)
}
