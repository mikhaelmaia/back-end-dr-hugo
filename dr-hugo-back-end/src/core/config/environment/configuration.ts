export default () => ({
  application: {
    cryptoKey: process.env.CRYPTO_KEY,
  },
  web: {
    baseUrl: process.env.DV_WEB_BASE_URL,
    loginPath: process.env.DV_WEB_LOGIN_PATH,
    forgotPasswordPath: process.env.DV_WEB_FORGOT_PASSWORD_PATH,
    emailConfirmationPath: process.env.DV_WEB_EMAIL_CONFIRMATION_PATH,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number.parseInt(process.env.REDIS_DB, 10) || 0,
  },
  minio: {
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number.parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
  },
});
