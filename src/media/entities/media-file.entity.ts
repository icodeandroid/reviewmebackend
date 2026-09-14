import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
}

@Entity('media_files')
export class MediaFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  businessId!: string;

  @Column({ nullable: true })
  reviewId!: string;

  @Column()
  fileName!: string;

  @Column()
  filePath!: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type!: MediaType;

  @Column({ type: 'bigint' })
  sizeBytes!: number;

  @Column()
  mimeType!: string;

  @CreateDateColumn()
  createdAt!: Date;
}