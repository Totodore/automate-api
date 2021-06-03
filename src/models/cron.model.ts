

export interface StateDataModel {
  minutes: MinuteState;
  hourly: HourlyState;
  daily: DailyState;
  weekly: WeeklyState;
  monthly: MonthlyState;
  advanced: AdvancedState;
  date: DateState;
}

export interface MinuteState {
  minutes: number,
};
export interface HourlyState {
  hours: number,
  minutes: number,
}
export interface DailyState {
  subTab: string,
  everyDays: EveryDayState
  everyWeekDay: EveryWeekDay
}
export interface EveryDayState {
  days: number,
  hours: number,
  minutes: number,
}
export interface EveryWeekDay {
  hours: number,
  minutes: number,
}
export interface WeeklyState {
  dow: { [k in DoW]: boolean },
  hours: number,
  minutes: number,
}
export interface MonthlyState {
  subTab: 'specificDay' | 'specificWeekDay';
  specificDay: MonthlySpecificDayState
  specificWeekDay: MonthlySpecificWeekDayState
}
export interface MonthlySpecificDayState {
  day: string[],
  months: number,
  hours: number,
  minutes: number,
}
export interface MonthlySpecificWeekDayState {
  monthWeek: string,
  day: string,
  startMonth: number,
  months: number,
  hours: number,
  minutes: number,
}
export interface AdvancedState {
  expression: string
}
export interface DateState {
  date: Date,
  hours: number,
  minutes: number
}
export enum DoW {
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
  SUN = "SUN",
}
export enum Tab {
  minutes = "minutes",
  hourly = "hourly",
  daily = "daily",
  weekly = "weekly",
  monthly = "monthly",
  advanced = "advanced",
  date = "date"
}
