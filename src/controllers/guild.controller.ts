import { Profile } from 'passport-discord';
import { OauthService } from './../services/oauth.service';
import { File } from './../database/file.entity';
import { FileService } from './../services/file.service';
import { Message, MessageType } from './../database/message.entity';
import { PostFreqMessageInModel, PostPonctMessageInModel, DataMessageModel, PatchPonctMessageInModel, PatchFreqMessageInModel } from './../models/in/guild.in.model';
import { GuildOutModel, MemberOutModel } from './../models/out/guild.out.model';
import { BotService } from './../services/bot.service';
import { AppLogger } from './../utils/app-logger.util';
import { BadRequestException, Body, CacheInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Guild } from 'src/database/guild.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from "uuid";
import { UserGuard } from 'src/guards/user.guard';
import { createQueryBuilder } from 'typeorm';

@Controller('guild')
@UseGuards(UserGuard)
export class GuildController {

  constructor(
    private readonly logger: AppLogger,
    private readonly bot: BotService,
    private readonly fileService: FileService,
    private readonly oauth: OauthService
  ) { }
  
  
  @Post("last")
  public async getLastMessages(@Body() profile: Profile): Promise<Message[]> {
    const guilds = profile.guilds.filter(guild =>
      (guild.permissions & 0x8) === 8
      || (guild.permissions & 0x10) === 10
      || (guild.permissions & 0x20) === 20
    ).map(guild => guild.id);
    return Promise.all((await createQueryBuilder(Message, "msg")
      .where("msg.guildId IN (:guilds)", { guilds })
      .orderBy("msg.updatedDate", "DESC").take(10)
      .leftJoinAndSelect("msg.guild", "guild")
      .leftJoinAndSelect("msg.creator", "creator")
      .leftJoinAndSelect("msg.files", "files")
      .getMany())
      .map(async (msg: Message) => {
        msg.channelName = (await this.bot.getChannel(msg.channelId)).name;
        const creator = await this.bot.getUser(msg.creator.id);
        const guild = await this.bot.getGuild(msg.guild.id);
        msg.creator.name = creator.username;
        msg.creator.profile = creator.avatar;
        msg.guild.name = guild.name;
        msg.guild.profile = guild.icon;
        return msg;
      })
    );
  }

  @Get(":id")
  public async getOne(@Param('id') id: string): Promise<GuildOutModel> {
    const guild = await Guild.findOne(id, { relations: ["messages"] });
    const guildInfo = await this.bot.getGuild(id);

    return new GuildOutModel(guild, guildInfo);
  }
    
  @Get(":id/members")
  public async getMembers(@Query("q") query: string, @Param("id") id: string): Promise<MemberOutModel[]> {
    const members = (await (await this.bot.getGuild(id)).members.fetch({ query, limit: 50 })).array();
    return members.map(el => new MemberOutModel(el.nickname, el.displayName, el.id));
  }

  @Post(":id/freq")
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fieldSize: 8 } }))
  public async postFreqMessage(@Body() body: PostFreqMessageInModel, @UploadedFiles() files: Express.Multer.File[]) {
    const filesData: File[] = [];
    for (const file of files) {
      const id = uuid();
      this.fileService.writeFile(file.buffer, id);
      filesData.push(File.create({ id }));
    }
    await Message.create({
      ...body,
      type: MessageType.FREQUENTIAL,
      files: filesData
    }).save();
  }

  @Post(":id/ponctual")
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fieldSize: 8 } }))
  public async postPonctualMessage(@Body() body: PostPonctMessageInModel, @UploadedFiles() files: Express.Multer.File[]) {
    const filesData: File[] = [];
    for (const file of files) {
      const id = uuid();
      this.fileService.writeFile(file.buffer, id);
      filesData.push(File.create({ id }));
    }
    await Message.create({
      ...body,
      type: MessageType.PONCTUAL,
      files: filesData
    }).save();
  }

  @Delete(":id")
  public async deleteMessage(@Param("id") id: string) {
    await Message.delete(id);
  }

  @Patch(":id/content")
  public async patchContent(@Param("id") id: string, @Body() body: DataMessageModel) {
    await Message.update(id, body);
  }

  @Patch(":id/ponctual")
  public async patchCron(@Param("id") id: string, @Body() body: PatchPonctMessageInModel) {
    await Message.update(id, body);
  }

  @Patch(":id/freq")
  public async patchFreq(@Param("id") id: string, @Body() body: PatchFreqMessageInModel) {
    await Message.update(id, body);
  }

  @Patch(":id/scope")
  public async patchScope(@Query("scope") scope: 'true' | 'false', @Param("id") id: string) {
    await Guild.update(id, { scope: scope === 'true' });
  }

  @Patch(":id/timezone")
  public async patchTimezone(@Query("timezone") timezone: string, @Param("id") id: string) {
    if (!TIMEZONES.includes(timezone))
      throw new BadRequestException();
    await Guild.update(id, { timezone });
  }
}


const TIMEZONES = [
  'Europe/Andorra',
  'Asia/Dubai',
  'Asia/Kabul',
  'Europe/Tirane',
  'Asia/Yerevan',
  'Antarctica/Casey',
  'Antarctica/Davis',
  'Antarctica/DumontDUrville', // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
  'Antarctica/Mawson',
  'Antarctica/Palmer',
  'Antarctica/Rothera',
  'Antarctica/Syowa',
  'Antarctica/Troll',
  'Antarctica/Vostok',
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Cordoba',
  'America/Argentina/Salta',
  'America/Argentina/Jujuy',
  'America/Argentina/Tucuman',
  'America/Argentina/Catamarca',
  'America/Argentina/La_Rioja',
  'America/Argentina/San_Juan',
  'America/Argentina/Mendoza',
  'America/Argentina/San_Luis',
  'America/Argentina/Rio_Gallegos',
  'America/Argentina/Ushuaia',
  'Pacific/Pago_Pago',
  'Europe/Vienna',
  'Australia/Lord_Howe',
  'Antarctica/Macquarie',
  'Australia/Hobart',
  'Australia/Currie',
  'Australia/Melbourne',
  'Australia/Sydney',
  'Australia/Broken_Hill',
  'Australia/Brisbane',
  'Australia/Lindeman',
  'Australia/Adelaide',
  'Australia/Darwin',
  'Australia/Perth',
  'Australia/Eucla',
  'Asia/Baku',
  'America/Barbados',
  'Asia/Dhaka',
  'Europe/Brussels',
  'Europe/Sofia',
  'Atlantic/Bermuda',
  'Asia/Brunei',
  'America/La_Paz',
  'America/Noronha',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Araguaina',
  'America/Maceio',
  'America/Bahia',
  'America/Sao_Paulo',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Santarem',
  'America/Porto_Velho',
  'America/Boa_Vista',
  'America/Manaus',
  'America/Eirunepe',
  'America/Rio_Branco',
  'America/Nassau',
  'Asia/Thimphu',
  'Europe/Minsk',
  'America/Belize',
  'America/St_Johns',
  'America/Halifax',
  'America/Glace_Bay',
  'America/Moncton',
  'America/Goose_Bay',
  'America/Blanc-Sablon',
  'America/Toronto',
  'America/Nipigon',
  'America/Thunder_Bay',
  'America/Iqaluit',
  'America/Pangnirtung',
  'America/Atikokan',
  'America/Winnipeg',
  'America/Rainy_River',
  'America/Resolute',
  'America/Rankin_Inlet',
  'America/Regina',
  'America/Swift_Current',
  'America/Edmonton',
  'America/Cambridge_Bay',
  'America/Yellowknife',
  'America/Inuvik',
  'America/Creston',
  'America/Dawson_Creek',
  'America/Fort_Nelson',
  'America/Vancouver',
  'America/Whitehorse',
  'America/Dawson',
  'Indian/Cocos',
  'Europe/Zurich',
  'Africa/Abidjan',
  'Pacific/Rarotonga',
  'America/Santiago',
  'America/Punta_Arenas',
  'Pacific/Easter',
  'Asia/Shanghai',
  'Asia/Urumqi',
  'America/Bogota',
  'America/Costa_Rica',
  'America/Havana',
  'Atlantic/Cape_Verde',
  'America/Curacao',
  'Indian/Christmas',
  'Asia/Nicosia',
  'Asia/Famagusta',
  'Europe/Prague',
  'Europe/Berlin',
  'Europe/Copenhagen',
  'America/Santo_Domingo',
  'Africa/Algiers',
  'America/Guayaquil',
  'Pacific/Galapagos',
  'Europe/Tallinn',
  'Africa/Cairo',
  'Africa/El_Aaiun',
  'Europe/Madrid',
  'Africa/Ceuta',
  'Atlantic/Canary',
  'Europe/Helsinki',
  'Pacific/Fiji',
  'Atlantic/Stanley',
  'Pacific/Chuuk',
  'Pacific/Pohnpei',
  'Pacific/Kosrae',
  'Atlantic/Faroe',
  'Europe/Paris',
  'Europe/London',
  'Asia/Tbilisi',
  'America/Cayenne',
  'Africa/Accra',
  'Europe/Gibraltar',
  'America/Godthab',
  'America/Danmarkshavn',
  'America/Scoresbysund',
  'America/Thule',
  'Europe/Athens',
  'Atlantic/South_Georgia',
  'America/Guatemala',
  'Pacific/Guam',
  'Africa/Bissau',
  'America/Guyana',
  'Asia/Hong_Kong',
  'America/Tegucigalpa',
  'America/Port-au-Prince',
  'Europe/Budapest',
  'Asia/Jakarta',
  'Asia/Pontianak',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Europe/Dublin',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Indian/Chagos',
  'Asia/Baghdad',
  'Asia/Tehran',
  'Atlantic/Reykjavik',
  'Europe/Rome',
  'America/Jamaica',
  'Asia/Amman',
  'Asia/Tokyo',
  'Africa/Nairobi',
  'Asia/Bishkek',
  'Pacific/Tarawa',
  'Pacific/Enderbury',
  'Pacific/Kiritimati',
  'Asia/Pyongyang',
  'Asia/Seoul',
  'Asia/Almaty',
  'Asia/Qyzylorda',
  'Asia/Qostanay', // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
  'Asia/Aqtobe',
  'Asia/Aqtau',
  'Asia/Atyrau',
  'Asia/Oral',
  'Asia/Beirut',
  'Asia/Colombo',
  'Africa/Monrovia',
  'Europe/Vilnius',
  'Europe/Luxembourg',
  'Europe/Riga',
  'Africa/Tripoli',
  'Africa/Casablanca',
  'Europe/Monaco',
  'Europe/Chisinau',
  'Pacific/Majuro',
  'Pacific/Kwajalein',
  'Asia/Yangon',
  'Asia/Ulaanbaatar',
  'Asia/Hovd',
  'Asia/Choibalsan',
  'Asia/Macau',
  'America/Martinique',
  'Europe/Malta',
  'Indian/Mauritius',
  'Indian/Maldives',
  'America/Mexico_City',
  'America/Cancun',
  'America/Merida',
  'America/Monterrey',
  'America/Matamoros',
  'America/Mazatlan',
  'America/Chihuahua',
  'America/Ojinaga',
  'America/Hermosillo',
  'America/Tijuana',
  'America/Bahia_Banderas',
  'Asia/Kuala_Lumpur',
  'Asia/Kuching',
  'Africa/Maputo',
  'Africa/Windhoek',
  'Pacific/Noumea',
  'Pacific/Norfolk',
  'Africa/Lagos',
  'America/Managua',
  'Europe/Amsterdam',
  'Europe/Oslo',
  'Asia/Kathmandu',
  'Pacific/Nauru',
  'Pacific/Niue',
  'Pacific/Auckland',
  'Pacific/Chatham',
  'America/Panama',
  'America/Lima',
  'Pacific/Tahiti',
  'Pacific/Marquesas',
  'Pacific/Gambier',
  'Pacific/Port_Moresby',
  'Pacific/Bougainville',
  'Asia/Manila',
  'Asia/Karachi',
  'Europe/Warsaw',
  'America/Miquelon',
  'Pacific/Pitcairn',
  'America/Puerto_Rico',
  'Asia/Gaza',
  'Asia/Hebron',
  'Europe/Lisbon',
  'Atlantic/Madeira',
  'Atlantic/Azores',
  'Pacific/Palau',
  'America/Asuncion',
  'Asia/Qatar',
  'Indian/Reunion',
  'Europe/Bucharest',
  'Europe/Belgrade',
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Simferopol',
  'Europe/Kirov',
  'Europe/Astrakhan',
  'Europe/Volgograd',
  'Europe/Saratov',
  'Europe/Ulyanovsk',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Novosibirsk',
  'Asia/Barnaul',
  'Asia/Tomsk',
  'Asia/Novokuznetsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Chita',
  'Asia/Yakutsk',
  'Asia/Khandyga',
  'Asia/Vladivostok',
  'Asia/Ust-Nera',
  'Asia/Magadan',
  'Asia/Sakhalin',
  'Asia/Srednekolymsk',
  'Asia/Kamchatka',
  'Asia/Anadyr',
  'Asia/Riyadh',
  'Pacific/Guadalcanal',
  'Indian/Mahe',
  'Africa/Khartoum',
  'Europe/Stockholm',
  'Asia/Singapore',
  'America/Paramaribo',
  'Africa/Juba',
  'Africa/Sao_Tome',
  'America/El_Salvador',
  'Asia/Damascus',
  'America/Grand_Turk',
  'Africa/Ndjamena',
  'Indian/Kerguelen',
  'Asia/Bangkok',
  'Asia/Dushanbe',
  'Pacific/Fakaofo',
  'Asia/Dili',
  'Asia/Ashgabat',
  'Africa/Tunis',
  'Pacific/Tongatapu',
  'Europe/Istanbul',
  'America/Port_of_Spain',
  'Pacific/Funafuti',
  'Asia/Taipei',
  'Europe/Kiev',
  'Europe/Uzhgorod',
  'Europe/Zaporozhye',
  'Pacific/Wake',
  'America/New_York',
  'America/Detroit',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Indiana/Indianapolis',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Vevay',
  'America/Chicago',
  'America/Indiana/Tell_City',
  'America/Indiana/Knox',
  'America/Menominee',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/North_Dakota/Beulah',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'Pacific/Honolulu',
  'America/Montevideo',
  'Asia/Samarkand',
  'Asia/Tashkent',
  'America/Caracas',
  'Asia/Ho_Chi_Minh',
  'Pacific/Efate',
  'Pacific/Wallis',
  'Pacific/Apia',
  'Africa/Johannesburg'
];