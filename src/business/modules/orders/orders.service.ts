import {
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
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
        try {

            const distance = await this.apiService.getDistance(origin, destination)

            const order: any = {
                origin: origin,
                destination: destination,
                distance: distance,
                status: 'UNASSIGNED',
                createdTimestamp: new Date(),
                updatedTimestamp: new Date()
            }
            const newOrder: EntityOrders = await this.orderRepository.save(order)

            return {
                id: newOrder.id,
                distance: newOrder.distance,
                status: newOrder.status
            };

        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async getOrderList(page: number, limit: number) {
        try {
            const skip = (page - 1) * limit
            const paginationResult: [EntityOrders[], number] = await this.orderRepository.findAndCount({
                take: limit,
                skip: skip
            })
            if (paginationResult[1]) {
                const orderList = paginationResult[0].map((orderElement: EntityOrders) => {
                    const order = {
                        id: orderElement.id,
                        distance: orderElement.distance,
                        status: orderElement.status,
                    }
                    return order
                })
                return orderList;
            } else {
                return []
            }
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

}