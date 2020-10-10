import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common'

import * as Validator from 'validator'

@Injectable()
export class CoordinateValidationPipe implements PipeTransform {
    async transform(coordinate: any, metaData: ArgumentMetadata) {
        if (!coordinate) {
            throw new BadRequestException(`${metaData.data} is a mandatory field in the request body`)
        }

        if (!Array.isArray(coordinate) || coordinate.length !== 2) {
            throw new BadRequestException(`${metaData.data} should be an array of 2 string elements in the request body`)
        }

        coordinate.forEach((element: any) => {
            if (typeof element !== 'string') {
                throw new BadRequestException(`${metaData.data} should be an array of 2 string elements in the request body`)
            }
        })

        if (!Validator.isLatLong(coordinate.join(','))) {
            throw new BadRequestException(`invalid latitude or longtitude for ${metaData.data} in the request body`)
        }
        return coordinate
    }
}