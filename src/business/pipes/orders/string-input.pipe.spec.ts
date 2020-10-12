import {
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { StringInputValidationPipe } from './string-input.pipe'

describe('StringInputValidationPipe', () => {

    let stringInputValidationPipe: StringInputValidationPipe;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                StringInputValidationPipe
            ]
        }).compile();

        stringInputValidationPipe = moduleRef.get<StringInputValidationPipe>(StringInputValidationPipe);
    });

    describe('transform', () => {

        const metaDataStatus: ArgumentMetadata = {
            data: 'page',
            type: 'body'
        }
        const generateBadRequestException = (exceptionType: string) => {
            switch (exceptionType) {
                case 'missing-input':
                    return new BadRequestException(`${metaDataStatus.data} is a mandatory field in the request ${metaDataStatus.type}`);
                case 'not-string-type-input':
                    return new BadRequestException(`${metaDataStatus.data} in the request ${metaDataStatus.type} should be string`);
                default: return new BadRequestException()
            }
        }

        it('should throw exception for null input', async () => {
            const input = null
            expect(
                stringInputValidationPipe.transform(input, metaDataStatus)
            ).rejects.toThrow(
                generateBadRequestException('missing-input')
            );
        });

        it('should throw exception for undefined input', async () => {
            const input = undefined
            expect(
                stringInputValidationPipe.transform(input, metaDataStatus)
            ).rejects.toThrow(
                generateBadRequestException('missing-input')
            );
        });

        it('should throw exception for non-string type input', async () => {
            const input = 111
            expect(
                stringInputValidationPipe.transform(input, metaDataStatus)
            ).rejects.toThrow(
                generateBadRequestException('not-string-type-input')
            );
        });

        it('should return input if it is a string', async () => {
            const input = 'A string'
            expect(
                await stringInputValidationPipe.transform(input, metaDataStatus)
            ).toStrictEqual(input);
        });
    });
});