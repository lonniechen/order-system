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
            host: process.env.DOCKER_MONGO_HOST ? process.env.DOCKER_MONGO_HOST : process.env.MONGO_HOST,
            port: parseInt(process.env.MONGO_PORT),
            database: process.env.MONGO_DATABASE,
            keepConnectionAlive: true,
            synchronize: false,
            useUnifiedTopology: true,
            entities: [this.entityPath]
        } as TypeOrmModuleOptions
    }

}

export const DB_CONN_NAME_ORDER = 'ordersConnection'