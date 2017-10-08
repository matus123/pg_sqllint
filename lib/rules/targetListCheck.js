import traverse from 'traverse';
import _ from 'lodash';

const has = Object.prototype.hasOwnProperty;

function relationCheck(node, scheme, status) {
  const result = [];
  const table = node;
  if (table.schemaname && table.schemaname !== scheme.schemaName) {
    result.push({
      status,
      location: table.location,
      message: 'Incorrect schema name',
    });
  }

  if (!scheme.hasTable({ tableName: table.relname })) {
    result.push({
      status,
      location: table.location,
      message: 'Incorrect table name',
    });
  }
  return result;
}

function listCheck(list, scope, status) {
  return [];
}

function mergeScopes(...scopes) {
  console.log('scopes', scopes);
  return _.reduce(scopes, (result, scope) => {
    const newResult = result;
    _.each(scope, (scopeTable) => {
      console.log('scopeTable', scopeTable);
      const found = _.filter(newResult, resultTable => (
        resultTable.name === scopeTable.name
      ));
      console.log('found', found);
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

function generateAliasedScope(scopes, alias) {
  return [{
    name: alias,
    columns: _.reduce(scopes, (result, scope) => {
      const uniq = _.filter(scope.columns, (column) => {
        return !_.includes(result, column);
      });
      return _.concat(result, uniq);
    }, []),
  }];
}

function getTargetList() {
  function getColumnRef(node) {
    try {
      return node.val.ColumnRef;
    } catch (err) {
      return null;
    }
  }

  function getFields(node) {
    console.log(node);
    const [alias, column] = node.fields;
    if (!column) {
      return {
        column: alias.String.str,
      };
    }
    return {
      alias: alias.String.str,
      column: column.String.str,
    };
  }

  function validate(value, scope) {

  }

  _.each(targetList, (target) => {
    if (has.call(target, 'ResTarget')) {
      const resTarget = target.ResTarget;
      const columnRef = getColumnRef(resTarget);
      if (columnRef) {
        const { alias, column } = getFields(columnRef);

      }
    }
  });
}

export default function targetListCheck({ status }) {
  return function targetListCheckImpl({ ast, scheme }) {
    let result = [];

    const root = { node: ast, path: [] };

    function recursion(elem, flag) {
      let scope = [];
      const fromClause = elem.node.fromClause || {};

      traverse(fromClause).forEach(function iterate() {
        if (this.key === 'SelectStmt') {

          const stmt = {
            node: this.node,
            path: this.path,
            alias: has.call(this.parent.parent.node, 'alias')
              ? this.parent.parent.node.alias.Alias.aliasname
              : undefined,
          };

          console.log('entering recursion inside fromClause');
          const localScope = recursion(stmt);
          console.log('localScope from recursion inside fromClause', localScope);
          scope = mergeScopes(scope, localScope);

          this.block();
        } else if (this.key === 'RangeVar') {
          // check if tables are valid
          result = _.concat(result, relationCheck(this.node, scheme, status));

          if (scheme.hasTable({ tableName: this.node.relname })) {
            const table = scheme.getTable(this.node.relname);
            const columns = _.map(table.columns, column => column.columnName);
            const name = has.call(this.node, 'alias') ? this.node.alias.Alias.aliasname : table.tableName;

            scope = mergeScopes(scope, [{ name, columns }]);
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
          console.log('entering recursion mimo fromClause');
          recursion({ node: this.node, path: this.path });
          console.log('localScope from recursion mimo fromClause');
          this.block();
        }
      });

      // TODO, get normalize list from targetList
      // validate list/scopea
      // return modified scope(alias + returning list values)

      // console.log(elem.path, scope, elem.alias);
      // result = _.concat(result, listCheck(elem.node.targetList, scope, status));
      //

      console.log(elem.path, scope, elem.alias);
      console.log('aliased result', generateAliasedScope(scope, elem.alias));
      return generateAliasedScope(scope, elem.alias);
    }

    recursion(root);

    return result;
  };
}
