import {
    Injectable,
    HttpService,
    InternalServerErrorException
} from '@nestjs/common'

@Injectable()
export class ApiService {

    constructor(
        private readonly httpService: HttpService
    ) { }

    async getDistance(origin: Array<string>, destination: Array<string>) {
        const distanceReqConfig = {
            params: {
                origins: origin.join(','),
                destinations: destination.join(','),
                key: 'AIzaSyDZHxHsasPQ37Lo-f15C_rcQsxSE9ImcNk'
            }
        }
        try {
            const distanceRes = await this.httpService.get('https://maps.googleapis.com/maps/api/distancematrix/json', distanceReqConfig).toPromise()
            const distance = distanceRes.data?.rows[0]?.elements[0]?.distance?.value;
            if (distance === null || distance === undefined) {
                throw new InternalServerErrorException('unable to get proper data from distance API')
            }
            return distance;
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        };
    }

}