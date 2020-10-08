import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityOrders } from '../../entities/orders/orders.entity';
import { ApiOrdersController } from './orders.controller';
import { ApiOrdersService } from './orders.service';
import { DB_CONN_ORDER } from '../../../constants/database.constants'

@Module({
    controllers: [
        ApiOrdersController
    ],
    providers: [
        ApiOrdersService
    ],
    imports: [
        TypeOrmModule.forFeature(
            [
                EntityOrders
            ],
            DB_CONN_ORDER
        )
    ]
})
export class ApiOrdersModule { }
