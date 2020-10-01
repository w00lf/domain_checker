const SQL = require('sequelize');

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize),
        )
    : results.slice(0, pageSize);
};

module.exports.createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL('postgres://postgres:@localhost:5432/checker_development');

  // const users = db.define('users', {
  //   id: {
  //     type: SQL.INTEGER,
  //     primaryKey: true,
  //     autoIncrement: true,
  //   },
  //   created_at: SQL.DATE,
  //   updated_at: SQL.DATE,
  //   email: SQL.STRING,
  //   insurer_id: SQL.INTEGER,
  // }, {
  //   timestamps: true,
  //   createdAt: 'created_at',
  //   updatedAt: 'updated_at',
  // });

  const domains = db.define('Domains', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    host: SQL.STRING,
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
  }, {
    timestamps: true,
  });

  const domainChecks = db.define('DomainChecks', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: SQL.STRING,
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
  }, {
    timestamps: true,
  });

  return {
    domains,
    domainChecks,
   };
};