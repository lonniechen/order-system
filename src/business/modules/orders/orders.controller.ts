import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    InternalServerErrorException,
    Param,
    Query
} from '@nestjs/common';

import { ApiOrdersService } from './orders.service'
import { CoordinateValidationPipe } from '../../pipes/orders/coordinate.pipe'
import { PageLimitValidationPipe } from '../../pipes/orders/page-limit.pipe'

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
            const res = await this.ordersService.placeOrder(origin, destination);
            return res
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    @Patch(':id')
    async takeOrder(
        @Param('id') id: string
    ) {
        return "take order API"
    }

    @Get()
    async getOrderList(
        @Query('page', PageLimitValidationPipe) page: number,
        @Query('limit', PageLimitValidationPipe) limit: number,
    ) {
        try {
            const res = await this.ordersService.getOrderList(page, limit);
            return res;
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

}
