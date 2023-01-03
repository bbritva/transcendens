import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class AuthLoginUserDto {
  @ApiProperty()
  id : number
  @ApiProperty()
  name : string
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
}


export class AuthRefreshTokenDto {
  @ApiProperty({ type: AuthRefreshTokenUserDto })
  user: AuthRefreshTokenUserDto
}

