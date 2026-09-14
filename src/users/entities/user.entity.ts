import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums';
import { Business } from '../../businesses/entities/business.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.CUSTOMER })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshTokenHash!: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date;

  @OneToMany(() => Business, (business) => business.owner)
  businesses!: Business[];

  @OneToMany(() => Review, (review) => review.customer)
  reviews!: Review[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}