export class MappingError extends Error {
    cause: Error | undefined;
    constructor(
        message: string,
        data: {
            cause?: Error;
        } = {}
    ) {
        super(`Mapping Error: ${message}`);
        this.name = 'MappingError';
        this.cause = data.cause;
    }
}
