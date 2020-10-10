import {
    Injectable,
    HttpService
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'

import { EntityOrders } from '../../entities/orders/orders.entity'
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options'

@Injectable()
export class ApiOrdersService {

    constructor(
        @InjectRepository(EntityOrders, DB_CONN_NAME_ORDER)
        private readonly orderRepository: MongoRepository<EntityOrders>,

        private readonly httpService: HttpService
    ) { }

    async placeOrder(origin: Array<string>, destination: Array<string>) {

        const distanceReqConfig = {
            params: {
                origins: origin.join(','),
                destinations: destination.join(','),
                key: 'AIzaSyDZHxHsasPQ37Lo-f15C_rcQsxSE9ImcNk'
            }
        }
        const distanceRes = await this.httpService.get('https://maps.googleapis.com/maps/api/distancematrix/json', distanceReqConfig).toPromise()
        const distance = distanceRes.data.rows[0].elements[0].distance.value;
        
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