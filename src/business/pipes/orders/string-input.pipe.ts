import {
    Injectable,
    PipeTransform,
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common'

@Injectable()
export class StringInputValidationPipe implements PipeTransform {
    async transform(input: any, metaData: ArgumentMetadata) {

        if (!input) {
            throw new BadRequestException(`${metaData.data} is a mandatory field in the request ${metaData.type}`);
        }
        if (typeof input !== 'string') {
            throw new BadRequestException(`${metaData.data} in the request ${metaData.type} should be string`);
        }

        return input;
    }
}