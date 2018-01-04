import Linter from './src/linter';

const config = {
  rules: {
    targetListCheck: {
      status: 'WARNING',
    },
  },
};

const linter = new Linter(config);

const SS = `
Select * from table_1
`;
// const SS = `
// SELECT s2.wrong as s1, s2.wrong2 as ss1 from test_schema.test_table as s2
// `;

const SQLquery = `
SELECT c.output122, c.output11 as output2, t2.output22 output3
FROM (select * from test_schema.test_table t1) c
LEFT JOIN test_table2 t2 on t2.id = c.id
LEFT JOIN (SELECT * from test_table3) t3 on t3.id = t2.id
WHERE (SELECT * FROM test_table4 t4) > 50
GROUP by c.output1
HAVING (SELECT * FROM test_table4 t5) > 50`;

const SQLquery1 = `
SELECT c.output1, c.output11 as output2, t2.output22 output3
FROM (select * from test_schema.test_table t1) c
LEFT JOIN test_table2 t2 on t2.id = c.id
LEFT JOIN (SELECT * from test_table3) t3 on t3.id = t2.id
WHERE (SELECT * FROM test_table4 t4) > 50
GROUP by c.output1
HAVING (SELECT * FROM test_table4 t5) > 50`;

// const SQLquery = 'SELECT c.output1, c.output1 as output2, c.output1 output3 FROM test_schema.test_table';
// const SQLquery = `SELECT c.output1, c.output1 as output2, c.output1 output3
// FROM test_schema.test_table c LIMIT 1 GROUP by c.output1`;

// const SQLquery = 'DELETE from test_schema where id = 2000';

// const SQLquery = `SELECT c.output1, c.output1 as output2, c.output1 output3
// FROM test_schema.test_table c JOIN test_table2 c2 on c.id = c2.id`;

// const SQLquery = 'SELECT c.output1, c.output1 as output2, c.output1 output3 FROM test_schema.test_table';

const scheme = {
  databaseName: 'test',
  schemaName: 'test',
  tables: [
    {
      tableName: 'table_1',
      columns: [
        {
          columnName: 'id',
        },
        {
          columnName: 'price',
        },
      ],
    },
    {
      tableName: 'table_2',
      columns: [
        {
          columnName: 'name',
        },
        {
          columnName: 'profit',
        },
      ],
    },
    {
      tableName: 'table_3',
      columns: [
        {
          columnName: 'id',
        },
        {
          columnName: 'name',
        },
      ],
    },
  ],
};

// const scheme = {
//   databaseName: 'dumpData',
//   schemaName: 'test_schema',
//   tables: [
//     {
//       tableName: 'test_table',
//       columns: [
//         {
//           columnName: 'output1',
//           isNullable: true,
//           dataType: 'integer',
//         },
//         {
//           columnName: 'output11',
//           isNullable: true,
//           dataType: 'integer',
//         },
//       ],
//     },
//     {
//       tableName: 'test_table2',
//       columns: [
//         {
//           columnName: 'output22',
//           isNullable: true,
//           dataType: 'integer',
//         },
//       ],
//     },
//     {
//       tableName: 'test_table3',
//       columns: [
//         {
//           columnName: 'output33',
//           isNullable: true,
//           dataType: 'integer',
//         },
//       ],
//     },
//     {
//       tableName: 'test_table4',
//       columns: [
//         {
//           columnName: 'output33',
//           isNullable: true,
//           dataType: 'integer',
//         },
//       ],
//     },
//   ],
// };

// const scheme = {
//     databaseName: 'dumpData',
//     schemaName: 'contracts_v1',
//     tables: [
//         {
//             tableName: 'contracts',
//             columns: [
//                 {
//                     columnName: 'id',
//                     isNullable: true,
//                     dataType: 'integer'
//                 },
//                 {
//                     columnName: 'customer',
//                     isNullable: true,
//                     dataType: 'character varying'
//                 },
//             ]
//         },
//     ]
// };

// console.log(rr.error);

const result = linter.lint(SS, scheme);

console.log(result);

// AST[0].SelectStmt.fromClause[0].RangeVar.relname = 'another_table';

// console.log(util.inspect(AST[0], { showHidden: true, depth: null }));

// SELECT * FROM "another_table"
