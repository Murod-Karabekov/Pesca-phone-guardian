import { Module } from '@nestjs/common';
import { AdminManagementController } from './admin-management.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminManagementController],
  providers: [AdminService],
})
export class AdminModule {}
