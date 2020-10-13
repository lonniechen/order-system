import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common'

import * as Validator from 'validator'

@Injectable()
export class PageLimitValidationPipe implements PipeTransform {
    async transform(queryParam: any, metaData: ArgumentMetadata) {

        if (!queryParam) {
            throw new BadRequestException(`${metaData.data} is a mandatory query parameter in the request`);
        }
        if (!Validator.isInt(queryParam, {
            allow_leading_zeroes: false,
            min: 1
        })) {
            throw new BadRequestException(`${metaData.data} should be a positive integer (and without leading zero) in the request`);
        }

        return parseInt(queryParam);
    }
}