import { dialog, app, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export class FileService {
  // 파일 선택 대화상자
  async selectFile(
    options: {
      title?: string;
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
      properties?: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles')[];
    } = {}
  ): Promise<string[] | null> {
    try {
      const result = await dialog.showOpenDialog({
        title: options.title || '파일 선택',
        defaultPath: options.defaultPath,
        filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
        properties: options.properties || ['openFile'],
      });

      return result.canceled ? null : result.filePaths;
    } catch (error) {
      console.error('File selection error:', error);
      throw error;
    }
  }

  // 파일 저장 대화상자
  async saveFile(
    options: {
      title?: string;
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    } = {}
  ): Promise<string | null> {
    try {
      const result = await dialog.showSaveDialog({
        title: options.title || '파일 저장',
        defaultPath: options.defaultPath,
        filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
      });

      return result.canceled ? null : result.filePath;
    } catch (error) {
      console.error('File save dialog error:', error);
      throw error;
    }
  }

  // 파일 읽기
  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, encoding);
    } catch (error) {
      console.error('File read error:', error);
      throw error;
    }
  }

  // 파일 쓰기
  async writeFile(
    filePath: string,
    data: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    try {
      // 디렉토리가 존재하지 않으면 생성
      const dir = path.dirname(filePath);
      await this.ensureDirectory(dir);

      await fs.promises.writeFile(filePath, data, encoding);
    } catch (error) {
      console.error('File write error:', error);
      throw error;
    }
  }

  // 파일 복사
  async copyFile(source: string, destination: string): Promise<void> {
    try {
      // 대상 디렉토리가 존재하지 않으면 생성
      const dir = path.dirname(destination);
      await this.ensureDirectory(dir);

      await fs.promises.copyFile(source, destination);
    } catch (error) {
      console.error('File copy error:', error);
      throw error;
    }
  }

  // 파일 삭제
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  // 파일 존재 여부 확인
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // 디렉토리 생성
  async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Directory creation error:', error);
      throw error;
    }
  }

  // 파일 정보 조회
  async getFileStats(filePath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(filePath);
    } catch {
      return null;
    }
  }

  // 파일 크기 조회 (바이트)
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.promises.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  // 앱 데이터 디렉토리 경로
  getAppDataPath(): string {
    return app.getPath('userData');
  }

  // 임시 디렉토리 경로
  getTempPath(): string {
    return app.getPath('temp');
  }

  // 문서 디렉토리 경로
  getDocumentsPath(): string {
    return app.getPath('documents');
  }

  // 다운로드 디렉토리 경로
  getDownloadsPath(): string {
    return app.getPath('downloads');
  }

  // 파일 탐색기에서 파일 보기
  async showInExplorer(filePath: string): Promise<void> {
    try {
      shell.showItemInFolder(filePath);
    } catch (error) {
      console.error('Show in explorer error:', error);
      throw error;
    }
  }

  // 외부 프로그램으로 파일 열기
  async openExternal(filePath: string): Promise<void> {
    try {
      await shell.openPath(filePath);
    } catch (error) {
      console.error('Open external error:', error);
      throw error;
    }
  }

  // CSV 파일 내보내기 헬퍼
  async exportToCSV(data: any[], filePath: string): Promise<void> {
    if (!data || data.length === 0) {
      throw new Error('내보낼 데이터가 없습니다.');
    }

    try {
      // CSV 헤더 생성
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers
            .map(header => {
              const value = row[header];
              // 값에 콤마나 따옴표가 있으면 이스케이프 처리
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value || '';
            })
            .join(',')
        ),
      ].join('\n');

      await this.writeFile(filePath, csvContent);
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  // JSON 파일 내보내기 헬퍼
  async exportToJSON(data: any, filePath: string): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      await this.writeFile(filePath, jsonContent);
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  }
}
