import { IColumn } from './index';

export interface ITable {
  tableName: string;
  schemaName: string | undefined;
  columns: IColumn[];
}
