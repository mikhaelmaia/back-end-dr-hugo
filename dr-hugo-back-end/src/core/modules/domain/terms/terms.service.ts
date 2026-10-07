import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TermsType, UserRole } from '../../../vo/consts/enums';
import { TermDto } from './dtos/term.dto';

@Injectable()
export class TermsService {
  private readonly LEGAL_FILES_PATH = join(
    process.cwd(),
    'src',
    'core',
    'resources',
    'legal',
  );
  private readonly cache = new Map<string, TermDto>();
  private readonly logger = new Logger(TermsService.name);

  private readonly FILE_MAPPING = {
    [TermsType.PRIVACY_POLICY]: {
      filename: 'privacy-policy.md',
      title: 'Política de Privacidade',
    },
    [TermsType.TERMS_OF_SERVICE]: {
      filename: 'terms-of-service.md',
      title: 'Termos de Uso',
    },
  };

  public async getTerms(
    termType: TermsType,
    userRole?: UserRole,
  ): Promise<TermDto> {
    const cacheKey = this.buildCacheKey(termType, userRole);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const mapping = this.FILE_MAPPING[termType];
    if (!mapping) {
      throw new NotFoundException(`Tipo de termo não encontrado: ${termType}`);
    }

    try {
      const filename = await this.buildFilename(mapping.filename, userRole);
      const filePath = join(this.LEGAL_FILES_PATH, filename);
      const content = await readFile(filePath, 'utf-8');

      const termDto = new TermDto(mapping.title, content);

      this.cache.set(cacheKey, termDto);

      return termDto;
    } catch (error) {
      this.logger.error(
        `Erro ao carregar arquivo de termos ${mapping.filename}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Erro ao carregar arquivo de termos: ${mapping.filename}`,
      );
    }
  }

  public async getAllTerms(
    userRole?: UserRole,
  ): Promise<Record<TermsType, TermDto>> {
    const result = {} as Record<TermsType, TermDto>;

    for (const termType of Object.values(TermsType)) {
      result[termType] = await this.getTerms(termType, userRole);
    }

    return result;
  }

  private buildCacheKey(termType: TermsType, userRole?: UserRole): string {
    return userRole ? `${termType}-${userRole}` : termType;
  }

  private async buildFilename(
    baseFilename: string,
    userRole?: UserRole,
  ): Promise<string> {
    if (!userRole) {
      return baseFilename;
    }

    // Tenta arquivo específico para a role (ex: privacy-policy-patient.md)
    const roleSpecificFilename = baseFilename.replace(
      '.md',
      `-${userRole.toLowerCase()}.md`,
    );
    const roleSpecificFilePath = join(
      this.LEGAL_FILES_PATH,
      roleSpecificFilename,
    );

    try {
      await readFile(roleSpecificFilePath, 'utf-8');
      return roleSpecificFilename; // Arquivo específico existe
    } catch {
      this.logger.debug(
        `Arquivo específico ${roleSpecificFilename} não encontrado, usando arquivo genérico ${baseFilename}`,
      );
      return baseFilename; // Fallback para arquivo genérico
    }
  }
}
