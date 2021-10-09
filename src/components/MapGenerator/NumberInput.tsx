import { useCallback, useRef } from 'preact/compat'

interface Props {
	onChange: (value: number) => void
	value: number
}

export function NumberInput({ onChange, value }: Props) {
	const ref = useRef<HTMLInputElement>(null)

	const onInput = useCallback(() => {
		const value = ref.current?.value
		if (value != null && value !== '') onChange(~~value)
	}, [ref])

	return <input ref={ref} min="1" type="number" value={value} onInput={onInput} />
}
