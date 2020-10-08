import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'

import { EntityOrders } from '../../entities/orders/orders.entity'
import { DB_CONN_ORDER } from '../../../constants/database.constants'

@Injectable()
export class ApiOrdersService {

    constructor(
        @InjectRepository(EntityOrders, DB_CONN_ORDER)
        private readonly orderRepository: MongoRepository<EntityOrders>
    ) { }

    async add() {
        const testObj = {
            origin: [],
            destination: [],
            distance: 100,
            status: "UNASSIGNED"
        }
        const result = await this.orderRepository.save(testObj)
        return result;
    }


}