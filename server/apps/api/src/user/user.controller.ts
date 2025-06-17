import { AuthService } from '@app/core/auth/auth.service';
import {
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '@app/core/user/user.exception';
import { UserService } from '@app/core/user/user.service';
import {
  Body,
  ConflictException,
  Controller,
  Injectable,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserRequestDto } from './req/user-register.req';
import { RegisterUserResponseDto } from './res/user-register.res';

@ApiTags('User')
@Controller('/api/v1/user')
@Injectable()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  @ApiOperation({
    summary: '사용자 회원가입',
    description: '새로운 사용자를 등록한다.',
  })
  @ApiBody({ type: RegisterUserRequestDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: RegisterUserResponseDto,
  })
  @ApiResponse({ status: 409, description: '이미 존재하는 사용자' })
  async registerUser(
    @Res() res: Response,
    @Body() registerUserDto: RegisterUserRequestDto,
  ): Promise<void> {
    try {
      const user = await this.userService.signUp(registerUserDto);
      const { accessToken, refreshToken } =
        this.authService.generateAuthTokens(user);

      res.cookie('refreshToken', refreshToken.value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      res.header('Authorization', `Bearer ${accessToken.value}`);

      res.json({
        id: user.id,
        name: user.name,
        accessToken,
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post('/login')
  @ApiOperation({
    summary: '사용자 로그인',
    description: '사용자를 인증하고 액세스 토큰을 발급한다.',
  })
  @ApiBody({ type: RegisterUserRequestDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: RegisterUserResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async loginUser(
    @Res() res: Response,
    @Body() loginUserDto: RegisterUserRequestDto,
  ): Promise<void> {
    try {
      const user = await this.userService.authenticateUser(loginUserDto);
      const { accessToken, refreshToken } =
        this.authService.generateAuthTokens(user);

      res.cookie('refreshToken', refreshToken.value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      res.header('Authorization', `Bearer ${accessToken.value}`);

      res.json({
        id: user.id,
        name: user.name,
        accessToken,
      });
    } catch (error) {
      if (
        error instanceof UserNotFoundError ||
        error instanceof InvalidPasswordError
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
