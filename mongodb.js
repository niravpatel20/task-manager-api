const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';


MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if(error){
        return console.log('Unable to connect to database!');
    }

    const db = client.db(databaseName);

//    db.collection('users').updateOne({
//        _id : new ObjectID("5d865a29ab5dd407102176f9")
//    },{
//        $inc:{
//            age: 1
//        }
//    }).then((result) => {
//        console.log(result);
//    }).catch((error) => {
//        console.log(error);
//    })

//     db.collection('tasks').updateMany({
//         completed: false
//     },{
//         $set : {
//             completed: true
//         }
//     }).then((result) => {
//         console.log(result);
//     }).catch((error) => {
//         console.log(error);
//     })

    db.collection('users').deleteOne({
        _id: new ObjectID("5d865972ea52014270edd2b7")
    }).then((result) => {
        console.log(result.deletedCount);
    }).catch((error) => {
        console.log(error);
    })

    client.close();
 });