import { ChangeEventHandler, useCallback, useState } from 'preact/compat'

interface Props {
	delay?: number
	minimumValue?: number
	maximumValue?: number
	step?: number
	onChange: (value: number) => void
	value?: string | number
}

const style = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }

const inputStyle = { width: '15rem' }

export function IncDec({ delay = 1000, maximumValue, minimumValue, onChange, step, value }: Props) {
	const [state] = useState(() => ({ timeout: setTimeout(() => {}) }))
	const [internalValue, setValue] = useState(value)

	const change: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (event.target instanceof HTMLInputElement && event.target.value !== '') {
				const value = ~~event.target.value
				setValue(value)
				clearTimeout(state.timeout)
				state.timeout = setTimeout(() => {
					onChange(value)
				}, delay)
			}
		},
		[onChange]
	)

	return (
		<span style={style}>
			<input
				type="range"
				onChange={change}
				min={minimumValue}
				max={maximumValue}
				step={step || 1}
				value={internalValue}
				style={inputStyle}
			/>
			{internalValue}
		</span>
	)
}
