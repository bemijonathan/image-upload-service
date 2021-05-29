require('dotenv').config();
const express = require('express');
const app = express();
const aws = require("aws-sdk");
const fs = require('fs')
const multer = require("multer");



aws.config.update({
    secretAccessKey: process.env.S3_SECRET,
    accessKeyId: process.env.S3_ACCESS_KEY,
    region: "us-east-1",
});

const s3 = new aws.S3();

app.post('/upload', multer({
    storage: multer.memoryStorage(),
    limits: { fieldSize: 8 * 1024 * 1024 }
})
    .single('file'),
    (req, res) => {

        aws.config.update({
            secretAccessKey: process.env.S3_SECRET,
            accessKeyId: process.env.S3_ACCESS_KEY,
            region: "us-east-1",
        });

        console.log(req.file);

        if (!req.file) return res.status(400).json({

            error: 'file not found'

        })
        let params = {
            ACL: 'public-read',
            Bucket: process.env.BUCKET_NAME,
            Body: req.file.buffer,
            Key: `${Date.now()}${req.file.originalname}`
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.log('Error occured while trying to upload to S3 bucket', err);
            }

            if (data) {
                const locationUrl = data.Location;
                console.log(locationUrl)
                return res.status(200).send({
                    img : locationUrl
                })
            }
        });

    })


app.listen(3000, console.log('server has started'))