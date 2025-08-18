// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { SqlModule } from './modules/sql/sql.module';

@Module({
  imports: [SqlModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
