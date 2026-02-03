import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TermsType } from '../../../vo/consts/enums';
import { TermDto } from './dtos/term.dto';

@Injectable()
export class TermsService {
  private readonly LEGAL_FILES_PATH = join(process.cwd(), 'src', 'core', 'resources', 'legal');
  private readonly cache = new Map<TermsType, TermDto>();
  private readonly logger = new Logger(TermsService.name);

  private readonly FILE_MAPPING = {
    [TermsType.PRIVACY_POLICY]: {
      filename: 'privacy-policy.md',
      title: 'Política de Privacidade'
    },
    [TermsType.TERMS_OF_SERVICE]: {
      filename: 'terms-of-service.md',
      title: 'Termos de Uso'
    }
  };

  public async getTerms(termType: TermsType): Promise<TermDto> {
    if (this.cache.has(termType)) {
      return this.cache.get(termType);
    }

    const mapping = this.FILE_MAPPING[termType];
    if (!mapping) {
      throw new NotFoundException(`Tipo de termo não encontrado: ${termType}`);
    }

    try {
      const filePath = join(this.LEGAL_FILES_PATH, mapping.filename);
      const content = await readFile(filePath, 'utf-8');
      
      const termDto = new TermDto(mapping.title, content);
      
      this.cache.set(termType, termDto);
      
      return termDto;
    } catch (error) {
      this.logger.error(`Erro ao carregar arquivo de termos ${mapping.filename}:`, error);
      throw new InternalServerErrorException(`Erro ao carregar arquivo de termos: ${mapping.filename}`);
    }
  }

  public async getAllTerms(): Promise<Record<TermsType, TermDto>> {
    const result = {} as Record<TermsType, TermDto>;
    
    for (const termType of Object.values(TermsType)) {
      result[termType] = await this.getTerms(termType);
    }
    
    return result;
  }
}