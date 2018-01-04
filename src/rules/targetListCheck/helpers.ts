import * as debug from 'debug';
import * as _ from 'lodash';

import { IError } from '../../interfaces';
import CONSTS from './constants';

const has = Object.prototype.hasOwnProperty;

const dbg = debug('sqllint:helpers');

function getTarget(node) {
  dbg(node);
  const alias = has.call(node, 'name') ? node.name : undefined;

  const columnRef = getColumnRef(node);
  if (columnRef) {
    const { table, column } = getFields(columnRef);
    return {
      table,
      column,
      alias,
    };
  }
  return undefined;
}

function getColumnRef(node) {
  try {
    return node.val.ColumnRef;
  } catch (err) {
    return undefined;
  }
}

function getFields(node) {
  dbg(node);
  let [table, column] = node.fields;
  if (!column) {
    column = table;
    return {
      column: column.String ? column.String.str : CONSTS.A_Star,
    };
  }
  return {
    table: table.String.str,
    column: column.String ? column.String.str : CONSTS.A_Star,
  };
}

function validate(target, table, status) {
  if (!table) {
    return MessageError({
      status,
      message: 'table is undefined',
    });
  }

  if (target.column === CONSTS.A_Star) {
    return undefined;
  }

  if (!_.includes(table.columns, target.column)) {
    return MessageError({
      status,
      message: `column '${target.column}' does not exist in '${table.name}' relation`,
    });
  }
  return undefined;
}

export function mergeScopes(...scopes) {
  dbg('scopes', scopes);
  return _.reduce(scopes, (result, scope) => {
    const newResult = result;
    _.each(scope, (scopeTable) => {
      dbg('scopeTable', scopeTable);
      const found = _.filter(newResult, (resultTable) => (
        resultTable.name === scopeTable.name
      ));
      dbg('found', found);
      if (found.length > 0) {
        const scopeTableColumns = scopeTable.columns;
        const resultColumns = found[0].columns;
        found[0].columns = _.uniq(_.concat(scopeTableColumns, resultColumns));
      } else {
        newResult.push(scopeTable);
      }
    });
    return newResult;
  }, []);
}

export function validateTargetList(targetList, scope, status) {
  dbg('targetList', targetList);
  return _.reduce(targetList, (errors, target) => {
    const table = _.find(scope, (relation) => target.table === relation.name);
    const error = validate(target, table, status);
    if (error) {
      errors.push(error);
    }
    return errors;
  }, []);
}

export function generateAliasedScope(scopes, alias) {
  return [{
    name: alias,
    columns: _.reduce(scopes, (result, scope) => {
      const uniq = _.filter(scope.columns, (column) => !_.includes(result, column));
      return _.concat(result, uniq);
    }, []),
  }];
}

export function getTargetList(targetList) {
  return _.reduce(targetList, (list, target) => {
    if (has.call(target, 'ResTarget')) {
      const resTarget = target.ResTarget;
      const item = getTarget(resTarget);
      list.push(item);
    }
    return list;
  }, []);
}
