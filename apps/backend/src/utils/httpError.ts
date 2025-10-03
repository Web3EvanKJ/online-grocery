/**
 * @class HttpError
 * @description Kelas dasar (Base Class) untuk semua custom error HTTP.
 * Tujuannya adalah untuk membawa HTTP status code (4xx, 5xx) dan nama error
 * dari Service Layer ke Global Error Handler.
 * @property {number} status - Status HTTP (misalnya 404, 401).
 * @property {string} name - Nama unik dari error class (misalnya 'NotFoundError').
 */
export class HttpError extends Error {
  public status: number;
  public name: string;

  constructor(status: number, message: string, name: string = 'HttpError') {
    super(message);
    this.status = status;
    this.name = name;
    // Penting untuk mempertahankan stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @class BadRequestError
 * @description Error 400 Bad Request. Digunakan untuk kegagalan validasi input atau request yang salah format.
 */
export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request') {
    super(400, message, 'BadRequestError');
  }
}

/**
 * @class UnauthorizedError
 * @description Error 401 Unauthorized. Digunakan ketika user tidak terotentikasi (misalnya token hilang/tidak valid).
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UnauthorizedError');
  }
}

/**
 * @class NotFoundError
 * @description Error 404 Not Found. Digunakan ketika resource yang dicari tidak ditemukan (misalnya user ID tidak ada).
 */
export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found') {
    super(404, message, 'NotFoundError');
  }
}

/**
 * @class ConflictError
 * @description Error 409 Conflict. Digunakan ketika request akan menciptakan konflik resource (misalnya mencoba registrasi email yang sudah terdaftar).
 */
export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict') {
    super(409, message, 'Conflict Error');
  }
}
