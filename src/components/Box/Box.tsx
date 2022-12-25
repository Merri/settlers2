import { ComponentProps, FC, JSX } from 'preact/compat'

type ElementType<P = any> =
	| {
			[K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never
	  }[keyof JSX.IntrinsicElements]
	| FC<P>

interface BoxProps<T extends ElementType> {
	as?: T
	gap?: '04' | '08' | '16' | '24'
	theme?: 'white' | 'black'
	variant?: 'card' | 'card04' | 'card08' | 'card16'
}

function Box<T extends ElementType = 'div'>({
	as,
	className = '',
	gap,
	theme,
	...props
}: BoxProps<T> & Omit<ComponentProps<T>, keyof BoxProps<T>>): JSX.Element {
	const As = as || 'div'
	return <As className={[className].join(' ').trim()} {...props} data-gap={gap} data-theme={theme} />
}

function Test() {
	return <div />
}

;<>
	<Box as={Test}></Box>
	<Box as="div"></Box>
</>

export { Box }
