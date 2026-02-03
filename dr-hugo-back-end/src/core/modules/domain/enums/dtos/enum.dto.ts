import { ApiProperty } from '@nestjs/swagger';

export class EnumDto {

    @ApiProperty({
        description: 'Valor/chave do enum',
        example: 'SP'
    })
    public value: string;

    @ApiProperty({
        description: 'Descrição/label do enum',
        example: 'São Paulo'
    })
    public description: string;

}