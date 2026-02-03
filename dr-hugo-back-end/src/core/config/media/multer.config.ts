import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerSingleFileConfig: MulterOptions = {
  limits: {
    fileSize: 512 * 1024 * 1024,
  },
};
