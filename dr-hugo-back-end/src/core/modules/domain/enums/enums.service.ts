import { Injectable } from '@nestjs/common';
import { EnumDto } from './dtos/enum.dto';
import { EnumType, BrazilianState, DoctorSpecializationType, MedicalInstitutionType } from '../../../vo/consts/enums';
import { enumToKeyValueArray } from '../../../utils/enum.utils';

@Injectable()
export class EnumsService {

    public getEnumValues(enumType: EnumType): EnumDto[] {
        switch (enumType) {
            case EnumType.BRAZILIAN_STATE:
                return enumToKeyValueArray(BrazilianState).map(item => ({
                    value: item.key,
                    description: item.value
                }));
            
            case EnumType.DOCTOR_SPECIALIZATION_TYPE:
                return enumToKeyValueArray(DoctorSpecializationType).map(item => ({
                    value: item.key,
                    description: item.value
                }));
            
            case EnumType.MEDICAL_INSTITUTION_TYPE:
                return enumToKeyValueArray(MedicalInstitutionType).map(item => ({
                    value: item.key,
                    description: item.value
                }));
            
            default:
                return [];
        }
    }

}