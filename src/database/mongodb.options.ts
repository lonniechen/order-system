import {
    TypeOrmOptionsFactory,
    TypeOrmModuleOptions
} from '@nestjs/typeorm'

export class MongodbOptions implements TypeOrmOptionsFactory {

    private entityPath: string;

    constructor(entityPath: string) {
        this.entityPath = entityPath
    }

    async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
        return {
            type: 'mongodb',
            host: '127.0.0.1',
            port: 27017,
            database: 'project',
            keepConnectionAlive: true,
            synchronize: false,
            useUnifiedTopology: true,
            entities: [this.entityPath]
        } as TypeOrmModuleOptions
    }

}

export const DB_CONN_NAME_ORDER = 'ordersConnection'