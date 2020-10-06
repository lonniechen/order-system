import {
    Controller,
    Get
} from '@nestjs/common';

@Controller('/')
export class AppController {
    @Get('test')
    test(): string {
        return 'this is a test';
    }
}
