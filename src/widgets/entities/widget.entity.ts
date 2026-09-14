import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WidgetLayout, WidgetTheme } from '../../common/enums';
import { Business } from '../../businesses/entities/business.entity';

@Entity('widgets')
export class Widget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @ManyToOne(() => Business, (business) => business.widgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  /** Public, non-guessable key used in the embed snippet. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  publicKey!: string;

  @Column({ type: 'varchar', length: 20, default: WidgetTheme.LIGHT })
  theme!: WidgetTheme;

  @Column({ type: 'varchar', length: 20, default: WidgetLayout.LIST })
  layout!: WidgetLayout;

  @Column({ type: 'varchar', length: 20, default: '#2563eb' })
  primaryColor!: string;

  @Column({ type: 'int', default: 1 })
  minRating!: number;

  @Column({ type: 'int', default: 10 })
  maxReviews!: number;

  @Column({ type: 'boolean', default: true })
  showSentiment!: boolean;

  @Column({ type: 'boolean', default: true })
  showRating!: boolean;

  @Column({ type: 'boolean', default: true })
  showAverage!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}