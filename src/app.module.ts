import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'

import { MongodbOptions } from './database/mongodb.options';
import { ApiOrdersModule } from './business/modules/orders/orders.module'
import { DB_CONN_NAME_ORDER } from './database/mongodb.options'
import { AppController } from "./app.controller"

export class AppModule {
    static forRoot(env: string): DynamicModule {
        return {
            module: AppModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    name: DB_CONN_NAME_ORDER,
                    useFactory: () => {
                        const mongodbOptions = new MongodbOptions(
                            `${__dirname}/business/entities/**/*`
                        );
                        return mongodbOptions.createTypeOrmOptions();
                    },
                }),
                ConfigModule.forRoot({
                    envFilePath: `./config/${env}.env`,
                    isGlobal: true,
                }),
                ApiOrdersModule
            ],
            controllers: [
                AppController
            ]
        }
    }
}
