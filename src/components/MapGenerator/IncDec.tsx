import { useCallback, useState } from 'preact/compat'

interface Props {
	delay?: number
	minimumValue?: number
	maximumValue?: number
	onChange: (value: number) => void
	value?: string
}

export function IncDec({ delay = 1000, maximumValue, minimumValue, onChange, value }: Props) {
	const [state] = useState(() => ({ timeout: setTimeout(() => {}) }));

	const change = useCallback(
		(event) => {
			clearTimeout(state.timeout);
			state.timeout = setTimeout(() => {
				onChange(~~event.target.value)
			}, delay)
		},
		[onChange]
	)

	return <input type="number" onChange={change} min={minimumValue} max={maximumValue} step="1" value={value} />
}
