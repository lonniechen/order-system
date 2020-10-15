import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Param,
    Query,
    Response,
} from '@nestjs/common';
import { Response as Res } from 'express'

import { ApiOrdersService } from './orders.service'
import { CoordinateValidationPipe } from '../../pipes/orders/coordinate.pipe'
import { PageLimitValidationPipe } from '../../pipes/orders/page-limit.pipe'
import { StringInputValidationPipe } from '../../pipes/orders/string-input.pipe'
import {
    HTTP_STATUS_CODE_OK,
    HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR
} from '../../constants/http-status-code.constants'

@Controller('/orders')
export class ApiOrdersController {
    constructor(
        private readonly ordersService: ApiOrdersService
    ) { }

    @Post()
    async placeOrder(
        @Body('origin', CoordinateValidationPipe) origin: Array<string>,
        @Body('destination', CoordinateValidationPipe) destination: Array<string>,
        @Response() res: Res
    ): Res {
        try {
            const body = await this.ordersService.placeOrder(origin, destination);
            return res.set({ 'HTTP': HTTP_STATUS_CODE_OK }).json(body)
        } catch (error) {
            return res.set({ 'HTTP': HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR }).json({ 'error': error.message })
        }
    }

    @Patch(':id')
    async takeOrder(
        @Param('id', StringInputValidationPipe) id: string,
        @Body('status', StringInputValidationPipe) status: string,
        @Response() res: Res
    ) {
        try {
            const result = await this.ordersService.takeOrder(id, status);
            return res.set({ 'HTTP': result.httpStatusCode }).json(result.body)
        } catch (error) {
            return res.set({ 'HTTP': HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR }).json({ 'error': error.message })
        }
    }

    @Get()
    async getOrderList(
        @Query('page', PageLimitValidationPipe) page: number,
        @Query('limit', PageLimitValidationPipe) limit: number,
        @Response() res: Res
    ) {
        try {
            const body = await this.ordersService.getOrderList(page, limit);
            return res.set({ 'HTTP': HTTP_STATUS_CODE_OK }).json(body)
        } catch (error) {
            return res.set({ 'HTTP': HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR }).json({ 'error': error.message })
        }
    }

}
