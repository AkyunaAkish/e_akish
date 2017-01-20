const knex = require('../../../db_config/knex');
const bcrypt = require('bcrypt');

module.exports = (req, res) => {
    return new Promise((resolve, reject) => {
        knex('posts')
            .then((posts) => {
                resolve({
                    success: posts
                });
            })
            .catch((err) => {
                reject({
                    error: 'An error occurred when attempting to retrieve posts.',
                    psql_error: err
                });
            });
    });
};