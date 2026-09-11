export class DataWriter<TDataType extends object> {

    private data: Array<TDataType> | null = null;
    private processed: {
        header: string,
        lines: Array<string>
    } | null = null

    constructor(data: Array<TDataType>) {
        this.data = data;
        this.processed = this.processData()
    }

    private convertLine = (entry: TDataType) => {

        const values = Object.values(entry)

        return values.join(",")
    }

    private processData() {
        if (!this.data) return null;
        if (this.data.length === 0) return null;

        const header = Object.keys(this.data[0]).join(",")
        const lines = this.data.map((entry) => this.convertLine(entry))

        return {
            header,
            lines
        }
    }

    public text(headers?: boolean) {

        if (!this.processed) return null;

        const lines: Array<string> = []

        if (headers) {
            lines.push(this.processed.header)
        }

        this.processed.lines.forEach((line) => lines.push(line))

        const combinedString = lines.join("\n")

        return combinedString;

    }

    public bytes(headers?: boolean): Uint8Array | null {

        if (!this.processed) return null;

        const textFile = this.text(headers ? true : false);

        if (!textFile) return null;

        const textEncoder = new TextEncoder()
        const bytes = textEncoder.encode(textFile)

        return bytes;
    }

}
