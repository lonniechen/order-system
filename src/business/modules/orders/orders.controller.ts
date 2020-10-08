import {
    Controller,
    Post
} from '@nestjs/common';

import { ApiOrdersService } from './orders.service'

@Controller('/orders')
export class ApiOrdersController {
    constructor(
        private readonly ordersService: ApiOrdersService
    ) { }

    @Post('')
    async add() {
        const result = await this.ordersService.add()
        return result
    }


}
