import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { MongodbOptions } from './shared/database/mongodb.options';

@Module({
    controllers: [
        AppController
    ],
    imports: [
        TypeOrmModule.forRootAsync({
            name: "testConn",
            useFactory: () => {
                const test = new MongodbOptions(
                    `${__dirname}/business/entities/**/`
                );
                return test.createTypeOrmOptions();
            },
        })
    ]
})
export class AppModule { }
