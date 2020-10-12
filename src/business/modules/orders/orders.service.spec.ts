import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    HttpModule,
    InternalServerErrorException
} from '@nestjs/common';
import * as AsyncLock from 'async-lock'

import { EntityOrders } from '../../entities/orders/orders.entity';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options';
import { ApiOrdersService } from './orders.service';
import { ApiService } from '../utilities/api.service';

import {
    ORDER_STATUS_TAKEN,
    ORDER_STATUS_UNASSIGNED
} from '../../constants/order-status.constants'

describe('ApiOrdersService', () => {

    let apiService: ApiService;
    let ordersService: ApiOrdersService;
    let orderRepository: Repository<EntityOrders>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                HttpModule,
            ],
            providers: [
                {
                    provide: getRepositoryToken(EntityOrders, DB_CONN_NAME_ORDER),
                    useClass: Repository
                },
                ApiService,
                ApiOrdersService,
                AsyncLock
            ]
        }).compile();

        ordersService = moduleRef.get<ApiOrdersService>(ApiOrdersService);
        apiService = moduleRef.get<ApiService>(ApiService);
        orderRepository = moduleRef.get<Repository<EntityOrders>>(getRepositoryToken(EntityOrders, DB_CONN_NAME_ORDER));
    });

    describe('placeOrder', () => {
        const origin = ['40.66', '-73.89'];
        const destination = ['40.66', '-73.99'];
        const status = ORDER_STATUS_UNASSIGNED;
        const _id = '5f81101ea85d4822302026a4';
        const distance = 9790;
        const createdTimestamp = new Date('2020-01-01');
        const updatedTimestamp = new Date('2020-01-02');

        const errorMessage = 'An Error'

        it('should capture the exception from ApiService and throw internal server error exception', async () => {
            jest.spyOn(apiService, 'getDistance').mockRejectedValue(new Error(errorMessage))
            expect(
                ordersService.placeOrder(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should capture the exception from OrderEntityRepository and throw internal server error exception', async () => {
            jest.spyOn(apiService, 'getDistance').mockImplementation(() => Promise.resolve(distance));
            jest.spyOn(orderRepository, 'save').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersService.placeOrder(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should return the origin, destination, id, distance and status of an order', async () => {
            const newOrder: EntityOrders = {
                origin: origin,
                destination: destination,
                status: status,
                _id: _id,
                distance: distance,
                createdTimestamp: createdTimestamp,
                updatedTimestamp: updatedTimestamp
            }
            jest.spyOn(apiService, 'getDistance').mockImplementation(() => Promise.resolve(distance));
            jest.spyOn(orderRepository, 'save').mockImplementation(() => Promise.resolve(newOrder));
            expect(
                await ordersService.placeOrder(origin, destination)
            ).toMatchObject({
                status: status,
                id: _id,
                distance: distance
            });
        });
    });

    describe('getOrderList', () => {
        const page = 2;
        const limit = 2;

        const errorMessage = 'An Error'

        it('should capture the exception from OrderEntityRepository and throw internal server error exception', async () => {
            jest.spyOn(orderRepository, 'findAndCount').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersService.getOrderList(page, limit)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should return an empty array if there are no results', async () => {
            const paginationResult: [EntityOrders[], number] = [
                [],
                0
            ]
            jest.spyOn(orderRepository, 'findAndCount').mockImplementation(() => Promise.resolve(paginationResult));
            expect(
                await ordersService.getOrderList(page, limit)
            ).toMatchObject([]);
        });

        it('should return an array of EntityOrders', async () => {
            const origin = ['40.66', '-73.89'];
            const destination = ['40.66', '-73.99'];
            const status = ORDER_STATUS_UNASSIGNED;
            const distance = 9790;
            const createdTimestamp = new Date('2020-01-01');
            const updatedTimestamp = new Date('2020-01-02');
            const _id1 = '5f81101ea85d4822302026a4';
            const _id2 = '5f81101ea85d4822302026a5';

            const paginationResult: [EntityOrders[], number] = [
                [
                    {
                        origin: origin,
                        destination: destination,
                        status: status,
                        _id: _id1,
                        distance: distance,
                        createdTimestamp: createdTimestamp,
                        updatedTimestamp: updatedTimestamp
                    },
                    {
                        origin: origin,
                        destination: destination,
                        status: status,
                        _id: _id2,
                        distance: distance,
                        createdTimestamp: createdTimestamp,
                        updatedTimestamp: updatedTimestamp
                    },
                ],
                2
            ]
            jest.spyOn(orderRepository, 'findAndCount').mockImplementation(() => Promise.resolve(paginationResult));
            expect(
                await ordersService.getOrderList(page, limit)
            ).toMatchObject([
                {
                    status: status,
                    id: _id1,
                    distance: distance

                },
                {
                    status: status,
                    id: _id2,
                    distance: distance
                },
            ]);
        });
    });
});