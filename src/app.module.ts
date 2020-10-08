import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MongodbOptions } from './database/mongodb.options';
import { ApiOrdersModule } from './business/modules/orders/orders.module'
import { DB_CONN_ORDER } from './constants/database.constants'

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: DB_CONN_ORDER,
            useFactory: () => {
                const test = new MongodbOptions(
                    `${__dirname}/business/entities/**/*`
                );
                return test.createTypeOrmOptions();
            },
        }),

        ApiOrdersModule
    ]
})
export class AppModule { }
