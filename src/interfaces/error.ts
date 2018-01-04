import { StatusType } from './status-type';

export interface IError {
  status: StatusType;
  location: number;
  message: string;
}
