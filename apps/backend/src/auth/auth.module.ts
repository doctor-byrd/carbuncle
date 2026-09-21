import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthOptions } from '../common/general';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // Auth setup
    JwtModule.register({
      secret: AuthOptions.JWT_SECRET,
      signOptions: {
        expiresIn: AuthOptions.ACCESS_TOKEN_EXPIRY,
      }
    }),
    // Application modules
    UsersModule
  ],
  exports: [AuthService],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}