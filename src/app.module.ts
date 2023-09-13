import { AppLogger } from './utils/app-logger.util';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from './services/file.service';
import { BotService } from './services/bot.service';
import { GuildController } from './controllers/guild.controller';
import { UserController } from './controllers/user.controller';
import { PassportModule } from '@nestjs/passport';
import { OauthService } from './services/oauth.service';
import { HttpModule } from "@nestjs/axios";
import { MessageController } from './controllers/message.controller';
import { CacheService } from './services/cache.service';
import { Guild } from './database/guild.entity';
import { Message } from './database/message.entity';
import { User } from './database/user.entity';
import { StatsService } from './services/stats.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({ ttl: 5 * 60 * 1000 }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      logging: ["error", "warn"],
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      dateStrings: false,
      entities: ["**/*.entity.js"],
      synchronize: process.env.NODE_ENV === "dev",
    }),
    TypeOrmModule.forFeature([Guild, Message, User]),
    PassportModule.register({ }),
    HttpModule
  ],
  controllers: [GuildController, UserController, MessageController],
  providers: [FileService, BotService, OauthService, CacheService, StatsService, AppLogger],
})
export class AppModule {}
