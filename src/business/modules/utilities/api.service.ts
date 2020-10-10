import {
    Injectable,
    HttpService
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
        const distanceRes = await this.httpService.get('https://maps.googleapis.com/maps/api/distancematrix/json', distanceReqConfig).toPromise()
        const distance = distanceRes.data.rows[0].elements[0].distance.value;
        return distance;
    }

}