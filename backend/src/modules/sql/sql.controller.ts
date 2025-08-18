// backend/src/modules/sql/sql.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SqlService } from './sql.service';
import { Response } from 'express';

@Controller('sql')
export class SqlController {
  constructor(private readonly sqlService: SqlService) {}

  @Post('execute')
  @UseInterceptors(FileInterceptor('usfile'))
  async execute(
    @UploadedFile() file: Express.Multer.File,
    @Body('user') user: string,
    @Body('password') password: string,
    @Body('tnsAlias') tnsAlias: string
  ) {
    const { rows, columns } = await this.sqlService.executeEncryptedSqlFile(user, password, tnsAlias, file.buffer);
    return { data: rows, columns };
  }

  @Post('download-csv')
  async downloadCsv(@Body() body: { columns: string[], data: any[] }, @Res() res: Response) {
    const csv = this.sqlService.generateCsv(body.data, body.columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="resultado.csv"');
    res.send(csv);
  }

  @Post('encrypt')
  @UseInterceptors(FileInterceptor('sqlfile'))
  async encryptFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
  const encryptedBuffer = await this.sqlService.encryptSqlFile(file.buffer);
  // Retornar como um arquivo .us
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="arquivo.us"');
  res.send(encryptedBuffer);
}

}
