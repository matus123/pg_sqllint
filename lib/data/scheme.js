import _ from 'lodash';

import Table from './table';

const has = Object.prototype.hasOwnProperty;

export default class Scheme {
  constructor({ databaseName, schemaName, tables }) {
    this.databaseName = databaseName;
    this.schemaName = schemaName;
    this.tables = _.reduce(tables, (result, table) => (
        Object.assign({}, result, { [table.tableName]: new Table(table) })
    ), {});
  }

  hasTable({ schemaName, tableName }) {
    if (schemaName && schemaName !== this.schemaName) {
      return false;
    }
    if (has.call(this.tables, tableName)) {
      return true;
    }
    return false;
  }

  getTable(tableName) {
    return this.tables[tableName];
  }
}
