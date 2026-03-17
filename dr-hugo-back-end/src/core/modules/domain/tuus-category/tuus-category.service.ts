import {
  Injectable,
  BadRequestException,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { TuusCategoryRepository } from './tuus-category.repository';
import { TuusCategoryMapper } from './tuus-category.mapper';
import { TuusCategoryDto } from './dtos/tuus-category.dto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as csv from 'csv-parse/sync';
import { TuusCategory } from './entities/tuus-category.entity';
import { CACHE_SERVICE, CacheService } from '../../cache/cache.service';

type TuusExamCategory =
  | 'LABORATORIAL'
  | 'IMAGEM'
  | 'IMAGEM/LAUDO'
  | 'DIAGNÓSTICO ESPECIALIZADO'
  | 'EXAME FUNCIONAL';

@Injectable()
export class TuusCategoryService implements OnModuleInit {
  private readonly logger = new Logger(TuusCategoryService.name);
  private readonly CSV_PATH = join(
    process.cwd(),
    'src',
    'core',
    'resources',
    'tuus',
    'tuus-exams.csv',
  );

  constructor(
    private readonly repository: TuusCategoryRepository,
    private readonly mapper: TuusCategoryMapper,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService,
  ) {}

  private readonly allowedPrefixes = [
    '401', // IMAGEM/LAUDO
    '402', // IMAGEM/LAUDO
    '403', // LABORATORIAL
    '404',
    '405',
    '406',
    '407', // IMAGEM
    '408', // IMAGEM
    '409', // IMAGEM
    '410', // IMAGEM
    '411', // IMAGEM
    '413', // DIAGNÓSTICO ESPECIALIZADO
    '414', // EXAME FUNCIONAL
    '415', // IMAGEM
  ];

  public async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Iniciando importação automática de categorias TUSS...');
      await this.importFromCsvFile();
      this.logger.log('Importação de categorias TUSS concluída com sucesso.');
    } catch (error) {
      this.logger.error(
        'Erro durante importação automática de categorias TUSS:',
        error,
      );
    }
  }

  public async findDescriptionsPaged(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ descriptions: string[]; totalItems: number }> {
    return this.repository.findDescriptionsPaged(page, limit, search);
  }

  public async searchByName(
    term: string,
    category?: TuusExamCategory,
  ): Promise<TuusCategoryDto[]> {
    if (!term || term.length < 2) {
      throw new BadRequestException(
        'Informe pelo menos 2 caracteres para busca.',
      );
    }

    const entities = await this.repository.searchByName(term, category);
    return this.mapper.toDtos(entities);
  }

  public async findByDescription(
    description: string,
  ): Promise<TuusCategoryDto | null> {
    const cacheKey = `tuus_category:description:${description.toLowerCase().trim()}`;

    const cachedResult = await this.cacheService.get<TuusCategoryDto | null>(
      cacheKey,
    );
    if (cachedResult !== null) {
      return cachedResult;
    }

    const entities = await this.repository.searchByName(description);
    const exactMatch = entities.find(
      (entity) => entity.name.toLowerCase() === description.toLowerCase(),
    );

    const result = exactMatch ? this.mapper.toDto(exactMatch) : null;

    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  private async importFromCsvFile(): Promise<void> {
    try {
      const buffer = await readFile(this.CSV_PATH);
      await this.importFromCsv(buffer);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.warn(`Arquivo CSV não encontrado: ${this.CSV_PATH}`);
      } else {
        throw new InternalServerErrorException(
          `Erro ao ler arquivo CSV: ${error.message}`,
        );
      }
    }
  }

  private async importFromCsv(buffer: Buffer): Promise<void> {
    const content = buffer.toString('utf-8');

    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      trim: true,
    });

    this.logger.log('Limpando categorias existentes...');
    await this.repository.clear();

    const processedCodes = new Set<string>();
    let importCount = 0;

    this.logger.log(`Processando ${records.length} registros do CSV...`);

    for (const row of records) {
      const tussCode: string = row['Código do Termo (Tab 22 - TUSS)'];
      const descricaoOriginal: string = row['Termo (Tab 22 - TUSS)'];

      if (!tussCode || !descricaoOriginal) continue;

      if (!this.isAllowedPrefix(tussCode)) continue;

      if (processedCodes.has(tussCode)) {
        this.logger.warn(`Código TUSS duplicado ignorado: ${tussCode}`);
        continue;
      }

      const category = this.classify(tussCode);
      if (!category) continue;

      const cleanName = this.cleanName(descricaoOriginal);

      await this.trySaveCategory(tussCode, cleanName, category);

      processedCodes.add(tussCode);
      importCount++;
    }

    this.logger.log(
      `Importação concluída: ${importCount} categorias processadas.`,
    );
  }

  private async trySaveCategory(
    tussCode: string,
    name: string,
    category: TuusExamCategory,
  ): Promise<void> {
    const tuusCategory = new TuusCategory();

    tuusCategory.tussCode = tussCode;
    tuusCategory.name = name;
    tuusCategory.category = category;

    try {
      await this.repository.save(tuusCategory);
    } catch (error) {
      this.logger.error(`Erro ao salvar categoria ${tussCode}:`, error);
    }
  }

  private isAllowedPrefix(tussCode: string): boolean {
    return this.allowedPrefixes.some((prefix) => tussCode.startsWith(prefix));
  }

  private classify(tussCode: string): TuusExamCategory | null {
    if (tussCode.startsWith('403')) {
      return 'LABORATORIAL';
    }

    if (tussCode.startsWith('401') || tussCode.startsWith('402')) {
      return 'IMAGEM/LAUDO';
    }

    if (
      tussCode.startsWith('407') ||
      tussCode.startsWith('408') ||
      tussCode.startsWith('409') ||
      tussCode.startsWith('410') ||
      tussCode.startsWith('411') ||
      tussCode.startsWith('415')
    ) {
      return 'IMAGEM';
    }

    if (tussCode.startsWith('413')) {
      return 'DIAGNÓSTICO ESPECIALIZADO';
    }

    if (tussCode.startsWith('414')) {
      return 'EXAME FUNCIONAL';
    }

    return null;
  }

  private cleanName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/(^|\s)\w/g, (match) => match.toUpperCase());
  }
}
