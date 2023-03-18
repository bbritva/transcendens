import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginUserDto {
  @ApiProperty()
  id : number
  @ApiProperty()
  name : string
  isTwoFaEnabled: boolean
}

export class AuthLoginDto {
  @ApiProperty({ type: AuthLoginUserDto })
  user: AuthLoginUserDto
}


export class AuthRefreshTokenUserDto {
  @ApiProperty()
  username : string
  @ApiProperty()
  refreshToken : string
  @ApiProperty()
  id: number 
}


export class AuthRefreshTokenDto {
  @ApiProperty({ type: AuthRefreshTokenUserDto })
  user: AuthRefreshTokenUserDto
}

