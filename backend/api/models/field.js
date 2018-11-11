'use strict';
module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define('Field', {
    name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    sponsored: DataTypes.BOOLEAN,
    contactPhone: DataTypes.STRING,
    imageUrl: DataTypes.STRING
  }, {
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
  Field.associate = function(models) {
    // A field has a location
    Field.belongsTo(models.Location, { foreignKey: 'locationId' });

    // Field belongsToMany fieldRating
    Field.belongsToMany(models.fieldRating, { through: 'fieldRatingsData', foreignKey: 'fieldId' });
  };
  return Field;
};