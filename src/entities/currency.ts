export abstract class Currency {
    public readonly name: string
    public readonly symbol: string
    public readonly decimals: number

    protected constructor(name: string, symbol: string, decimals: number) {
        this.name = name
        this.symbol = symbol
        this.decimals = decimals
    }

    public abstract get wrapped(): Currency

    public abstract equals(currency: Currency): boolean
}
