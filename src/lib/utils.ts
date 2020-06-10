export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomString (length: number) {
    const availableChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += availableChars[Math.floor(Math.random() * availableChars.length)];
    }
    return randomString;
}