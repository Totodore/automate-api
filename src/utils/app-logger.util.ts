import { Injectable, Logger, Module } from '@nestjs/common';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppLogger extends Logger {

  log(...message: any[]) {
    super.log(message.join(" "), "AppLogger");
  }
  warn(...message: any[]) {
    super.warn(message.join(" "), "AppLogger");
  }
  debug(...message: any[]) {
    super.debug(message.join(" "), "AppLogger")
  }
  verbose(...message: any[]) {
    super.verbose(message.join(" "), "AppLogger");
  }
}