import {
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { PageLimitValidationPipe } from './page-limit.pipe'

describe('PageLimitValidationPiple', () => {

    let pageLimitValidationPipe: PageLimitValidationPipe;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                PageLimitValidationPipe
            ]
        }).compile();

        pageLimitValidationPipe = moduleRef.get<PageLimitValidationPipe>(PageLimitValidationPipe);
    });

    describe('transform', () => {
        const metaDataPage: ArgumentMetadata = {
            data: 'page',
            type: 'body'
        }
        const generateBadRequestException = (exceptionType: string) => {
            switch (exceptionType) {
                case 'missing-page-limit-value':
                    return new BadRequestException(`${metaDataPage.data} is a mandatory query parameter in the request`);
                case 'not-string-type-query-parameter':
                    return new BadRequestException(`${metaDataPage.data} should be string as a query parameter in the request`);
                case 'unable-to-convert-to-positive-integer':
                    return new BadRequestException(`${metaDataPage.data} should be a positive integer (and without leading zero) in the request`);
                default: return new BadRequestException()
            }
        }

        it('should throw exception for null page or limit', async () => {
            const queryParam = null
            expect(
                pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).rejects.toThrow(
                generateBadRequestException('missing-page-limit-value')
            );
        });

        it('should throw exception for undefined page or limit', async () => {
            const queryParam = undefined
            expect(
                pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).rejects.toThrow(
                generateBadRequestException('missing-page-limit-value')
            );
        });

        it('should throw exception for non integer', async () => {
            const queryParam = '2.5'
            expect(
                pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).rejects.toThrow(
                generateBadRequestException('unable-to-convert-to-positive-integer')
            );
        });

        it('should throw exception for negative integer', async () => {
            const queryParam = '-1'
            expect(
                pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).rejects.toThrow(
                generateBadRequestException('unable-to-convert-to-positive-integer')
            );
        });

        it('should throw exception for zero', async () => {
            const queryParam = '0'
            expect(
                pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).rejects.toThrow(
                generateBadRequestException('unable-to-convert-to-positive-integer')
            );
        });

        it('should throw exception for leading zero', async () => {
            const queryParam = '09'
            expect(
                pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).rejects.toThrow(
                generateBadRequestException('unable-to-convert-to-positive-integer')
            );
        });

        it('should return integer if the input is valid', async () => {
            const queryParam = '1'
            expect(
                await pageLimitValidationPipe.transform(queryParam, metaDataPage)
            ).toEqual(parseInt(queryParam))
        });
    });
});