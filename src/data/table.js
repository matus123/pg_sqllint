import _ from 'lodash';

import Column from './column';

class Table {
  constructor({ tableName, columns }) {
    this.tableName = tableName;
    this.columns = _.reduce(columns, (result, column) => (
      Object.assign({}, result, { [column.columnName]: new Column(column) })
    ), {});
  }
}

module.exports = Table;
