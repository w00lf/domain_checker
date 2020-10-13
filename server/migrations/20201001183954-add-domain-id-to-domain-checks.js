'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('DomainChecks', 'domainId', {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'Domains'
          },
          key: 'id'
        },
        allowNull: false }, {
          transaction: t
        }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
