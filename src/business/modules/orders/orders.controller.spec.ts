import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityOrders } from '../../entities/orders/orders.entity';
import { DB_CONN_NAME_ORDER } from '../../../database/mongodb.options';
import { Repository } from 'typeorm';
import { ApiOrdersController } from './orders.controller';
import { ApiOrdersService } from './orders.service';
import { HttpModule } from '@nestjs/common';
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
        it('should return the id, distance and status of an order', async () => {
            const newOrder = {
                origin: ["40.66", "-73.89"],
                destination: ["40.66", "-73.99"],
                status: "UNASSIGNED",
                id: "5f81101ea85d4822302026a4",
                distance: 9790
            };
            jest.spyOn(ordersService, 'placeOrder').mockImplementation(() => Promise.resolve(newOrder));

            expect(
                await ordersController.placeOrder(["40.66", "-73.89"], ["40.66", "-73.99"])
            ).toMatchObject({
                status: "UNASSIGNED",
                id: "5f81101ea85d4822302026a4",
                distance: 9790
            });
        });
    });
});