export function asHex(num: number, byteSize = 2) {
	return ('0'.repeat(byteSize - 1) + num.toString(16)).slice(-byteSize).toUpperCase()
}
