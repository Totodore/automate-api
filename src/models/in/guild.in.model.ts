import { IsDateString, isDateString, IsString, Length, Matches, MaxLength } from "class-validator";

export class PostFreqMessageInModel {
  
  @Matches(/(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|([\d\*]+(\/|-)\d+)|\d+|\*) ?){5,7})/)
  public cron: string;

  @MaxLength(2000)
  public message: string;

  @MaxLength(2000)
  public parsedMessage: string;

  @Length(18, 18)
  public channelId: string;

  @MaxLength(1000)
  public description: string;

}

export class PostPonctMessageInModel {

  @IsDateString()
  public date: string;

  @Length(18, 18)
  public channelId: string;

  @MaxLength(1000)
  public description: string;

  @MaxLength(2000)
  public message: string;

  @MaxLength(2000)
  public parsedMessage: string;
}

export class PatchFreqMessageInModel {
    
  @Matches(/(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|([\d\*]+(\/|-)\d+)|\d+|\*) ?){5,7})/)
  public cron: string;
}

export class PatchPonctMessageInModel {
  @IsDateString()
  public date: string;
}