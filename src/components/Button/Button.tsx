import type { ComponentProps } from 'preact'

import styles from './Button.module.css'

type ButtonProps = {
	primary?: boolean
	reset?: boolean
	submit?: boolean
} & Omit<ComponentProps<'button'>, 'type'>

export function Button({ className = '', primary, reset, submit, ...props }: ButtonProps) {
	const variant = primary ? 'primary' : 'secondary'
	const type = submit ? 'submit' : reset ? 'reset' : 'button'
	return <button className={`${styles.button} ${className}`.trim()} data-variant={variant} type={type} {...props} />
}
