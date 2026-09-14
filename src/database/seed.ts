import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { Business } from '../businesses/entities/business.entity';
import { AiStatus, ReviewStatus, ReviewType, UserRole, WidgetLayout } from '../common/enums';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { randomBytes } from 'crypto';

const logger = new Logger('Seed');

const SAMPLE_REVIEWS: Array<{
  customerName: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  daysAgo: number;
}> = [
  { customerName: 'Ayesha Khan', rating: 5, daysAgo: 2, status: ReviewStatus.APPROVED, content: 'Absolutely excellent service! The staff were very friendly and professional, and the food was delicious. Highly recommend this place.' },
  { customerName: 'Bilal Ahmed', rating: 4, daysAgo: 5, status: ReviewStatus.APPROVED, content: 'Good experience overall. The order was quick and the place was clean, although it was a bit crowded during lunch hours.' },
  { customerName: 'Sana Malik', rating: 2, daysAgo: 7, status: ReviewStatus.APPROVED, content: 'Very disappointed. The service was extremely slow and the staff seemed rude when I asked for help. The food arrived cold.' },
  { customerName: 'Hamza Raza', rating: 3, daysAgo: 9, status: ReviewStatus.APPROVED, content: 'It was okay. Nothing special but nothing terrible either. The prices are a bit expensive for what you get.' },
  { customerName: 'Zainab Fatima', rating: 5, daysAgo: 12, status: ReviewStatus.APPROVED, content: 'Amazing! The team was incredibly helpful and responsive. I really appreciate how quickly they resolved my problem.' },
  { customerName: 'Usman Tariq', rating: 1, daysAgo: 15, status: ReviewStatus.PENDING, content: 'Terrible experience. Completely useless support, my order was wrong and nobody bothered to fix the mistake. Avoid this place.' },
  { customerName: 'Maryam Siddiqui', rating: 4, daysAgo: 18, status: ReviewStatus.PENDING, content: 'Really nice atmosphere and comfortable seating. The staff were polite and attentive, would visit again.' },
  { customerName: 'Ali Hassan', rating: 5, daysAgo: 24, status: ReviewStatus.APPROVED, content: 'Best service I have received in a long time. Fast, affordable and truly professional. Thank you!' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const dataSource = app.get(DataSource);
  const config = app.get(ConfigService);

  const userRepo = dataSource.getRepository(User);
  const businessRepo = dataSource.getRepository(Business);
  const reviewRepo = dataSource.getRepository(Review);
  const widgetRepo = dataSource.getRepository(Widget);

  const hash = (plain: string) => bcrypt.hash(plain, 10);

  // users
  const adminEmail = config.get<string>('seed.adminEmail', 'admin@reviewsys.com');
  const adminPassword = config.get<string>('seed.adminPassword', 'Admin@123');

  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const newAdmin: User = userRepo.create({
      email: adminEmail,
      passwordHash: await hash(adminPassword),
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
    });
    admin = await userRepo.save(newAdmin);
    logger.log(`Created admin ${adminEmail} / ${adminPassword}`);
  } else {
    logger.log('Admin already exists, skipping');
  }

  const ensureUser = async (email: string, fullName: string, role: UserRole, password = 'Password@123') => {
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) return existing;
    const newUser: User = userRepo.create({ email, passwordHash: await hash(password), fullName, role });
    const user = await userRepo.save(newUser);
    logger.log(`Created ${role} ${email} / ${password}`);
    return user;
  };

  const owner = await ensureUser('owner@greencafe.com', 'Imran Sheikh', UserRole.BUSINESS);
  const owner2 = await ensureUser('owner@techfix.com', 'Nadia Aslam', UserRole.BUSINESS);
  const customer = await ensureUser('customer@example.com', 'Ahmed Raza', UserRole.CUSTOMER);

  // businesses
  const ensureBusiness = async (name: string, slug: string, ownerId: string, category: string, description: string) => {
    const existing = await businessRepo.findOne({ where: { slug } });
    if (existing) return existing;
    const newBusiness: Business = businessRepo.create({
      name, slug, ownerId, category, description,
      contactEmail: `contact@${slug}.com`,
      moderationEnabled: true,
    });
    const business = await businessRepo.save(newBusiness);
    logger.log(`Created business "${name}"`);
    return business;
  };

  const cafe = await ensureBusiness('Green Cafe', 'green-cafe', owner.id, 'Restaurant', 'A cosy neighbourhood cafe serving fresh coffee and homemade food.');
  const techfix = await ensureBusiness('TechFix Solutions', 'techfix-solutions', owner2.id, 'Electronics Repair', 'Laptop and mobile repair specialists with same-day service.');

  // reviews
  const existingCount = await reviewRepo.count({ where: { businessId: cafe.id } });

  if (existingCount > 0) {
    logger.log('Reviews already seeded, skipping');
  } else {
    const created: Review[] = [];

    for (const [index, sample] of SAMPLE_REVIEWS.entries()) {
      const createdAt = new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000);
      const newReview: Review = reviewRepo.create({
        businessId: index % 3 === 2 ? techfix.id : cafe.id,
        customerId: index === 0 ? customer.id : undefined,
        customerName: sample.customerName,
        customerEmail: `${sample.customerName.split(' ')[0].toLowerCase()}@example.com`,
        rating: sample.rating,
        type: ReviewType.TEXT,
        content: sample.content,
        status: sample.status,
        aiStatus: AiStatus.PENDING,
        createdAt,
      });
      const review = await reviewRepo.save(newReview);
      await reviewRepo.update(review.id, { createdAt });
      created.push(review);
    }

    logger.log(`Created ${created.length} reviews`);
  }

  // widgets
  const existingWidget = await widgetRepo.findOne({ where: { businessId: cafe.id } });
  if (!existingWidget) {
    const newWidget: Widget = widgetRepo.create({
      businessId: cafe.id,
      name: 'Green Cafe homepage widget',
      publicKey: `wgt_${randomBytes(16).toString('hex')}`,
      layout: WidgetLayout.GRID,
      minRating: 3,
      maxReviews: 6,
    });
    await widgetRepo.save(newWidget);
    logger.log('Created widget');
  }

  logger.log('Seeding complete!');
  logger.log(`Admin: ${adminEmail} / ${adminPassword}`);
  logger.log('Business: owner@greencafe.com / Password@123');
  logger.log('Customer: customer@example.com / Password@123');

  await app.close();
  process.exit(0);
}

bootstrap().catch((error: any) => {
  logger.error(`Seeding failed: ${error.message}`, error.stack);
  process.exit(1);
});