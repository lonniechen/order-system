import {
    ArgumentMetadata,
    BadRequestException
} from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { CoordinateValidationPipe } from './coordinate.pipe'

describe('CoordinateValidationPipe', () => {

    let coordinanteValidationPipe: CoordinateValidationPipe;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                CoordinateValidationPipe
            ]
        }).compile();

        coordinanteValidationPipe = moduleRef.get<CoordinateValidationPipe>(CoordinateValidationPipe);
    });

    describe('transform', () => {

        const metaDataOrigin: ArgumentMetadata = {
            data: 'origin',
            type: null
        }
        const generateBadRequestException = (exceptionType: string) => {
            switch (exceptionType) {
                case 'missing-coordinate-value':
                    return new BadRequestException(`${metaDataOrigin.data} is a mandatory field in the request body`);
                case 'not-string-array-of-2':
                    return new BadRequestException(`${metaDataOrigin.data} should be an array of 2 string elements in the request body`);
                case 'invalid-latlong':
                    return new BadRequestException(`invalid latitude or longtitude for ${metaDataOrigin.data} in the request body`);
                default: return new BadRequestException()
            }
        }

        it('should return coordinate if the input is valid', async () => {
            const coordinate = ['40.66', "-74.89"]
            expect(
                await coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).toStrictEqual(coordinate)
        });

        it('should throw exception for null coordinate', async () => {
            const coordinate = null
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('missing-coordinate-value')
            );
        });

        it('should throw exception for undefined coordinate', async () => {
            const coordinate = undefined
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('missing-coordinate-value')
            );
        });

        it('should throw exception for non-array coordinate', async () => {
            const coordinate = 123
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('not-string-array-of-2')
            );
        });

        it('should throw exception for empty coordinate', async () => {
            const coordinate = []
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('not-string-array-of-2')
            );
        });

        it('should throw exception for coordinate of length equals to 3', async () => {
            const coordinate = ['40.66', '-73.89', "10.22"]
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('not-string-array-of-2')
            );
        });

        it('should throw exception for coordinate with non-string element', async () => {
            const coordinate = ['40.66', -73.89]
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('not-string-array-of-2')
            );
        });

        it('should throw exception for coordinate of alphabetical latlong', async () => {
            const coordinate = ["aaaa", '-73.89']
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('invalid-latlong')
            );
        });

        it('should throw exception for coordinate of alphabetical latlong', async () => {
            const coordinate = ["999", '-73.89']
            expect(
                coordinanteValidationPipe.transform(coordinate, metaDataOrigin)
            ).rejects.toThrow(
                generateBadRequestException('invalid-latlong')
            );
        });
    });
});