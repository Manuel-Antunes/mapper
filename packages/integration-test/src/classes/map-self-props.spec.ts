import { AutoMap, classes } from '@automapper/classes';
import {
    afterMap,
    CamelCaseNamingConvention,
    constructUsing,
    createMap,
    createMapper,
    forSelf,
    Mapper,
    Mapping,
    ModelIdentifier,
} from '@automapper/core';
type Relation<T> = T;

class Item {
    name!: string;
    price!: number;
    stock!: number;
    @AutoMap(() => Environment)
    environment!: Relation<Environment>;
}

class ItemPropsDto {
    name!: string;
    price!: number;
    stock!: number;
    @AutoMap(() => EnvironmentEntity)
    environment!: Relation<EnvironmentEntity>;
}

class ItemEntity {
    protected readonly props: ItemPropsDto;
    constructor(props: ItemPropsDto) {
        this.props = props;
    }
    get name(): string {
        return this.props.name;
    }

    set name(value: string) {
        this.props.name = value;
    }
    get price(): number {
        return this.props.price;
    }
    get stock(): number {
        return this.props.stock;
    }

    get environment(): Relation<EnvironmentEntity> {
        return this.props.environment;
    }
}

class Environment {
    envName!: string;
    region!: string;
    @AutoMap(() => [Item])
    items!: Relation<Item>[];
}

class EnvironmentDto {
    envName!: string;
    region!: string;
    @AutoMap(() => [ItemEntity])
    items!: Relation<ItemEntity>[];
}

class EnvironmentEntity {
    constructor(protected props: EnvironmentDto) {}
    get envName(): string {
        return 'Environment:' + this.props.envName;
    }
    get region(): string {
        return this.props.region;
    }

    get items(): ItemEntity[] {
        return this.props.items;
    }

    get itemsAmount(): number {
        return this.props.items.length || 0;
    }
}

type Type<T = any> = new (...args: any[]) => T;
let counter = 0;
export function createEntityMap<
    E extends Type,
    P extends Type,
    D extends Type,
    SI extends ModelIdentifier = ModelIdentifier<E>,
    DI extends ModelIdentifier = ModelIdentifier<D>,
    PI extends ModelIdentifier = ModelIdentifier<P>
>(
    mapper: Mapper,
    sourceIdentifier: SI,
    destinationIdentifier: DI,
    propsIdentifier: PI,
    EntityClass: E,
    PersistenceClass: P,
    DtoClass: D
): Mapping {
    const IS_MAPPING = Symbol('is_mapping');
    const propsMapping = createMap(mapper, sourceIdentifier, propsIdentifier);
    return createMap(
        mapper,
        sourceIdentifier,
        destinationIdentifier,
        forSelf(propsMapping, (source) => source),
        constructUsing((source: InstanceType<typeof PersistenceClass>, id) => {
            const props = new DtoClass();
            Object.assign(props, source);
            Reflect.set(source, IS_MAPPING, true);

            const instance = new EntityClass(props, source.id);
            counter++;
            const mapped = new Proxy<InstanceType<typeof EntityClass>>(
                instance,
                {
                    set(target, p, newValue, receiver) {
                        const isMapping = Reflect.get(source, IS_MAPPING);
                        if (!isMapping) {
                            return Reflect.set(target, p, newValue, receiver);
                        } else {
                            return Reflect.set(props, p, newValue, receiver);
                        }
                    },
                }
            );

            return mapped;
        }),
        afterMap((src) => {
            Reflect.set(src, IS_MAPPING, false);
        })
    );
}

describe('Map - ForSelf', () => {
    const mapper = createMapper({
        strategyInitializer: classes(),
        namingConventions: new CamelCaseNamingConvention(),
    });

    const item = new Item();
    item.name = 'item1';
    item.price = 123;
    item.stock = 456;
    const environment = new Environment();
    environment.envName = 'production';
    environment.region = 'us-east-1';
    environment.items = [item];
    item.environment = environment;

    afterEach(() => {
        mapper.dispose();
    });

    it('should map with SourceIdentifier', async () => {
        createEntityMap(
            mapper,
            Item,
            ItemEntity,
            ItemPropsDto,
            ItemEntity,
            Item,
            ItemPropsDto
        );

        createEntityMap(
            mapper,
            Environment,
            EnvironmentEntity,
            EnvironmentDto,
            EnvironmentEntity,
            Environment,
            EnvironmentDto
        );

        createEntityMap(
            mapper,
            Item,
            ItemEntity,
            ItemPropsDto,
            ItemEntity,
            Item,
            ItemPropsDto
        );

        const entity = mapper.map(item, Item, ItemEntity);

        entity.name = 'updated name';
        expect(entity.name).toBe('updated name');
    });
});
