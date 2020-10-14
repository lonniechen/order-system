import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { of } from 'rxjs';
import * as request from 'supertest'
import { HttpService, HttpModule } from '@nestjs/common'
import { forkJoin } from 'rxjs'

import { AppModule } from './app.module'
import {
    HTTP_STATUS_CODE_OK,
    HTTP_STATUS_CODE_CREATED,
    HTTP_STATUS_CODE_BAD_REQUEST,
    HTTP_STATUS_CODE_NOT_FOUND,
    HTTP_STATUS_CODE_FORBIDDEN
} from './business/constants/http-status-code.constants'

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let httpService: HttpService;

    const origin = ['40.66', '-73.89']
    const destination = ['40.66', '-73.99']
    const distance = 9790
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
    };

    beforeAll(async () => {
        const env = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'dev'
        const moduleRef = await Test.createTestingModule({
            imports: [
                AppModule.forRoot(env),
                HttpModule
            ],
        }).compile()

        httpService = moduleRef.get<HttpService>(HttpService)
        app = moduleRef.createNestApplication()
        await app.init()

        jest.spyOn(httpService, 'get').mockImplementation(() => of(distanceApiResponse));
    })

    afterAll(async () => {
        await app.close();
    });

    describe('/ (GET)', () => {
        it('should return hello world', async (done) => {
            const response = await request(app.getHttpServer()).get('/')
            expect(response.status).toBe(HTTP_STATUS_CODE_OK)
            expect(response.text).toBe('hello world')
            done()
        })
    })

    describe('/orders (POST)', () => {
        it('should return error if one of the coordinates is missing', async (done) => {
            const requestBody = {
                origin: origin
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', 'destination is a mandatory field in the request body')
            done()
        })

        it('should return error if one of the coordinates is null', async (done) => {
            const requestBody = {
                origin: null,
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', 'origin is a mandatory field in the request body')
            done()
        })

        it('should return error if one of the coordinates is undefined', async (done) => {
            const requestBody = {
                origin: undefined,
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', 'origin is a mandatory field in the request body')
            done()
        })

        it('should return error if one of the coordinates is not array', async (done) => {
            const requestBody = {
                origin: 123,
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `origin should be an array of 2 string elements in the request body`)
            done()
        })

        it('should return error if one of the coordinates is not an array with length equals to 2', async (done) => {
            const requestBody = {
                origin: ['40.66', '-73.89', '111'],
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `origin should be an array of 2 string elements in the request body`)
            done()
        })

        it('should return error if one of the coordinates contains non-string element', async (done) => {
            const requestBody = {
                origin: ['40.66', -73.89],
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `origin should be an array of 2 string elements in the request body`)
            done()
        })

        it('should return error if one of the coordinates is invalid latitude', async (done) => {
            const requestBody = {
                origin: ['aaa', '-73.89'],
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `invalid latitude or longtitude for origin in the request body`)
            done()
        })

        it('should return error one of the coordinates is invalid longtitude', async (done) => {
            const requestBody = {
                origin: ['40.66', '-973.89'],
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `invalid latitude or longtitude for origin in the request body`)
            done()
        })

        it('should return id, status, distance for a valid request', async (done) => {
            const requestBody = {
                origin: origin,
                destination: destination
            }
            const response = await request(app.getHttpServer()).post('/orders').send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_CREATED)
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_OK.toString())
            expect(response.body).toHaveProperty('distance', distance)
            expect(response.body).toHaveProperty('status', 'UNASSIGNED')
            expect(response.body).toHaveProperty('id')
            done()
        })
    })

    describe('/orders/:id (PATCH)', () => {
        const orderList: any[] = []

        beforeAll(async () => {
            const requestBody = {
                origin: origin,
                destination: destination
            }
            let placeOrderRequests = [1, 2].reduce((arr: any[]) => {
                arr.push(request(app.getHttpServer()).post('/orders').send(requestBody))
                return arr
            }, [])
            const placeOrderResponses = await forkJoin(placeOrderRequests).toPromise()
            placeOrderResponses.forEach((response: any) => {
                orderList.push(response.body)
            })
        })

        it('should return error if status is missing', async (done) => {
            let id = orderList[0].id
            const requestBody = {}
            const response = await request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `status is a mandatory field in the request body`)
            done()
        })

        it('should return error if status is not a string', async (done) => {
            let id = orderList[0].id
            const requestBody = {
                status: 123
            }
            const response = await request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody)
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `status in the request body should be string`)
            done()
        })

        it('should return error if status is not "TAKEN"', async (done) => {
            let id = orderList[0].id
            const requestBody = {
                status: 'NOT TAKEN'
            }
            const response = await request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody)
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_BAD_REQUEST.toString())
            expect(response.body).toHaveProperty('error', `{status} must be 'TAKEN' in the request body`)
            done()
        })

        it('should return error if the id does not exist', async (done) => {
            let id = 'ffffffffffffffffffffff5f'
            const requestBody = {
                status: 'TAKEN'
            }
            const response = await request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody)
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_NOT_FOUND.toString())
            expect(response.body).toHaveProperty('error', `order (id:${id}) not found`)
            done()
        })

        it('should return success', async (done) => {
            let id = orderList[0].id
            const requestBody = {
                status: 'TAKEN'
            }
            const response = await request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody)
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_OK.toString())
            expect(response.body).toHaveProperty('status', `SUCCESS`)
            done()
        })

        it('should return error if the order with given id is already taken', async (done) => {
            let id = orderList[0].id
            const requestBody = {
                status: 'TAKEN'
            }
            const response = await request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody)
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_FORBIDDEN.toString())
            expect(response.body).toHaveProperty('error', `fail to take order (id:${id}), which had been taken already`)
            done()
        })

        it('should return 1 success and error for the rest when there are concurrent requests', async (done) => {
            let id = orderList[1].id
            const requestBody = {
                status: 'TAKEN'
            }
            const takeOrderRequests = [1, 2, 3, 4, 5].reduce((arr: any[]) => {
                arr.push(request(app.getHttpServer()).patch(`/orders/${id}`).send(requestBody))
                return arr
            }, [])
            const takeOrderResponses = await forkJoin(takeOrderRequests).toPromise()
            let successCount: number = 0;
            let errorCount: number = 0
            takeOrderResponses.forEach((response: any) => {
                if (response.body.status) {
                    successCount++
                }
                if (response.body.error) {
                    errorCount++
                }
            })
            expect(successCount).toBe(1)
            expect(errorCount).toBe(4)
            done()
        })
    })

    describe('/orders (GET)', () => {
        beforeAll(async () => {
            const requestBody = {
                origin: origin,
                destination: destination
            }
            let placeOrderRequests = [1, 2, 3, 4, 5].reduce((arr: any[]) => {
                arr.push(request(app.getHttpServer()).post('/orders').send(requestBody))
                return arr
            }, [])
            await forkJoin(placeOrderRequests).toPromise()
        })

        it('should return error if page is missing', async (done) => {
            const response = await request(app.getHttpServer()).get(`/orders?limit=1`).send()
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `page is a mandatory query parameter in the request`)
            done()
        })

        it('should return error if page is zero', async (done) => {
            const response = await request(app.getHttpServer()).get(`/orders?page=0&limit=1`).send()
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `page should be a positive integer (and without leading zero) in the request`)
            done()
        })

        it('should return error if page is negative', async (done) => {
            const response = await request(app.getHttpServer()).get(`/orders?page=-1&limit=1`).send()
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `page should be a positive integer (and without leading zero) in the request`)
            done()
        })

        it('should return error if page is with leading zero', async (done) => {
            const response = await request(app.getHttpServer()).get(`/orders?page=01&limit=1`).send()
            expect(response.status).toBe(HTTP_STATUS_CODE_BAD_REQUEST)
            expect(response.body).toHaveProperty('message', `page should be a positive integer (and without leading zero) in the request`)
            done()
        })

        it('should return an array of orders with id, distance and stauts, the length will equal to limit', async (done) => {
            const page = 1
            const limit = 2
            const response = await request(app.getHttpServer()).get(`/orders?page=${page}&limit=${limit}`).send()
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_OK.toString())
            expect(response.body.length).toBe(limit)
            response.body.forEach((element) => {
                expect(element).toHaveProperty('id')
                expect(element).toHaveProperty('distance')
                expect(element).toHaveProperty('status')
            })
            done()
        })

        it('should return an empty array if no results are valid', async (done) => {
            const page = 9999
            const limit = 9999
            const response = await request(app.getHttpServer()).get(`/orders?page=${page}&limit=${limit}`).send()
            expect(response.headers).toHaveProperty('http', HTTP_STATUS_CODE_OK.toString())
            expect(response.body).toMatchObject([])
            done()
        })
    })
})