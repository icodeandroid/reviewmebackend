import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../common/enums';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const role = dto.role && dto.role !== UserRole.ADMIN ? dto.role : UserRole.CUSTOMER;
    const user = await this.usersService.create({ ...dto, role });
    return this.issueSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new ForbiddenException('Account deactivated');
    await this.usersService.touchLogin(user.id);
    return this.issueSession(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret') ?? 'refreshsupersecret',
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Session expired');
    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!match) throw new UnauthorizedException('Refresh token revoked');
    return this.issueSession(user);
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    await this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
    return { message: 'Password changed. Please log in again.' };
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  private async issueSession(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const secret = this.configService.get<string>('jwt.secret') ?? 'supersecret';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') ?? 'refreshsupersecret';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ ...payload }, { secret, expiresIn: '15m' }),
      this.jwtService.signAsync({ ...payload }, { secret: refreshSecret, expiresIn: '7d' }),
    ]);

    await this.usersService.setRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, tokenType: 'Bearer', user: this.sanitize(user) };
  }

  private sanitize(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}