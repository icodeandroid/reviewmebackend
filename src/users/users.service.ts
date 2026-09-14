import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: { email: string; password: string; fullName: string; phone?: string; role?: UserRole }): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({ email: dto.email, passwordHash, fullName: dto.fullName, phone: dto.phone, role: dto.role || UserRole.CUSTOMER });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async touchLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async setRefreshToken(id: string, token: string | null): Promise<void> {
    const refreshTokenHash = token ? await bcrypt.hash(token, 10) : undefined;
    await this.userRepository.update(id, { refreshTokenHash } as any);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new ConflictException('Current password is incorrect');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { passwordHash });
  }
}