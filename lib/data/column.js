
export default class Column {
  constructor({ columnName, isNullable, defaultValue, dataType }) {
    this.columnName = columnName;
    this.isNullable = isNullable;
    this.defaultValue = defaultValue;
    this.dataType = dataType;
  }
}
