
export default {
    ajust(number) {
        return `00${number}`.slice(-2);
    },
    getPUMLDate(date) {
        return `${date.getFullYear()}-${this.ajust(date.getMonth()+1)}-${this.ajust(date.getDate())}`;
    }
}
