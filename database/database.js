const thinky = require('thinky')({
    host: "13.246.49.140",
    port: 28015,
    db: "teamspace"
});
const r = thinky.r;
const type = thinky.type;
const filesModel = thinky.createModel("files", {
    id_: type.string(),
    url: type.string(),
    key: type.string(),
    etag: type.string(),
    groupId: type.string(),
    folder: type.string(),
    createdByUserId: type.string(),
    lastModifiedUserId: type.string(),
    usersIdsArrWithAccess: type.string(),
    mimeType: type.string(),
    createdAt: type.date().default(r.now())
}, {
    pk: 'id_'
});


module.exports = {filesModel, r /*,chatMessageModel,companyModel , callModel , teamModel ,groupModel  , groupDetailModel*/};
/// module.exports = { thinky};


