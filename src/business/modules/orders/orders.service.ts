import {
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectID } from 'mongodb'
import * as AsyncLock from 'async-lock'

import { EntityOrders } from '../../entities/orders/orders.entity'
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options'
import { ApiService } from '../utilities/api.service'
import {
    ORDER_STATUS_TAKEN,
    ORDER_STATUS_UNASSIGNED
} from '../../constants/order-status.constants'
import {
    HTTP_STATUS_CODE_OK,
    HTTP_STATUS_CODE_BAD_REQUEST,
    HTTP_STATUS_CODE_FORBIDDEN,
    HTTP_STATUS_CODE_NOT_FOUND
} from '../../constants/http-status-code.constants'

@Injectable()
export class ApiOrdersService {

    constructor(
        @InjectRepository(EntityOrders, DB_CONN_NAME_ORDER)
        private readonly orderRepository: MongoRepository<EntityOrders>,
        private readonly apiService: ApiService,
        private readonly asyncLock: AsyncLock
    ) { }

    async placeOrder(origin: Array<string>, destination: Array<string>) {
        try {

            const distance = await this.apiService.getDistance(origin, destination)

            const order: any = {
                origin: origin,
                destination: destination,
                distance: distance,
                status: ORDER_STATUS_UNASSIGNED,
                createdTimestamp: new Date(),
                updatedTimestamp: new Date()
            }
            const newOrder: EntityOrders = await this.orderRepository.save(order)
            return {
                id: newOrder._id,
                distance: newOrder.distance,
                status: newOrder.status
            };

        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async takeOrder(id: string, status: string) {
        try {
            const result = await this.asyncLock.acquire(id, async () => {
                return await this.processTakeOrder(id, status)
            })
            return result
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async processTakeOrder(id: string, status: string) {
        try {
            if (status !== 'TAKEN') {
                return {
                    httpStatusCode: HTTP_STATUS_CODE_BAD_REQUEST,
                    body: {
                        error: `{status} must be 'TAKEN' in the request body`
                    }
                }
            }
            const targetOrder = await this.orderRepository.findOne({
                _id: new ObjectID(id)
            })
            if (!targetOrder) {
                return {
                    httpStatusCode: HTTP_STATUS_CODE_NOT_FOUND,
                    body: {
                        error: `order (id:${id}) not found`
                    }
                }
            }
            if (targetOrder.status === ORDER_STATUS_UNASSIGNED) {
                targetOrder.status = ORDER_STATUS_TAKEN
                targetOrder.updatedTimestamp = new Date()
                await this.orderRepository.save(targetOrder)
                return {
                    httpStatusCode: HTTP_STATUS_CODE_OK,
                    body: {
                        status: 'SUCCESS'
                    }
                }
            } else {
                return {
                    httpStatusCode: HTTP_STATUS_CODE_FORBIDDEN,
                    body: {
                        error: `fail to take order (id:${id}), which had been taken already`
                    }
                }
            }
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
                        id: orderElement._id,
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