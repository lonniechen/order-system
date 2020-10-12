import { NestFactory } from '@nestjs/core';

import {
    NestExpressApplication
} from '@nestjs/platform-express'

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule
    );

    const port = 8080;
    await app.listen(port, '0.0.0.0');
}

bootstrap();
