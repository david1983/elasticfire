var Firebase = require('firebase');
var ElasticClient = require('elasticsearchclient');

var config = {
    // firebase configuration here
  };
  Firebase.initializeApp(config);

// initialize our ElasticSearch API
var client = new ElasticClient({ host: 'localhost', port: 9200 });

// listen for changes to Firebase data
var fb = Firebase.database().ref('products');

client.index('firebase', 'products', {name: 'test'}, 1)
    .on('data', function(data) {
        console.log(data)
    })
    .exec()

var n = 0;
var arr = [];
var prods = {}
fb.once('value').then(function(snapshot) {  
    console.log('ok')
    prods = snapshot.val();
    arr = [];
    n=0;
    for(k in snapshot.val()){
        arr.push(k)
    }
    console.log(arr.length)
   console.log('end')
   setInterval(function(){
       console.log(n)
       if(prods[arr[n]]){
            client.index('firebase', 'products', prods[arr[n]], arr[n])
                .on('data', function(data) {
                    // console.log(data)
                })
            .exec()
       }else{
           clearInterval();
       }
       

       n++
   },50)
  
  
});


fb.on('child_added',   createOrUpdateIndex);
fb.on('child_changed', createOrUpdateIndex);
fb.on('child_removed', removeIndex);

function createOrUpdateIndex(snap) {
    // console.log(snap.val(), snap.key )
   client.index('firebase', 'products', snap.val(), snap.key)
     .on('data', function(data) { console.log('indexed ', snap.key); })
     .on('error', function(err) { 
        console.log(err) 
         });
}

function removeIndex(snap) {
    // console.log(snap)
   client.deleteDocument('firebase', 'products', snap.key, function(error, data) {
      if( error ) console.error('failed to delete', snap.key, error);
      else console.log('deleted', snap.key);
   });
}


