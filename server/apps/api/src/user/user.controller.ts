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
  Get,
  Injectable,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserRequestDto } from './req/user-register.req';
import { RegisterUserResponseDto } from './res/user-register.res';
import { JwtGuard } from '../guard/jwt.guard';
import { Authentication } from '../guard/authentication.decorator';
import { UserInfo } from '@app/core/auth/auth.interface';
import { InvalidTokenException } from '@app/core/auth/auth.exception';
import { LoginUserRequestDto } from './req/user-login.req';
import { LoginUserResponseDto } from './res/user-login.res';
import { UserInfoResponseDto } from './res/user-info.res';

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
  @ApiBody({ type: LoginUserRequestDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: LoginUserResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async loginUser(
    @Res() res: Response,
    @Body() loginUserDto: LoginUserRequestDto,
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

  @Post('/refresh')
  @ApiOperation({
    summary: '리프레시 토큰으로 액세스 토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급한다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'object',
          properties: {
            value: { type: 'string', example: 'newAccessTokenValue' },
            expiresIn: { type: 'number', example: 3600 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    try {
      const refreshedTokens = this.authService.refreshToken(refreshToken);

      res.cookie('refreshToken', refreshedTokens.refreshToken.value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      res.header(
        'Authorization',
        `Bearer ${refreshedTokens.accessToken.value}`,
      );
      res.json({ accessToken: refreshedTokens.accessToken });
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  /**
   * 테스트 용 현재 사용자 정보 조회 API
   */
  @UseGuards(JwtGuard)
  @Get('/me')
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '인증된 사용자의 정보를 반환한다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: UserInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getCurrentUser(@Authentication() auth: UserInfo) {
    const { email } = auth;
    const user = await this.userService.findByEmail(email);

    if (!user) throw new ConflictException('사용자 정보를 찾을 수 없습니다.');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
