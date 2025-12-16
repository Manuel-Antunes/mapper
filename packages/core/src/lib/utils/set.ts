export function set<T extends Record<string, unknown>>(
    object: T,
    path: string[],
    value: unknown
): (T & { [p: string]: unknown }) | T {
    const { decomposedPath, base } = decomposePath(path);

    if (base === undefined) {
        return object;
    }

    // assign an empty object in order to spread object
    assignEmpty(object, base);

    // Determine if there is still layers to traverse
    value =
        decomposedPath.length <= 1
            ? value
            : set(
                  object[base] as Record<string, unknown>,
                  decomposedPath.slice(1),
                  value
              );

    return Object.assign(object, { [base]: value });
}

export function setMutate<T extends Record<string, unknown>>(
    object: T,
    path: string[],
    value: unknown
): void {
    const { decomposedPath, base } = decomposePath(path);

    if (base === undefined) {
        return;
    }

    // assign an empty object in order to spread object
    assignEmpty(object, base);

    // Determine if there is still layers to traverse
    if (decomposedPath.length <= 1) {
        (object as Record<string, unknown>)[base] = value;
    } else {
        setMutate(
            object[base] as Record<string, unknown>,
            decomposedPath.slice(1),
            value
        );
    }
}

function decomposePath(path: string[]): {
    decomposedPath: string[];
    base: string;
} {
    if (path.length < 1) {
        return { base: '', decomposedPath: [] };
    }
    const decomposedPath = path;
    const base = path[0];
    return { base, decomposedPath };
}

function assignEmpty(obj: Record<string, unknown>, base: string) {
    if (!Object.prototype.hasOwnProperty.call(obj, base)) {
        // Check if the property has a setter defined
        // If it does, skip assigning empty object to avoid triggering setter with {}
        const descriptor = getPropertyDescriptor(obj, base);
        if (descriptor && descriptor.set) {
            // Don't assign empty object if there's a setter
            // The actual value will be set later
            return;
        }
        obj[base] = {};
    }
}

function getPropertyDescriptor(
    obj: Record<string, unknown>,
    prop: string
): PropertyDescriptor | undefined {
    let current = obj;
    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, prop);
        if (descriptor) {
            return descriptor;
        }
        current = Object.getPrototypeOf(current);
    }
    return undefined;
}
