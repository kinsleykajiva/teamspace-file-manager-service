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
const fileStruct = arr =>{
    let result = [];
    let level = {result};
    arr.filter(x=>x.key)
        .forEach(path =>

                 path.key.replace('w23wwww/','').split('/')
                    .reduce((r, name, i, a) => {
                        if (!r[name]) {
                            r[name] = {result: []};

                            if(name.includes('.')) {
                                r.result.push({name, detail: path, children: r[name].result});
                            }else{
                                r.result.push({name,
                                    detail: {
                                        folder: path.folder,
                                        createdAt: path.createdAt,
                                        folderLevels: path.folderLevels,
                                        mimeType: 'folder',
                                    },
                                    children: r[name].result
                                });
                            }
                        } else if (i === a.length - 1) {
                            // Allow duplicate filenames.
                            // Filenames should always be at the end of the array.
                            r.result.push({name, children: []});
                        }

                        return r[name];
                    }, level)

        );
    return result;
}

router.get('/', async function (req, res, next) {

    let createdByUserId = req.query.createdByUserId || 1;
//  let x = await filesModel.filter(postObj => postObj("folder").eq(folder).and(postObj("mimeType").eq("folder")));
 //   let getMinValueFoldeLevel = await filesModel.filter(url => url("createdByUserId").eq(createdByUserId));
    let x = await filesModel.filter(url => url("createdByUserId").eq(createdByUserId));
  //  console.log(  JSON.parse(  JSON.stringify(x)) )
    const result = fileStruct(JSON.parse(JSON.stringify(x)));
    return res.status(200).send({
        success: true,
        message: 'Files',
        data: {
            fileObjects: result
        }
    });

});




router.get('/default', async function (req, res, next) {

    let createdByUserId = req.query.createdByUserId || 1;
    let folderPath = req.query.folderPath || "";
    let folderLevels = req.query.folderLevels || "";
    let result = [];

  if(folderPath === "") {

      let getMinValueFoldeLevel = await filesModel
          .filter(url => url("createdByUserId").eq(createdByUserId))
          .min('folderLevels');

      console.log(getMinValueFoldeLevel);

      if (getMinValueFoldeLevel) {
          const minLevel = getMinValueFoldeLevel.folderLevels || 0;
          // get all files and folders in this level
          result = await filesModel
              .filter(url => url("createdByUserId").eq(createdByUserId).and(url('folderLevels').eq(minLevel)))
              .orderBy('mimeType')
          //  .orderBy( rl=> rl.desc('originalFilename'))

      }
      result = fileStruct(JSON.parse(JSON.stringify(result)));


      return res.status(200).send({
          success: true,
          message: 'Files',
          data: {
              fileObjects: result
          }
      })
  }else {
      if(folderLevels === "") {
          return res.status(200).send({
              success: true,
              message: 'Files',
              data: {
                  fileObjects: []
              }
          })
      }
      // use the path to get the folder
      result = await filesModel
          .filter(url => url("createdByUserId").eq(createdByUserId).and(url('folder').eq(folderPath)))
          .orderBy('mimeType');
      let result2 = await filesModel
          .filter(url => url("createdByUserId").eq(createdByUserId)
              .and(url('folder').match(folderPath))
              .and(url('folderLevels').eq(parseInt(folderLevels) + 1))
          )
          .orderBy('mimeType');

      const combinedResult = result.concat(result2);
      result = fileStruct(JSON.parse(JSON.stringify(combinedResult)));

      return res.status(200).send({
          success: true,
          message: 'Files',
          data: {
              fileObjects: result
          }
      })
  }

});



router.post('/upload', (request, response) => {
    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        console.log('fields', fields['folder'] ? 12:45);
        //  console.log('files', files.file);
        const companyId = fields['companyId'][0];
        const userId = fields['userId'][0];
        let groupId =fields['groupId'] ?  fields['groupId'][0] : null;
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
                sizeInBytes:0,
                folderLevels:folder.split('/').filter(x=>x.length > 0).length,
                groupId,
                originalFilename: folder.split('/').filter(x=>x.length > 0).pop(),
                createdByUserId: userId,
                lastModifiedUserId: userId,
                usersIdsArrWithAccess,
                mimeType: "folder",
            });
            console.log( folder , '             folder');
            let x = await filesModel.filter(postObj => postObj("folder").eq(folder).and(postObj("mimeType").eq("folder")));
             console.log(x.length , folder , 'folder');
            if (x.length === 0) {
                save.save();
                let emptySave = new filesModel({
                    url: null,
                    key: folder + ".unknown",
                    etag: null,
                    folder,
                    sizeInBytes:0,
                    folderLevels:folder.split('/').filter(x=>x.length > 0).length,
                    groupId,
                    originalFilename: "ignoreX.unknown",
                    createdByUserId: userId,
                    lastModifiedUserId: userId,
                    usersIdsArrWithAccess,
                    mimeType: "unknown",
                });
                emptySave.save();
            }

            return response.status(200).send({
                success: true,
                message: 'Folder created successfully',
                data: {
                    "fileObjects": [
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
            // check if the folder exists and if not create it
            const folder = `${companyId}/${userId}${folderPost}`;

            let x = await filesModel.filter(postObj => postObj("folder").eq(folder).and(postObj("mimeType").eq("folder")));
            console.log(x.length , folder , 'folder');
            if (x.length === 0) {
                let save = new filesModel({
                    url: null,
                    key: null,
                    etag: null,
                    folder,
                    sizeInBytes:0,
                    folderLevels:folder.split('/').filter(x=>x.length > 0).length,
                    groupId,
                    originalFilename: folder.split('/').filter(x=>x.length > 0).pop(),
                    createdByUserId: userId,
                    lastModifiedUserId: userId,
                    usersIdsArrWithAccess,
                    mimeType: "folder",
                });
                let resultz= save.save();
                console.log(23+"    ",resultz);
            }


            for (const file of files.file) {

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
                    sizeInBytes:file.size,
                    folderLevels:folder.split('/').filter(x=>x.length > 0).length,
                    originalFilename:file.originalFilename || null,
                    groupId,
                    createdByUserId: userId,
                    lastModifiedUserId: userId,
                    usersIdsArrWithAccess,
                    mimeType: typee,
                });
                save.save();

                data.isJustFolder = false;
                 // console.log(data)
                result.push(data);
            }

            return response.status(200).send({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    fileObjects: result
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
