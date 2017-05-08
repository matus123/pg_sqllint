const traverse = require("traverse");

module.exports = function relation_check({ status }) {
    return function relation_check({ ast, scheme }) {
        const result = [];
        traverse(ast).forEach(function iterate(x) {
            if (this.key === 'RangeVar') {
                const table = this.node;
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
            }
        });
        return result;
    };
}
