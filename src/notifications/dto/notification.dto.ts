import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationType } from '../../common/enums';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @Length(2, 160)
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class QueryNotificationDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
