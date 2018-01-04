import { StatusType } from './status-type';

export interface IRule {
  status: StatusType;
}

export interface IRuleOptions {
  [key: string]: IRule;
}

export interface ILinterConfig {
  rules?: IRuleOptions;
}
