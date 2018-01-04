import { IColumn } from './index';

export interface IScheme {
  tableName: string;
  schemaName: string | undefined;
  columns: IColumn[];
}
