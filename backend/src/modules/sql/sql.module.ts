// backend/src/modules/sql/sql.module.ts
import { Module } from '@nestjs/common';
import { SqlService } from './sql.service';
import { SqlController } from './sql.controller';

@Module({
  controllers: [SqlController],
  providers: [SqlService],
  exports: [SqlService],
})
export class SqlModule {}
