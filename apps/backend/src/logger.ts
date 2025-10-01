import fs from 'fs';
import path from 'path';

function getLogFilePath(): string {
  const logDir = path.join(__dirname, './logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const today = new Date().toISOString().slice(0, 10);
  return path.join(logDir, `${today}.log`);
}

const originalLog = console.log;

console.log = (...args: any[]) => {
  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
  });

  const message = args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ');

  const logLine = `[${timestamp} | DEBUG] ${message}\n`;

  originalLog(logLine.trim());

  fs.appendFileSync(getLogFilePath(), logLine);
};
