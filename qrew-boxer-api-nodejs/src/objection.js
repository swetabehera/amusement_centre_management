import { Model } from 'objection';
import knex from 'knex';

export default function (app) {
    const { client, connection } = app.get('mysql');
    const db = knex({ client, connection, useNullAsDefault: false });

    Model.knex(db);

    app.set('knex', db);
}
