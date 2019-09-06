'use strict'
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
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
    //creates the association/relationship between two different tables 
    User.associate = function (models) {
        //allows the user table to have access to courses table 
        User.hasMany(models.course)
    }
    return User
}