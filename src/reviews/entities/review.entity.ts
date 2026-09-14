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
import { AiStatus, ReviewStatus, ReviewType, SentimentLabel } from '../../common/enums';
import { Business } from '../../businesses/entities/business.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  businessId!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @Column({ type: 'uuid', nullable: true })
  customerId!: string;
  

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer!: User;

  @Column({ type: 'varchar', length: 120 })
  customerName!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  customerEmail!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'varchar', length: 20, default: ReviewType.TEXT })
  type!: ReviewType;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ type: 'text', nullable: true })
  transcript!: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: ReviewStatus.PENDING })
  status!: ReviewStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sentiment!: SentimentLabel;

  @Column({ type: 'float', nullable: true })
  sentimentScore!: number;

  @Column({ type: 'varchar', length: 20, default: AiStatus.PENDING })
  aiStatus!: AiStatus;

  @Column({ type: 'text', nullable: true })
  aiError!: string;

  @Column({ type: 'text', nullable: true })
  moderationNote!: string;

  @Column({ type: 'uuid', nullable: true })
  moderatedById!: string;

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get analysableText(): string {
    return (this.content || this.transcript || '').trim();
  }
}