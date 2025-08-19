// backend/src/modules/sql/sql.service.ts
import { Injectable } from '@nestjs/common';
import * as oracledb from 'oracledb';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SqlService {
  private encryptionKey = '1924djfuw912jdj9'; // mesma chave do legado
  private tnsNamesPath = path.join(process.cwd(), 'config', 'oracle', 'tnsnames.ora');

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

  decryptFileToString(fileBuffer: Buffer): string {
    return this.decryptFile(fileBuffer);
  }

  async encryptSqlFile(fileBuffer: Buffer): Promise<Buffer> {
    const keyBytes = Buffer.from(this.encryptionKey, 'utf8');
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv('aes-128-cbc', keyBytes, iv);
  
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    return encrypted;
  }
  
  async getTnsAliases(): Promise<string[]> {
    try {
      // Read the tnsnames.ora file
      const tnsContent = fs.readFileSync(this.tnsNamesPath, 'utf8');
      
      // Extract TNS aliases using regex
      const aliasRegex = /^([A-Za-z0-9_]+)\s*=/gm;
      const matches = tnsContent.match(aliasRegex) || [];
      
      // Clean up the matches to just get the alias names
      const aliases = matches.map(match => match.trim().replace('=', ''));
      
      return aliases;
    } catch (err) {
      console.error('Error reading TNS aliases:', err);
      return [];
    }
  }
  
  async testConnection(user: string, password: string, tnsAlias: string): Promise<{ success: boolean; message: string }> {
    let conn;
    try {
      conn = await oracledb.getConnection({ user, password, connectString: tnsAlias });
      await conn.execute('SELECT 1 FROM DUAL');
      return { success: true, message: 'Connection successful!' };
    } catch (err) {
      return { success: false, message: `Connection failed: ${err.message}` };
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  }

  async executeDirectSQL(user: string, password: string, tnsAlias: string, sqlText: string): Promise<{ rows: any[], columns: string[] }> {
    let conn;
    try {
      conn = await oracledb.getConnection({ user, password, connectString: tnsAlias });
      
      // Set output format to array for consistency with file execution
      oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

      // Determine if this is a PL/SQL block or regular query
      if (sqlText.match(/BEGIN/i) && sqlText.match(/END;/i)) {
        await conn.execute(sqlText);
        return { rows: [], columns: [] };
      } else {
        const result = await conn.execute(sqlText);
        const columns = result.metaData ? result.metaData.map(m => m.name) : [];
        return { rows: result.rows || [], columns };
      }
    } catch (err: any) {
      throw new Error('Error executing SQL: ' + err.message);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }
}
