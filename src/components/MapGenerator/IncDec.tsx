import { useCallback, useState } from 'preact/compat'

interface Props {
	minimumValue?: number
	maximumValue?: number
	onChange: (value: number) => void
	value?: string
}

export function IncDec({ maximumValue, minimumValue, onChange, value }: Props) {
	const [state] = useState(() => ({ timeout: setTimeout(() => {}) }));

	const change = useCallback(
		(event) => {
			clearTimeout(state.timeout);
			state.timeout = setTimeout(() => {
				onChange(~~event.target.value)
			}, 1000)
		},
		[onChange]
	)

	return <input type="range" onChange={change} min={minimumValue} max={maximumValue} value={value} />
}
