// backend/src/modules/sql/sql.service.ts
import { Injectable } from '@nestjs/common';
import * as oracledb from 'oracledb';
import * as crypto from 'crypto';

@Injectable()
export class SqlService {
  private encryptionKey = '1924djfuw912jdj9'; // mesma chave do legado

  async executeEncryptedSqlFile(user: string, password: string, tnsAlias: string, fileBuffer: Buffer): Promise<{ rows: any[], columns: string[] }> {
    // Descriptografar arquivo
    const sqlContent = this.decryptFile(fileBuffer);

    let conn;
    try {
      // Outras opções: oracledb.initOracleClient({ libDir: 'path/to/instantclient' }) se necessário
      conn = await oracledb.getConnection({ user, password, connectString: tnsAlias });
      // Se quiser resultados como arrays:
      oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

      if (sqlContent.match(/BEGIN/i) && sqlContent.match(/END;/i)) {
        await conn.execute(sqlContent);
        return { rows: [], columns: [] };
      } else {
        const result = await conn.execute(sqlContent);
        const columns = result.metaData ? result.metaData.map(m => m.name) : [];
        return { rows: result.rows || [], columns };
      }

    } catch (err: any) {
      throw new Error('Erro ao executar a query: ' + err.message);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  generateCsv(data: any[], columns: string[]): string {
    let csv = columns.join(',') + '\n';
    data.forEach(row => {
      // row é array de valores
      csv += row.map(val => `"${val}"`).join(',') + '\n';
    });
    return csv;
  }

  private decryptFile(fileBuffer: Buffer): string {
    const keyBytes = Buffer.from(this.encryptionKey, 'utf8');
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-128-cbc', keyBytes, iv);
    let decrypted = decipher.update(fileBuffer, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async encryptSqlFile(fileBuffer: Buffer): Promise<Buffer> {
    const keyBytes = Buffer.from(this.encryptionKey, 'utf8');
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv('aes-128-cbc', keyBytes, iv);
  
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    return encrypted;
  }
}
