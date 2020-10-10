import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityOrders } from '../../entities/orders/orders.entity';
import { ApiOrdersController } from './orders.controller';
import { ApiOrdersService } from './orders.service';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options'
import { ApiService } from '../utilities/api.service';

@Module({
    controllers: [
        ApiOrdersController
    ],
    providers: [
        ApiOrdersService,
        ApiService
    ],
    imports: [
        TypeOrmModule.forFeature(
            [
                EntityOrders
            ],
            DB_CONN_NAME_ORDER
        ),
        HttpModule
    ]
})
export class ApiOrdersModule { }
