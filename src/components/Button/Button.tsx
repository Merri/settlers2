import type { ComponentProps } from 'preact'
import { button } from './Button.module.css'

type ButtonProps = {
	primary?: boolean
	secondary?: boolean
	reset?: boolean
	submit?: boolean
} & Omit<ComponentProps<'button'>, 'type'>

export function Button({ className = '', primary, reset, secondary, submit, ...props }: ButtonProps) {
	const variant = primary ? 'primary' : 'secondary'
	const type = submit ? 'submit' : reset ? 'reset' : 'button'
	return <button className={[button, className].join(' ').trim()} data-variant={variant} type={type} {...props} />
}
