import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe()); // Enable global validation pipe
	app.useGlobalInterceptors(new LoggingInterceptor()); // Enable global logging interceptor
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
