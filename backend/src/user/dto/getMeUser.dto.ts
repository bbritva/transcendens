import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class GetMeUserDtoUser {
  @ApiProperty()
  @ApiHideProperty()
  id : number
}

export class GetMeUserDto {
  @ApiProperty({ type: GetMeUserDtoUser })
  @ApiHideProperty()

  user: GetMeUserDtoUser
}



