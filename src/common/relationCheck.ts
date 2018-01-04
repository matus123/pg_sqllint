export default function relationCheck(table, scheme, status) {
  const result = [];
  if (table.schemaname && table.schemaname !== scheme.schemaName) {
    result.push({
      location: table.location,
      message: 'Incorrect schema name',
      status,
    });
  }

  if (!scheme.hasTable({ tableName: table.relname })) {
    result.push({
      location: table.location,
      message: 'Incorrect table name',
      status,
    });
  }
  return result;
}
