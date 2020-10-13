import { Test } from '@nestjs/testing'

import { AppController } from './app.controller'

describe('AppController', () => {

    let appController: AppController;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AppController],
        }).compile();

        appController = moduleRef.get<AppController>(AppController);
    });

    describe('test', () => {
        it('should return hello world', async () => {
            const response = await appController.test()
            expect(response).toBe('hello world');
        });
    });
});