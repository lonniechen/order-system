import { Test } from '@nestjs/testing'
import { HttpModule, HttpService } from '@nestjs/common';
import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('ApiService', () => {

    let apiService: ApiService;
    let httpService: HttpService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                HttpModule,
            ],
            providers: [
                ApiService,
            ]
        }).compile();

        apiService = moduleRef.get<ApiService>(ApiService);
        httpService = moduleRef.get<HttpService>(HttpService);
    });

    describe('getDistance', () => {
        it('should return the distance for given origins and destinations', async () => {
            const distance = 9790
            const origin = ["40.66", "-73.89"];
            const destination = ["40.66", "-73.99"];
            const apiResponse = {
                data: {
                    rows: [
                        {
                            elements: [
                                {
                                    distance: {
                                        value: distance
                                    },

                                }
                            ]
                        }
                    ],
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(apiResponse));
            expect(
                await apiService.getDistance(origin, destination)
            ).toEqual(distance);
        });
    });
});