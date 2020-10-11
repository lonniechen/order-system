import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityOrders } from '../../entities/orders/orders.entity';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options';
import { Repository } from 'typeorm';
import { ApiOrdersController } from './orders.controller';
import { ApiOrdersService } from './orders.service';
import {
    HttpModule,
    InternalServerErrorException
} from '@nestjs/common';
import { ApiService } from '../utilities/api.service';

describe('ApiOrdersController', () => {

    let ordersController: ApiOrdersController;
    let ordersService: ApiOrdersService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ApiOrdersController],
            imports: [
                HttpModule,
            ],
            providers: [
                {
                    provide: getRepositoryToken(EntityOrders, DB_CONN_NAME_ORDER),
                    useClass: Repository
                },
                ApiService,
                ApiOrdersService
            ]
        }).compile();

        ordersService = moduleRef.get<ApiOrdersService>(ApiOrdersService);
        ordersController = moduleRef.get<ApiOrdersController>(ApiOrdersController);
    });

    describe('placeOrder', () => {
        const origin = ['40.66', '-73.89'];
        const destination = ['40.66', '-73.99'];
        const status = 'UNASSIGNED';
        const id = '5f81101ea85d4822302026a4';
        const distance = 9790;

        const errorMessage = 'An error'

        it('should capture the exception from ApiOrdersService and throw internal server error exception', async () => {
            jest.spyOn(ordersService, 'placeOrder').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersController.placeOrder(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage))
        });

        it('should return the id, distance and status of an order', async () => {
            const res = {
                status: status,
                id: id,
                distance: distance,
            };
            jest.spyOn(ordersService, 'placeOrder').mockImplementation(() => Promise.resolve(res));

            expect(
                await ordersController.placeOrder(origin, destination)
            ).toMatchObject(res);
        });
    });

    describe('getOrderList', () => {
        const page = 2;
        const limit = 2;

        const errorMessage = 'An Error'

        it('should capture the exception from ApiOrdersService and throw internal server error exception', async () => {
            jest.spyOn(ordersService, 'getOrderList').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersController.getOrderList(page, limit)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage))
        });

        it('should return an empty array if there are no results from ApiOrdersService', async () => {
            const res: any[] = []
            jest.spyOn(ordersService, 'getOrderList').mockImplementation(() => Promise.resolve(res));
            expect(
                await ordersController.getOrderList(page, limit)
            ).toMatchObject([]);
        });

        it('should return an array of EntityOrders', async () => {
            const status = 'UNASSIGNED';
            const distance = 9790;
            const id1 = '5f81101ea85d4822302026a4';
            const id2 = '5f81101ea85d4822302026a5';

            const res: any[] = [
                {
                    status: status,
                    id: id1,
                    distance: distance,
                },
                {
                    status: status,
                    id: id2,
                    distance: distance,
                },
            ]
            jest.spyOn(ordersService, 'getOrderList').mockImplementation(() => Promise.resolve(res));
            expect(
                await ordersController.getOrderList(page, limit)
            ).toMatchObject(res);
        });
    });
});