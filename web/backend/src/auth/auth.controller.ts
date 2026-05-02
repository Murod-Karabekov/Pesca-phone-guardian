import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/login.dto';

@Controller('admin')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  login(@Body() dto: AdminLoginDto) {
    return this.auth.login(dto);
  }
}
