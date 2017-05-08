import traverse from 'traverse';
import _ from 'lodash';

const has = Object.prototype.hasOwnProperty;

function mergeScopes(...scopes) {

  return _.reduce(scopes, (result, scope, index) => {
    if (index === 0) {
      return scope;
    }

    if (has.call(result, 'tables')) {
      
    } else {
      result = 0;
    }

    return result;
  }, {});
}

function validateScope() {
    
}

export default function targetListCheck({ status }) {
  return function targetListCheckImpl({ ast, scheme }) {
      const result = [];

      const root = { node: ast };
      
      function recursion(elem) {
          //get from scope
          /*const scope = { 
              tables: [
                  {
                      name: '',
                      columns: [],
                  }
              ]
          };*/
          
          let scope = {};
          const fromClause = elem.node.fromClause || {};
          
          traverse(fromClause).forEach(function iterate(x) {
              if (this.key === 'SelectStmt') {

                  const stmt = { node: this.node };
                  
                  if (has.call(this.parent.parent.node, 'alias')) {
                      stmt.alias = this.parent.parent.node.alias.Alias.aliasname;
                  }
                  
                  //do recursion, get scope
                  const localScope = recursion(stmt);
                  console.log('selectstmt - s', scope, localScope);
                  scope = mergeScopes(scope, localScope);
                  console.log('selectstmt - f', scope);
                  
                  this.block();
                  
              } else if (this.key === 'RangeVar') {
                  // TODO throw error ?
                  if (scheme.hasTable({ tableName: this.node.relname })) {
                      const table = scheme.getTable(this.node.relname);
                      const columns = _.map(table.columns, (column) => {
                          return column.columnName;
                      });
                      
                      let name = has.call(this.node, 'alias') ? this.node.alias.Alias.aliasname : this.node.relname;
                      
                      console.log('rangeVar - s', scope, { name, columns });
                      scope = mergeScopes(scope, { name, columns });
                      console.log('rangeVar - f', scope);
                      
                  }
                  
                  
                  this.block();
              }
              
          });
          
          
          //test scope with targetList
          
          //
          
          //check other parts of ast, dont need scopes from these parts
          traverse(elem).forEach(function iterate(x) {
              if (this.key === 'fromClause') {
                  this.block();
                  return;
              }
              
              if (this.key === 'SelectStmt') {
                  recursion({ node: this.node });
                  this.block();
              }
          });
          
          return scope;
      }
      
      recursion(root);
      
      return result;
  };
}
