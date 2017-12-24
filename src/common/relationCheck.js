export default function relationCheck(table, scheme, status) {
  const result = [];
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
