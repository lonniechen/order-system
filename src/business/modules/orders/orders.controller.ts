import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    InternalServerErrorException
} from '@nestjs/common';

import { ApiOrdersService } from './orders.service'
import { CoordinateValidationPipe } from '../../pipes/orders/coordinate.pipe'

@Controller('/orders')
export class ApiOrdersController {
    constructor(
        private readonly ordersService: ApiOrdersService
    ) { }

    @Post('')
    async placeOrder(
        @Body('origin', CoordinateValidationPipe) origin: Array<string>,
        @Body('destination', CoordinateValidationPipe) destination: Array<string>,
    ) {
        try {
            const newOrder = await this.ordersService.placeOrder(origin, destination);
            const res = {
                id: newOrder.id,
                distance: newOrder.distance,
                status: newOrder.status
            }
            return res
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    @Patch()
    async takeOrder() {
        return "take order API"
    }

    @Get()
    async getOrderList() {
        return "get order list API"
    }

}
