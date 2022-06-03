var express = require('express');
const {s3Config, BUCKET, ACCESSKEYID, SECRETACCESSKEY, REGION} = require("../aws/configs");
var router = express.Router();
const multer = require('multer')
const multerS3 = require('multer-s3')
const {v4: uuidv4} = require('uuid');
var multiparty = require('multiparty');
let aws = require('aws-sdk');
const s3ls = require("s3-ls");
// const fileType = require('file-type');

const fs = require('fs');
const {filesModel, r} = require("../database/database");

function getExtension(filename) {
    return filename.split(".").pop();
}

function getFilename() {
    return Date.now().toString() + '__' + uuidv4();
}

aws.config.update({
    secretAccessKey: SECRETACCESSKEY,
    accessKeyId: ACCESSKEYID,
    region: REGION
});
const s3 = new aws.S3();


const uploadFile = (buffer, name, type) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: BUCKET,
        ContentType: type.mime,
        Key: `${name}.${type}`
    };
    return s3.upload(params).promise();
};


router.get('/', async function (req, res, next) {

    let createdByUserId = req.query.createdByUserId || 1;

    let x = await filesModel.filter(url => url("createdByUserId").eq(createdByUserId));

    return res.status(200).send({
        success: true,
        message: 'Files',
        data: {
            files: x
        }
    });

});

router.post('/upload', (request, response) => {
    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        //console.log('fields', fields['folder'] ? 12:45);
        //  console.log('files', files.file);
        const companyId = fields['companyId'][0];
        const userId = fields['userId'][0];
        let groupId = fields['groupId'][0];
        let folderPost = fields['folder'] ? '/' + fields['folder'][0].trim() + "/" : '/';
        // console.log('fieldsXXX', fields['groupId'][0]);
        groupId = groupId ? groupId : 'null' /*means this personal belong to the creator*/;
        //   const createdByUserId = fields['createdByUserId'];
        //  const lastModifiedUserId = fields['lastModifiedUserId'];
        let usersIdsArrWithAccess = fields['usersIdsArrWithAccess'];
        usersIdsArrWithAccess = usersIdsArrWithAccess ? usersIdsArrWithAccess.split(',') : null;
        if (error) {
            return response.status(500).send(error);
        }
        if (!files.file) {
            const folder = `${companyId}/${userId}${folderPost}`;
            let save = new filesModel({
                url: null,
                key: null,
                etag: null,
                folder,
                groupId,
                createdByUserId: userId,
                lastModifiedUserId: userId,
                usersIdsArrWithAccess,
                mimeType: "folder",
            });
            console.log( folder , '             folder');
            let x = await filesModel.filter(postObj => postObj("folder").eq(folder).and(postObj("mimeType").eq("folder")));
             console.log(x.length , folder , 'folder');
            if (x.length === 0) {
               let resultz= save.save();
               console.log(23+"    ",resultz);
            }//  w23wwww/sdsdsd/even2e/
            //
            // isJustFolder:true,

            return response.status(200).send({
                success: true,
                message: 'Folder created successfully',
                data: {
                    "files": [
                        {
                            "ETag": null,
                            "Location": null,
                            "key": null,
                            "Key": null,
                            "Bucket": null,
                            "isJustFolder": true,
                        },
                    ]
                }
            });

        }
        try {
            let result = [];
            for (const file of files.file) {
                const folder = `${companyId}/${userId}${folderPost}`;
                const typee = getExtension(file.originalFilename);
                const path = file.path;
                const buffer = fs.readFileSync(path);
                const fileName = `${folder}` + getFilename();
                const data = await uploadFile(buffer, fileName, typee);
                let save = new filesModel({
                    url: data.Location,
                    key: data.key,
                    etag: data.ETag,
                    folder,
                    groupId,
                    createdByUserId: userId,
                    lastModifiedUserId: userId,
                    usersIdsArrWithAccess,
                    mimeType: typee,
                });
                save.save();

                data.isJustFolder = false;
                //  console.log(data)
                result.push(data);
            }

            return response.status(200).send({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    files: result
                }
            });
        } catch (error) {
            console.error(error);
            return response.status(400).send({
                success: false,
            });
        }
    });
});


module.exports = router;
