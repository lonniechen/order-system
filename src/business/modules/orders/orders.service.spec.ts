import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityOrders } from '../../entities/orders/orders.entity';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options';
import { Repository } from 'typeorm';
import { ApiOrdersService } from './orders.service';
import {
    HttpModule,
    InternalServerErrorException
} from '@nestjs/common';
import { ApiService } from '../utilities/api.service';

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
                ApiOrdersService
            ]
        }).compile();

        ordersService = moduleRef.get<ApiOrdersService>(ApiOrdersService);
        apiService = moduleRef.get<ApiService>(ApiService);
        orderRepository = moduleRef.get<Repository<EntityOrders>>(getRepositoryToken(EntityOrders, DB_CONN_NAME_ORDER));
    });

    describe('placeOrder', () => {

        const origin = ['40.66', '-73.89'];
        const destination = ['40.66', '-73.99'];
        const status = 'UNASSIGNED';
        const id = '5f81101ea85d4822302026a4';
        const distance = 9790;
        const createdTimestamp = new Date('2020-01-01');
        const updatedTimestamp = new Date('2020-01-02');

        const errorMessage = 'An Error'

        it('should return the origin, destination, id, distance and status of an order', async () => {
            const result = {
                origin: origin,
                destination: destination,
                status: status,
                id: id,
                distance: distance,
                createdTimestamp: createdTimestamp,
                updatedTimestamp: updatedTimestamp
            }
            jest.spyOn(apiService, 'getDistance').mockImplementation(() => Promise.resolve(distance));
            jest.spyOn(orderRepository, 'save').mockImplementation(() => Promise.resolve(result));
            expect(
                await ordersService.placeOrder(origin, destination)
            ).toMatchObject(result);
        });

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

    });
});