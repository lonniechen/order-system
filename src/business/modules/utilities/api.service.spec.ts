import { Test } from '@nestjs/testing'
import {
    HttpModule,
    HttpService,
    InternalServerErrorException
} from '@nestjs/common';
import { of } from 'rxjs';

import { ApiService } from './api.service';
import {
    HTTP_STATUS_CODE_OK,
} from '../../constants/http-status-code.constants'

describe('ApiService', () => {

    let apiService: ApiService;
    let httpService: HttpService;

    beforeAll(async () => {
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
        const origin = ['40.66', '-73.89'];
        const destination = ['40.66', '-73.99'];
        const distance = 9790;

        const errorMessage = 'unable to get proper data from distance API'

        it('should throw internal server error exception if distance value is null', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [
                        {
                            elements: [
                                {
                                    distance: {
                                        value: null
                                    },
                                    status: 'NOT_FOUND'
                                }
                            ]
                        }
                    ],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should throw internal server error exception if distance value is undefined', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [
                        {
                            elements: [
                                {
                                    distance: {},
                                    status: 'NOT_FOUND'
                                }
                            ]
                        }
                    ],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should throw internal server error exception if distance object is null', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [
                        {
                            elements: [
                                {
                                    distance: null,
                                    status: 'NOT_FOUND'
                                }
                            ]
                        }
                    ],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should throw internal server error exception if distance object is undefined', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [
                        {
                            elements: [
                                {
                                    status: 'NOT_FOUND'
                                }
                            ]
                        }
                    ],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should throw internal server error exception if elements is null', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [{
                        elements: null
                    }],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(`Cannot read property '0' of null`));
        });

        it('should throw internal server error exception if elements is undefined', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [{}],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(`Cannot read property '0' of undefined`));
        });

        it('should throw internal server error exception if rows is null', async () => {
            const distanceApiResponse = {
                data: {
                    rows: null
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(`Cannot read property '0' of null`));
        });

        it('should throw internal server error exception if rows is undefined', async () => {
            const distanceApiResponse = {
                data: {},
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(`Cannot read property '0' of undefined`));
        });

        it('should throw internal server error exception if data is null', async () => {
            const distanceApiResponse = {
                data: null,
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should throw internal server error exception if data is undefined', async () => {
            const distanceApiResponse = {
                data: undefined,
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                apiService.getDistance(origin, destination)
            ).rejects.toThrow(new InternalServerErrorException(errorMessage));
        });

        it('should return the distance for given origins and destinations', async () => {
            const distanceApiResponse = {
                data: {
                    rows: [
                        {
                            elements: [
                                {
                                    distance: {
                                        value: distance
                                    },
                                    status: 'OK'
                                }
                            ]
                        }
                    ],
                },
                status: HTTP_STATUS_CODE_OK,
                statusText: 'OK',
                headers: {},
                config: {},
            }
            jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
            expect(
                await apiService.getDistance(origin, destination)
            ).toEqual(distance);
        });
    });
});