import traverse from 'traverse';
import _ from 'lodash';
import debug from 'debug';

import { relationCheck } from '../../common';
import { mergeScopes, generateAliasedScope, getTargetList, validateTargetList } from './helpers';

const has = Object.prototype.hasOwnProperty;

const dbg = debug('sqllint:targetCheck');

export default function targetListCheck({ status }) {
  return function targetListCheckImpl({ ast, scheme }) {
    let errors = [];

    const root = { node: ast, path: [] };

    function recursion(elem) {
      let scope = [];
      const fromClause = elem.node.fromClause || {};
      const targetList = elem.node.targetList || {};

      traverse(fromClause).forEach(function iterate() {
        if (this.key === 'SelectStmt') {
          const stmt = {
            node: this.node,
            path: this.path,
            alias: has.call(this.parent.parent.node, 'alias')
              ? this.parent.parent.node.alias.Alias.aliasname
              : undefined,
          };

          dbg('entering recursion inside fromClause');
          const localScope = recursion(stmt);
          dbg('localScope from recursion inside fromClause', localScope);
          scope = mergeScopes(scope, localScope);

          this.block();
        } else if (this.key === 'RangeVar') {
          const tableObj = this.node;

          // check if tables are valid
          const relationErrors = relationCheck(tableObj, scheme, status);

          errors = [...errors, ...relationErrors];

          if (scheme.hasTable({ tableName: tableObj.relname })) {
            const table = scheme.getTable(tableObj.relname);

            const localScope = {
              name: has.call(tableObj, 'alias') ? tableObj.alias.Alias.aliasname : table.tableName,
              columns: _.map(table.columns, (column) => column.columnName),
            };

            scope = mergeScopes(scope, [localScope]);
          }
          this.block();
        }
      });

      // check other parts of ast, dont need scopes from these parts
      traverse(elem).forEach(function iterate() {
        if (this.key === 'fromClause') {
          this.block();
          return;
        }

        if (this.key === 'SelectStmt') {
          dbg('entering recursion mimo fromClause');
          recursion({ node: this.node, path: this.path });
          dbg('localScope from recursion mimo fromClause');
          this.block();
        }
      });

      const normalizedTargetList = getTargetList(targetList);
      dbg('normalizedTargetList', normalizedTargetList);

      const targetListErrors = validateTargetList(normalizedTargetList, scope, status);
      dbg('targetListErrors', targetListErrors);

      errors = [...errors, ...targetListErrors];
      
      // TODO, get normalize list from targetList
      // validate list/scopea
      // return modified scope(alias + returning list values)

      // console.log(elem.path, scope, elem.alias);
      // result = _.concat(result, listCheck(elem.node.targetList, scope, status));
      //

      dbg(elem.path, scope, elem.alias);
      dbg('aliased result', generateAliasedScope(scope, elem.alias));
      return generateAliasedScope(scope, elem.alias);
    }

    recursion(root);

    return errors;
  };
}
