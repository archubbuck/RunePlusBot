export class Numbers {

    public static round(number: number) {
        return (Math.round(number * 100) / 100).toString();
    };
    
    public static toKMB(number: number) {
        let n = Math.abs(number);
        if (n >= 1_000_000_000) {
            return (number / 1_000_000_000).toLocaleString() + "b";
        } else if (n >= 1_000_000) {
            return (number / 1_000_000).toLocaleString() + "m";
        } else if (n >= 1_000) {
            return (number / 1_000).toLocaleString() + "k";
        } else {
            return number.toLocaleString();
        }
    };
    
    public static fromKMB(number: string) {
        number = number.toLowerCase().replace(/,/g, '');
        let newNum = number.replace("k", "").replace("m", "").replace("b", "");
        if (number.endsWith("k")) {
            return parseFloat(newNum) * 1_000;
        } else if (number.endsWith("m")) {
            return parseFloat(newNum) * 1_000_000;
        } else if (number.endsWith("b")) {
            return parseFloat(newNum) * 1_000_000_000;
        }
        return parseFloat(newNum);
    }
}