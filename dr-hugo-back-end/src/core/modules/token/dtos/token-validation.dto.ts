import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para validação de token
 * Retornado quando um token é validado com sucesso
 */
export class TokenValidationDto {
    @ApiProperty({
        description: 'Hash único do token validado, usado para operações subsequentes que requerem o token',
        example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        type: String,
        minLength: 24,
        maxLength: 50
    })
    public hash: string;
}