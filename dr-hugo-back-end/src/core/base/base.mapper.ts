export abstract class BaseMapper<TEntity, TDto> {
  abstract toDto(entity: TEntity): TDto;
  abstract toEntity(dto: Partial<TDto>): TEntity;

  toDtos(entities: TEntity[]): TDto[] {
    return entities.map(this.toDto.bind(this));
  }
}
