import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Widget } from '../../widgets/entities/widget.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  /** URL-friendly public identifier, e.g. "green-cafe". */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  category!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  contactEmail!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl!: string;

  /** When true, submitted reviews are published only after owner approval. */
  @Column({ type: 'boolean', default: true })
  moderationEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.businesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @OneToMany(() => Review, (review) => review.business)
  reviews!: Review[];

  @OneToMany(() => Widget, (widget) => widget.business)
  widgets!: Widget[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}