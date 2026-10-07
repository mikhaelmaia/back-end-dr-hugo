import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class QueryParamsTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const transformed: any = {
      page: this.parseNumber(value.page, 1),
      limit: this.parseNumber(value.limit, 10),
      sortBy: value.sortBy,
      sortOrder: value.sortOrder || 'DESC',
    };

    const filter = this.parseNestedFilters(value);
    if (Object.keys(filter).length > 0) {
      transformed.filter = filter;
    }

    return transformed;
  }

  private parseNumber(value: string | number, defaultValue: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  private parseNestedFilters(
    queryParams: Record<string, any>,
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    Object.keys(queryParams).forEach((key) => {
      if (key.startsWith('filter[')) {
        this.processFilterParam(key, queryParams[key], filter);
      }
    });

    return filter;
  }

  private processFilterParam(
    key: string,
    value: string,
    filter: Record<string, any>,
  ): void {
    const cleanKey = key.substring(7, key.length - 1);
    const parts = cleanKey.split('][');

    let current = filter;

    if (parts.length === 1) {
      current[parts[0]] = value;
      return;
    }

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }
}
