import { NestFactory } from '@nestjs/core';

import {
    NestExpressApplication
} from '@nestjs/platform-express'

import { AppModule } from './app.module';

async function bootstrap() {
    const env = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'dev'
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule.forRoot(env)
    );

    const port = parseInt(process.env.PORT) || 8080;
    await app.listen(port, '0.0.0.0');
}

bootstrap();
