import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { LoginDto } from '../domain/login.dto'
import { RegisterDto } from '../domain/register.dto'
import { ForgotPasswordDto, ResetPasswordDto, TokenDto } from '../domain/account.dto'
import { AccountService } from './account.service'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
// The @Throttle limits below only take effect when ThrottlerGuard runs.
// It is scoped to auth (not global) so teams sharing one church Wi-Fi IP
// are not rate-limited during normal app use.
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60_000 } }) // Max 3 registros/min
  @ApiOperation({ summary: 'Registrar nuevo usuario e iglesia' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 10, ttl: 60_000 } }) // Max 10 intentos/min
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token con refresh token' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión (invalida refresh token)' })
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken)
  }

  @Post('switch-church')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cambiar de iglesia activa (multi-iglesia)' })
  switchChurch(@CurrentUser('id') userId: string, @Body('churchId') churchId: string) {
    return this.authService.switchChurch(userId, churchId)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Enviar enlace para restablecer la contraseña' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accountService.requestPasswordReset(dto.email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Restablecer la contraseña con el enlace recibido' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.accountService.resetPassword(dto.token, dto.password)
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Confirmar el email con el enlace recibido' })
  verifyEmail(@Body() dto: TokenDto) {
    return this.accountService.verifyEmail(dto.token)
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 2, ttl: 60_000 } })
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Reenviar el enlace de confirmación de email' })
  resendVerification(@CurrentUser('id') userId: string) {
    return this.accountService.resendVerification(userId)
  }

  @Get('account-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Estado de la cuenta (email confirmado)' })
  accountStatus(@CurrentUser('id') userId: string) {
    return this.accountService.getStatus(userId)
  }
}
