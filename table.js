const _ = require("lodash");

const Column = require("./column");

class Table {
    constructor({ tableName, columns }) {
        this.tableName = tableName;
        this.columns = _.reduce(columns, (result, column) => {
            return Object.assign({}, result, { [column.columnName]: new Column(column) });
        }, {});
    }
    
}

module.exports = Table;
