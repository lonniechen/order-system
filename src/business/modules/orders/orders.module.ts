import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as AsyncLock from 'async-lock'

import { EntityOrders } from '../../entities/orders/orders.entity';
import { ApiOrdersController } from './orders.controller';
import { ApiOrdersService } from './orders.service';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options'
import { ApiService } from '../utilities/api.service';
import { CoordinateValidationPipe } from '../../pipes/orders/coordinate.pipe'
import { PageLimitValidationPipe } from '../../pipes/orders/page-limit.pipe'
import { StringInputValidationPipe } from '../../pipes/orders/string-input.pipe'

@Module({
    controllers: [
        ApiOrdersController
    ],
    providers: [
        ApiOrdersService,
        ApiService,
        AsyncLock,
        CoordinateValidationPipe,
        PageLimitValidationPipe,
        StringInputValidationPipe
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
