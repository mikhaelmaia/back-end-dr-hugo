import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerSingleFileConfig: MulterOptions = {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
};

export const multerMultipleFilesConfig: MulterOptions = {
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 20,
  },
};
