const _ = require('lodash');
const parser = require('pg-query-parser');
const util = require("util");

const rulesDict = require('./rules');
const Scheme = require("./scheme");

class Linter {
    constructor(config) {
        
        function initRules(rules = {}) {
            return _.reduce(rules, (result, ruleParams, ruleName) => {
                const fn = rulesDict[ruleName] !== undefined ? rulesDict[ruleName](ruleParams) : undefined;
                if (!fn) {
                    throw new Error(`Rule '${ruleName}' not found`);
                }
                result.push(fn);
                return result;
            }, []);
        }
        
        this.config = config || {};
        this.rules = initRules(config.rules);
    }
    
    lint(query, schemeInput) {
        const parsed = parser.parse(query);
        if (parsed.error) {
            return [{
                status: 'ERROR',
                location: parsed.error.cursorPosition,
                message: parsed.error.toString(),
            }];
        }
        
        //FIXME check all SQLs statements
        const ast = parsed.query[0].SelectStmt;
        
        // console.log(util.inspect(ast, { showHidden: true, depth: null }));
        
        const scheme = schemeInput === undefined ? undefined : new Scheme(schemeInput);
        return _.reduce(this.rules, (result, rule) => {
            const messages = rule({ ast, scheme });
            if (messages.length > 0) {
                result.push(...messages);
            }
            return result;
        }, []);
    }
}

module.exports = Linter;
