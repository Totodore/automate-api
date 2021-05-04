import { Injectable, Logger, Module } from '@nestjs/common';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppLogger extends Logger {

  log(...message: any[]) {
    super.log(message.join(" "), this.context || "AppLogger");
  }
  warn(...message: any[]) {
    super.warn(message.join(" "), this.context || "AppLogger");
  }
  debug(...message: any[]) {
    super.debug(message.join(" "), this.context || "AppLogger")
  }
  verbose(...message: any[]) {
    super.verbose(message.join(" "), this.context || "AppLogger");
  }
  error(...message: any[]) {
    super.error(message.join(" "), null, this.context || "AppLogger");
  }
  
}