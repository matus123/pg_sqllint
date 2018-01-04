import * as debug from 'debug';
import * as _ from 'lodash';
import * as Parser from 'pg-query-parser';
import * as util from 'util';

import { IError, ILinterConfig, IRule, IRuleOptions, StatusType } from './interfaces';
import rulesDict from './rules';

const dbg = debug('sqllint:linter');

export default class Linter {
  private rules: Array<() => void>;

  constructor(config: ILinterConfig = {}) {
    function initRules(rules?: IRuleOptions) {
      return _.reduce(rules, (result, ruleParams, ruleName) => {
        const fn = rulesDict[ruleName] !== undefined ? rulesDict[ruleName](ruleParams) : undefined;
        if (!fn) {
          throw new Error(`Rule '${ruleName}' not found`);
        }
        result.push(fn);
        return result;
      }, []);
    }

    this.rules = initRules(config.rules);
  }

  public lint(query: string, schemeInput): IError[] {
    const parsed = Parser.parse(query);
    if (parsed.error) {
      return [{
        location: parsed.error.cursorPosition,
        message: parsed.error.toString(),
        status: StatusType.ERROR,
      }];
    }

    // FIXME check all SQLs statements
    const ast = parsed.query[0].SelectStmt;

    dbg(util.inspect(ast, { showHidden: true, depth: null }));

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
