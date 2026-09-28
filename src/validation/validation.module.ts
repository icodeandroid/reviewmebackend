import { Module } from '@nestjs/common';
import { BusinessesModule } from '../businesses/businesses.module';
import { ValidationController } from './validation.controller';

@Module({
  imports: [BusinessesModule],
  controllers: [ValidationController],
})
export class ValidationModule {}