import { MappingError } from '../errors/mapping-error';
import { getErrorHandler, getMappings } from '../symbols';
import type {
    Mapper,
    Mapping,
    MetadataIdentifier,
    ModelIdentifier,
} from '../types';

export function getMapping(
    mapper: Mapper,
    source: ModelIdentifier,
    destination: ModelIdentifier,
    allowNull = false
): Mapping {
    // turn string into symbol for identifier
    const sourceIdentifier: MetadataIdentifier =
        typeof source === 'string' ? Symbol.for(source) : source;
    const destinationIdentifier: MetadataIdentifier =
        typeof destination === 'string' ? Symbol.for(destination) : destination;

    const mapping = getMappings(mapper)
        .get(sourceIdentifier)
        ?.get(destinationIdentifier);

    if (mapping == null && !allowNull) {
        const sourceName =
            typeof source === 'function'
                ? source.name || String(source)
                : String(source);
        const destinationName =
            typeof destination === 'function'
                ? destination.name || String(destination)
                : String(destination);
        const errorHandler = getErrorHandler(mapper);
        const errorMessage = `Mapping is not found for ${sourceName} and ${destinationName}`;
        const error = new MappingError(errorMessage);
        errorHandler.handle(error);
        throw error;
    }

    return mapping as Mapping;
}
