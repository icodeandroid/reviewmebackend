import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SentimentLabel } from '../../common/enums';
import { Review } from './review.entity';

@Entity('sentiment_results')
export class SentimentResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  reviewId!: string;
@OneToOne(() => Review, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'reviewId' })
review!: Review;

  @Column({
    type: 'enum',
    enum: SentimentLabel,
  })
  sentimentLabel!: SentimentLabel;

  @Column({
    type: 'float',
  })
  sentimentScore!: number;

  @Column({
    type: 'float',
  })
  confidence!: number;

  @Column('text', { array: true, default: [] })
  keywords!: string[];

  @Column()
  engine!: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  processingMs!: number;

  @CreateDateColumn()
  createdAt!: Date;
}