import { expect } from 'chai';

import Linter from '../../lib/linter';
import scheme from '../schemas/schemeA';

let linter;

describe('TargetListCheck', () => {
  before((done) => {
    linter = new Linter({
      rules: {
        targetListCheck: {
          status: 'WARNING',
        },
      },
    });

    done();
  });

  after((done) => {
    done();
  });

  // no warning message
  describe('#returns no messages', () => {
    describe('#from clause', () => {
      it('select', (done) => {
        const query = 'Select * from table_1';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(0);
        done();
      });

      it('select using schema', (done) => {
        const query = 'Select * from test.table_1';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(0);
        done();
      });

      it('select using schema with alias', (done) => {
        const query = 'Select id, price from test.table_1 a';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(0);
        done();
      });
    });

    describe('#subselects', () => {
      it('subselect in target list', (done) => {
        const query = 'Select *, (select * from table_1) from table_1';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(0);
        done();
      });

      it('subselect in from', (done) => {
        const query = 'Select * from (select * from test.table_1 a) t';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(0);
        done();
      });

      it('multiple subselects, nested subselects', (done) => {
        const query = `Select *, (select * from (select * from table_2) t) from (select * from test.table_3) t2 
        where (select profit from test.table_2 tt) > 50`;
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(0);
        done();
      });
    });
  });

  // warning messages
  describe('#returns warning messages', () => {
    describe('#from clause', () => {
      it('select using wrong table', (done) => {
        const query = 'Select * from table_4';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(1);
        done();
      });

      it('select using wrong table with schema', (done) => {
        const query = 'Select * from test.table_4';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(1);
        done();
      });

      it('select using wrong table with schema and alias', (done) => {
        const query = 'Select * from test.table_4 a';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(1);
        done();
      });

      it('select using wrong schema', (done) => {
        const query = 'Select * from test_1.table_1';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(1);
        done();
      });

      it('select using wrong schema with alias', (done) => {
        const query = 'Select * from test_1.table_1 a';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(1);
        done();
      });

      it('select using wrong schema and wrong table', (done) => {
        const query = 'Select * from test_1.table_4';
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(2);
        done();
      });
    });
    describe('#subselects', () => {
      it('subselect in from, join, target', (done) => {
        const query = `Select *, (select * from test2.table_1) from (select * from test_1.table_4) tt
        join (select * from test.table_2) tt2 on tt2.name = tt.name
        join table_5 tt3 on tt3.id = tt.id`;
        const messages = linter.lint(query, scheme);
        expect(messages).to.have.lengthOf(4);
        done();
      });
    });
  });
});
