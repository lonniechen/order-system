import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'

import { EntityOrders } from '../../entities/orders/orders.entity'
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options'
import { ApiService } from '../utilities/api.service'

@Injectable()
export class ApiOrdersService {

    constructor(
        @InjectRepository(EntityOrders, DB_CONN_NAME_ORDER)
        private readonly orderRepository: MongoRepository<EntityOrders>,

        private readonly apiService: ApiService
    ) { }

    async placeOrder(origin: Array<string>, destination: Array<string>) {

        const distance = await this.apiService.getDistance(origin, destination)

        const newOrder = {
            origin: origin,
            destination: destination,
            distance: distance,
            status: "UNASSIGNED"
        }
        const result = await this.orderRepository.save(newOrder)

        return result;
    }

}