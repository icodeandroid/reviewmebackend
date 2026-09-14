import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(dto: CreateBusinessDto, ownerId: string): Promise<Business> {
    const existing = await this.businessRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already taken');

    const business = this.businessRepository.create({ ...dto, ownerId });
    return this.businessRepository.save(business) as unknown as Promise<Business>;
  }

  async findByOwner(ownerId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { ownerId },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async findBySlug(slug: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { slug },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async updateSettings(ownerId: string, dto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findByOwner(ownerId);
    Object.assign(business, dto);
    return this.businessRepository.save(business);
  }

  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.businessRepository.findOne({ where: { slug } });
    return !existing;
  }
  async findById(id: string): Promise<Business> {
  const business = await this.businessRepository.findOne({ where: { id } });
  if (!business) throw new NotFoundException('Business not found');
  return business;
}

assertOwnership(business: Business, user: any): void {
  if (business.ownerId !== user.id) {
    throw new NotFoundException('Business not found');
  }
}

async resolveAccessibleBusinessIds(user: any): Promise<string[]> {
  const businesses = await this.businessRepository.find({
    where: { ownerId: user.id },
  });
  return businesses.map(b => b.id);
}
}