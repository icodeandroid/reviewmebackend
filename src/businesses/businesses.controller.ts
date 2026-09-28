import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

const uploadOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req: any, file: any, cb: any) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
};

type UploadedFile = { filename: string };

type BusinessFiles = {
  logoFile?: UploadedFile[];
  bannerFile?: UploadedFile[];
};

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logoFile', maxCount: 1 },
        { name: 'bannerFile', maxCount: 1 },
      ],
      uploadOptions,
    ),
  )
  create(
    @Body() dto: CreateBusinessDto,
    @UploadedFiles() files: BusinessFiles,
    @CurrentUser() user: any,
  ) {
    const logo = files?.logoFile?.[0];
    const banner = files?.bannerFile?.[0];
    return this.businessesService.create(
      {
        ...dto,
        logoUrl: logo ? `/uploads/${logo.filename}` : undefined,
        bannerUrl: banner ? `/uploads/${banner.filename}` : undefined,
      },
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  getPrivateProfile(@CurrentUser() user: any) {
    return this.businessesService.findByOwner(user.id);
  }

  @Public()
  @Get('public/:slug')
  getPublicProfile(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  updateSettings(@Body() dto: UpdateBusinessDto, @CurrentUser() user: any) {
    return this.businessesService.updateSettings(user.id, dto);
  }
}