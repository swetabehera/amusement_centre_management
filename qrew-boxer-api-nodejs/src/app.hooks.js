// Application hooks that run for every service
import * as feathersAuthentication from '@feathersjs/authentication';
import { iff, isProvider } from 'feathers-hooks-common';
import HasAccessToken from './utils/HasAccessToken';
import FetchPermissionsClientPermissions from './hooks/FetchPermissionsClientPermissions';
import CatchObjectionError from './hooks/CatchObjectionError';

const { authenticate } = feathersAuthentication;

export default {
    before: {
        all: [iff(HasAccessToken(), authenticate('jwt')), FetchPermissionsClientPermissions()],
        find: [
            iff(isProvider('external'), (ctx) => {
                const { params } = ctx;
                let {
                    query: { $limit },
                } = params;
                if (typeof $limit === 'string') $limit = parseInt($limit);
                if ($limit === -1) {
                    delete ctx.params.query.$limit;
                    ctx.params.paginate = false;
                }
            }),
        ],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    error: {
        all: [CatchObjectionError()],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },
};
