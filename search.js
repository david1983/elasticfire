var Firebase = require('firebase');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

var config = {
    apiKey: "AIzaSyAG1u29W1E_Y3ZXr2ynUyC3dhee3NlbI_M",
    authDomain: "grooco-3a6e4.firebaseapp.com",
    databaseURL: "https://grooco-3a6e4.firebaseio.com",
    storageBucket: "grooco-3a6e4.appspot.com",
};
Firebase.initializeApp(config);


// listen for requests at https://<INSTANCE>.firebaseio.com/search/request
var queue = Firebase.database().ref('search');
queue.child('request').on('child_added', processRequest);

function processRequest(snap) {
    console.log('start search')
    console.log(snap.val())
    var data = snap.val();
    snap.ref.remove(); // clear the request after we receive it

    // Query ElasticSearch
    var bodyObj = {
        query: {
            bool: {
                should: [
                    { match: { name: data.query }, },
                    { match: { summary: data.query } },
                    { match: { category: data.query }, },
                    { match: { main_category: data.query } }
                    
                ]
            }
        }
    }

    bodyObj = Object.assign(bodyObj, data.options)
    client.search({
        index: 'firebase',
        type: 'products',
        body: bodyObj
    }).then(function (resp) {
        var hits = resp.hits.hits;
        queue.child('response/' + snap.key).set(resp);
    }, function (err) {
        console.trace(err.message);
    });

}
