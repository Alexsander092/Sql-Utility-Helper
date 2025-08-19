import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';

async function bootstrap() {
  process.env.TNS_ADMIN = path.join(__dirname, '..', 'config', 'oracle');
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = parseInt(process.env.PORT || '', 10) || 3002;
  await app.listen(port);
}
bootstrap();
