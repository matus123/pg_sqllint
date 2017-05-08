import _ from 'lodash';
import * as Parser from 'pg-query-parser';
import util from 'util';

import * as rulesDict from './rules';
import { Scheme } from './data';

export default class Linter {
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
    const parsed = Parser.parse(query);
    if (parsed.error) {
      return [{
        status: 'ERROR',
        location: parsed.error.cursorPosition,
        message: parsed.error.toString(),
      }];
    }

    // FIXME check all SQLs statements
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
