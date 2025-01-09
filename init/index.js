const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
require('dotenv').config({ path: '../.env' });//../.env points to the parent directory of folder init

const dbUrl=process.env.ATLASDB_URL;


main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
});


async function main(){
    await mongoose.connect(dbUrl);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:"6772ece8d9203b878af8b195",//id of Omdeep Tyagi
    }));//this is to add a owner to all listings //as initially we don't have owner in data
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();