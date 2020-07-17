const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

const mongoURI = "mongodb://localhost/CHAT_IMG";
const conn = mongoose.createConnection(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
	//creating gfs to access db files
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection("imagesUpload");
	console.log("connnection to database is successful");
});

//creating storage engine
const storage = new GridFsStorage({
	//note: new GridFsStorage is creating it's own db connection instance
	url: "mongodb://localhost/CHAT_IMG",
	options: { useUnifiedTopology: true, useNewUrlParser: true },
	file: (req, file) => {
		const { name, room } = req.body;
		return new Promise((resolve, reject) => {

			const filename = `${name}${room}`;
			const fileinfo = {
				filename,
				bucketName: "imagesUpload",
			};
			//checking if incoming file already existed before saving to db
			gfs.files.findOne({ filename: `${name}${room}` }, (err, file) => {
				if (file) {
					reject("you have already uploaded an image")//this will make the db not to stare any file in mongodb
				} else {
					resolve(fileinfo); //saving file to db
				}
			});
		});
	},
});
const upload = multer({
	storage,
	fileFilter: function (req, file, cb) {
		let filetypes = /jpeg|jpg|png|gif/;
		const mimetype = filetypes.test(file.mimetype);
		if (mimetype) {
			cb(null, true);
		} else {
			cb(new Error("Images only"));
		}
	},
}).single("passport");

module.exports = upload;
