const mongoose= require("mongoose");


const connectToDB = async () =>{
  try{
      mongoose.connect(process.env.DB_CONNECT);
      console.log("dataBase is connected");
  }catch(e){
     console.log(e);
  }
}
module.exports=connectToDB;