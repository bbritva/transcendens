import { ApiProperty, PartialType } from '@nestjs/swagger';
import { eStatus } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @ApiProperty({ required: false })
    name: string;
  
    @ApiProperty({ required: false })
    image?: string;
  
    @ApiProperty({ required: false })
    status?: eStatus;
  
    @ApiProperty({ required: false })
    tokenId?: number;
  
    @ApiProperty({ required: false })
    refreshToken?: string;
  
}
