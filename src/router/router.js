const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const upload = require("./multer_storage");

const mongoose= require("mongoose")
const mongoURI= "mongodb+srv://mosboy:mosboy24@cluster0-fbyff.mongodb.net/CHAT_IMG?retryWrites=true&w=majority"
const Grid=require("gridfs-stream");
const conn = mongoose.createConnection(mongoURI,{
	useNewUrlParser: true,
	useUnifiedTopology:true
})

let gfs
conn.once("open",()=>{
	gfs = Grid(conn.db, mongoose.mongo)
	gfs.collection("imagesUpload")
	console.log("connection to database is successful")
})


router.get("/", (req, res) => {
	res.send("server is up and running");
});

router.post("/", (req, res) => {
	//note the req,res is been transferred to the upload function(multer) by calling the upload function below so it will not work outside it i.e const {name,room}=req.body; will not work except inside the upload function

	upload(req, res, function (err) {
		const { name, room } = req.body; //destructing name and room into it's own variables
		if (err instanceof multer.MulterError) {
			//A multer error occured when uploading
		} else if (err) {
			//An unknown errosr occured when uploading
			res.json("you have uploaded an image before.")
		} else {
			//image was uploaded successfully
			res.json("ok")
		}
	});
});

router.get("/:getPhotoName", (req, res) => {
		gfs.files.findOne({filename: req.params.getPhotoName},(err,file)=>{
			if(file){
				const readStream= gfs.createReadStream(file.filename)
				readStream.pipe(res)
			}
		})
});

module.exports = router;
