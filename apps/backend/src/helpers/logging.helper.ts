import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

let hitCounter = 0;

export const apiRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    hitCounter++;

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    });

    const url = req.originalUrl;

    const method = req.method;
    const statusCode = res.statusCode;
    const status =
      statusCode >= 200 && statusCode < 400 ? 'success' : 'failure';
    const duration = Date.now() - start;

    const logMessage = `[${timestamp} | ${method} ${url} | Status: ${status} ${statusCode} | Hit: ${hitCounter} | ${duration}ms]\n`;

    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    const today = new Date().toISOString().slice(0, 10);
    const logFile = path.join(logDir, `${today}.log`);

    fs.appendFileSync(logFile, logMessage);

    console.info(logMessage.trim());
  });

  next();
};
