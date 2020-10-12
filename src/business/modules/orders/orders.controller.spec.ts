import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    HttpModule
} from '@nestjs/common';
import * as HttpMock from 'node-mocks-http';
import * as AsyncLock from 'async-lock'

import { EntityOrders } from '../../entities/orders/orders.entity';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options';
import { ApiOrdersController } from './orders.controller';
import { ApiOrdersService } from './orders.service';
import { ApiService } from '../utilities/api.service';
import {
    HTTP_STATUS_CODE_OK,
    HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR
} from '../../constants/http-status-code.constants'
import {
    ORDER_STATUS_UNASSIGNED
} from '../../constants/order-status.constants'

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
                ApiOrdersService,
                AsyncLock
            ]
        }).compile();

        ordersService = moduleRef.get<ApiOrdersService>(ApiOrdersService);
        ordersController = moduleRef.get<ApiOrdersController>(ApiOrdersController);
    });

    describe('placeOrder', () => {
        const origin = ['40.66', '-73.89'];
        const destination = ['40.66', '-73.99'];
        const status = ORDER_STATUS_UNASSIGNED;
        const id = '5f81101ea85d4822302026a4';
        const distance = 9790;

        const errorMessage = 'An error'

        it('should capture the exception from ApiOrdersService and return error message', async () => {
            jest.spyOn(ordersService, 'placeOrder').mockRejectedValue(new Error(errorMessage));

            const res = HttpMock.createResponse()
            const response = await ordersController.placeOrder(origin, destination, res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject({ 'error': errorMessage });
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR);
        });

        it('should return the id, distance and status of an order', async () => {
            const body = {
                status: status,
                id: id,
                distance: distance,
            };
            jest.spyOn(ordersService, 'placeOrder').mockImplementation(() => Promise.resolve(body));

            const res = HttpMock.createResponse()
            const response = await ordersController.placeOrder(origin, destination, res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject(body);
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_OK);
        });
    });

    describe('takeOrder', () => {

        const id = '5f81101ea85d4822302026a4';

        const errorMessage = 'An Error'

        it('should capture the exception from ApiOrdersService and return error message', async () => {
            jest.spyOn(ordersService, 'takeOrder').mockRejectedValue(new Error(errorMessage));

            const res = HttpMock.createResponse()
            const response = await ordersController.takeOrder(id, 'TAKEN', res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject({ 'error': errorMessage });
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR);
        });

        it('should return an object with status: "SUCCESS"', async () => {
            const body = { status: 'SUCCESS' }
            const result = {
                httpStatusCode: HTTP_STATUS_CODE_OK,
                body: body
            }
            jest.spyOn(ordersService, 'takeOrder').mockImplementation(() => Promise.resolve(result));

            const res = HttpMock.createResponse()
            const response = await ordersController.takeOrder(id, 'TAKEN', res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject(body);
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_OK);
        });
    });

    describe('getOrderList', () => {
        const page = 2;
        const limit = 2;

        const errorMessage = 'An Error'

        it('should capture the exception from ApiOrdersService and return error message', async () => {
            jest.spyOn(ordersService, 'getOrderList').mockRejectedValue(new Error(errorMessage));

            const res = HttpMock.createResponse()
            const response = await ordersController.getOrderList(page, limit, res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject({ 'error': errorMessage });
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR);
        });

        it('should return an empty array if there are no results from ApiOrdersService', async () => {
            const body: any[] = []
            jest.spyOn(ordersService, 'getOrderList').mockImplementation(() => Promise.resolve(body));

            const res = HttpMock.createResponse()
            const response = await ordersController.getOrderList(page, limit, res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject(body);
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_OK);
        });

        it('should return an array of EntityOrders', async () => {
            const status = ORDER_STATUS_UNASSIGNED;
            const distance = 9790;
            const id1 = '5f81101ea85d4822302026a4';
            const id2 = '5f81101ea85d4822302026a5';
            const body: any[] = [
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
            jest.spyOn(ordersService, 'getOrderList').mockImplementation(() => Promise.resolve(body));

            const res = HttpMock.createResponse()
            const response = await ordersController.getOrderList(page, limit, res)
            const responseBody = JSON.parse(response._getData())
            const responseHeader = response._getHeaders()

            expect(responseBody).toMatchObject(body);
            expect(responseHeader.http).toEqual(HTTP_STATUS_CODE_OK);
        });
    });
});