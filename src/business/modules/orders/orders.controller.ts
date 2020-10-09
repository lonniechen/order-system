import {
    Body,
    Controller,
    Get,
    Patch,
    Post
} from '@nestjs/common';

import { ApiOrdersService } from './orders.service'

@Controller('/orders')
export class ApiOrdersController {
    constructor(
        private readonly ordersService: ApiOrdersService
    ) { }

    @Post('')
    async placeOrder(
        @Body('origin') origin: Array<string>,
        @Body('destination') destination: Array<string>,
    ) {
        const result = await this.ordersService.placeOrder(origin, destination);
        const res = {
            id: result.id,
            distance: result.distance,
            status: result.status
        }
        return res
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
