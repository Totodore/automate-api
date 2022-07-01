import { BotService } from './bot.service';
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Message } from 'src/database/message.entity';
import { Not, IsNull } from "typeorm";
import { Guild } from 'src/database/guild.entity';
import { User } from 'src/database/user.entity';
import { AppLogger } from 'src/utils/app-logger.util';

@Injectable()
export class StatsService implements OnModuleInit {

  constructor(
    private readonly bot: BotService,
    private readonly logger: AppLogger,
  ) { }
  public async onModuleInit() {
    // send stats each week
    try {
      await this.bot.sendAdminChannelMessage("Redémarrage du bot...");
      await this.sendStats();
      setInterval(() => new Date().getDay() == 0 && new Date().getHours() == 0 && this.sendStats(), 3600_000);
    } catch (e) {
      this.logger.error("Error while sending logs : " + e);
    }
  }

  public async sendStats() {
    this.logger.log("Sending stats...");
    try {
      const cronMsgCount = await Message.count({ where: { cron: Not(IsNull()) } });
      const dateMsgCount = await Message.count({ where: { date: Not(IsNull()) } });
      const guild = await Guild.count({ where: { deletedDate: IsNull() } });
      const users = await User.count();
      await this.bot.sendAdminChannelMessage(`📊 Stats :\n\n
      - ${cronMsgCount} cron messages\n
      - ${dateMsgCount} date messages\n
      - ${guild} guilds\n
      - ${users} users\n
      `);
    } catch (e) {
      this.logger.error("Error while sending stats : " + e);
    }
  }

}