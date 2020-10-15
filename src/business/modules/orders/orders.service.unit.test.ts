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
import {
    HTTP_STATUS_CODE_BAD_REQUEST,
    HTTP_STATUS_CODE_FORBIDDEN,
    HTTP_STATUS_CODE_NOT_FOUND,
    HTTP_STATUS_CODE_OK
} from '../../constants/http-status-code.constants';

describe('ApiOrdersService', () => {

    let apiService: ApiService;
    let ordersService: ApiOrdersService;
    let orderRepository: Repository<EntityOrders>;
    let asyncLock: AsyncLock;

    const origin = ['40.66', '-73.89'];
    const destination = ['40.66', '-73.99'];
    const _id = '5f81101ea85d4822302026a4';
    const distance = 9790;
    const createdTimestamp = new Date('2020-01-01');
    const updatedTimestamp = new Date('2020-01-02');

    const page = 2;
    const limit = 2;

    const errorMessage = 'An Error'

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
        asyncLock = moduleRef.get<AsyncLock>(AsyncLock)
    });

    describe('placeOrder', () => {
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
                status: ORDER_STATUS_UNASSIGNED,
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
                status: ORDER_STATUS_UNASSIGNED,
                id: _id,
                distance: distance
            });
        });
    });


    describe('takeOrder', () => {
        it('should capture the exception from asyncLock and throw internal server error exception', async () => {
            jest.spyOn(asyncLock, 'acquire').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersService.takeOrder(_id, ORDER_STATUS_TAKEN)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should capture the exception from processTakeOrder and throw internal server error exception', async () => {
            jest.spyOn(ordersService, 'processTakeOrder').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersService.takeOrder(_id, ORDER_STATUS_TAKEN)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should return status "SUCCESS" and corresponding HTTP status code from asyncLock', async () => {
            const result = {
                httpStatusCode: HTTP_STATUS_CODE_OK,
                body: {
                    status: 'SUCCESS'
                }
            }
            jest.spyOn(asyncLock, 'acquire').mockImplementation(() => Promise.resolve(result));
            expect(
                await ordersService.takeOrder(_id, ORDER_STATUS_TAKEN)
            ).toMatchObject(result)
        });

        it('should return status "SUCCESS" and corresponding HTTP status code from processTakeOrder', async () => {
            const result = {
                httpStatusCode: HTTP_STATUS_CODE_OK,
                body: {
                    status: 'SUCCESS'
                }
            }
            jest.spyOn(ordersService, 'processTakeOrder').mockImplementation(() => Promise.resolve(result));
            expect(
                await ordersService.takeOrder(_id, ORDER_STATUS_TAKEN)
            ).toMatchObject(result)
        });
    });

    describe('processTakeOrder', () => {

        const generateResult = (id: string, resultType: string) => {
            switch (resultType) {
                case 'status-not-TAKEN':
                    return {
                        httpStatusCode: HTTP_STATUS_CODE_BAD_REQUEST,
                        body: {
                            error: `{status} must be 'TAKEN' in the request body`
                        }
                    }
                case 'order_not_found':
                    return {
                        httpStatusCode: HTTP_STATUS_CODE_NOT_FOUND,
                        body: {
                            error: `order (id:${id}) not found`
                        }
                    }
                case 'order_is_taken':
                    return {
                        httpStatusCode: HTTP_STATUS_CODE_FORBIDDEN,
                        body: {
                            error: `fail to take order (id:${id}), which had been taken already`
                        }
                    }
                case 'success':
                    return {
                        httpStatusCode: HTTP_STATUS_CODE_OK,
                        body: {
                            status: `SUCCESS`
                        }
                    }
                default:
                    return
            }
        }

        it('should return bad request exception if status is not "TAKEN"', async () => {
            expect(
                await ordersService.processTakeOrder(_id, 'A random status')
            ).toMatchObject(generateResult(_id, 'status-not-TAKEN'))
        });

        it('should return not found exception if the id can not be found in the database', async () => {
            jest.spyOn(orderRepository, 'findOne').mockImplementation(() => Promise.resolve(null));
            expect(
                await ordersService.processTakeOrder(_id, ORDER_STATUS_TAKEN)
            ).toMatchObject(generateResult(_id, 'order_not_found'))
        });

        it('should return forbidden exception if the order is taken already', async () => {
            const targetOrder: EntityOrders = {
                origin: origin,
                destination: destination,
                status: ORDER_STATUS_TAKEN,
                _id: _id,
                distance: distance,
                createdTimestamp: createdTimestamp,
                updatedTimestamp: updatedTimestamp
            }
            jest.spyOn(orderRepository, 'findOne').mockImplementation(() => Promise.resolve(targetOrder));
            expect(
                await ordersService.processTakeOrder(_id, ORDER_STATUS_TAKEN)
            ).toMatchObject(generateResult(_id, 'order_is_taken'))
        });

        it('should exception from orderRepository.findOne and throw internal server error exception', async () => {
            jest.spyOn(orderRepository, 'findOne').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersService.processTakeOrder(_id, ORDER_STATUS_TAKEN)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should exception from orderRepository.findOne and throw internal server error exception', async () => {
            const targetOrder: EntityOrders = {
                origin: origin,
                destination: destination,
                status: ORDER_STATUS_UNASSIGNED,
                _id: _id,
                distance: distance,
                createdTimestamp: createdTimestamp,
                updatedTimestamp: updatedTimestamp
            }
            jest.spyOn(orderRepository, 'findOne').mockImplementation(() => Promise.resolve(targetOrder));
            jest.spyOn(orderRepository, 'save').mockRejectedValue(new Error(errorMessage));
            expect(
                ordersService.processTakeOrder(_id, ORDER_STATUS_TAKEN)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should return SUCCESS', async () => {
            const targetOrder: EntityOrders = {
                origin: origin,
                destination: destination,
                status: ORDER_STATUS_UNASSIGNED,
                _id: _id,
                distance: distance,
                createdTimestamp: createdTimestamp,
                updatedTimestamp: updatedTimestamp
            }
            jest.spyOn(orderRepository, 'findOne').mockImplementation(() => Promise.resolve(targetOrder));
            jest.spyOn(orderRepository, 'save').mockImplementation(() => Promise.resolve(null));
            expect(
                await ordersService.processTakeOrder(_id, ORDER_STATUS_TAKEN)
            ).toMatchObject(generateResult(_id, 'success'))
        });
    })

    describe('getOrderList', () => {

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

            const _id1 = '5f81101ea85d4822302026a4';
            const _id2 = '5f81101ea85d4822302026a5';

            const paginationResult: [EntityOrders[], number] = [
                [
                    {
                        origin: origin,
                        destination: destination,
                        status: ORDER_STATUS_UNASSIGNED,
                        _id: _id1,
                        distance: distance,
                        createdTimestamp: createdTimestamp,
                        updatedTimestamp: updatedTimestamp
                    },
                    {
                        origin: origin,
                        destination: destination,
                        status: ORDER_STATUS_UNASSIGNED,
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
                    status: ORDER_STATUS_UNASSIGNED,
                    id: _id1,
                    distance: distance

                },
                {
                    status: ORDER_STATUS_UNASSIGNED,
                    id: _id2,
                    distance: distance
                },
            ]);
        });
    });
});