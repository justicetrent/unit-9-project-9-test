'use strict'
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('Users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'user.firstName property is required' },
            },
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'user.lastName property is required' },
            },
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: { msg: 'user.emailAddress property must be a valid email address' },
                notEmpty: { msg: 'user.emailAddress property is required' },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'user.password property is required' },
            },
        }
    })
    // creates the association/relationship between two different tables 
    User.associate = function (models) {
        // associations can be defined here
        User.hasMany(models.Courses, {
                as: 'user',
                foreignKey: {
                    fieldName: 'userId',
                    allowNull: false,
                },
            })
    }
    return User
}