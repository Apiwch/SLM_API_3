var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var cors = require('cors')
var { InfluxDBClient, Point } = require('@influxdata/influxdb3-client');

app.use(cors())
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const token = 'Rz2iF__PeVlbHlL1fGtYzc6UiKWCFOlE6oZwsfmDF93K4uOlK89EDvGL5tr-sWSs4Xe_Zz0ebGu_jNokeKV5YA==';

const client = new InfluxDBClient({host: 'https://us-east-1-1.aws.cloud2.influxdata.com', token: token})






let data = [];

app.get('/', function(req, res){
    
    res.json("Hello");
});

app.post('/api/SLM', function (req, res) {
	let database = `SLM`
    const SL = req.query.SLM;
    const T = req.query.Ti;

    const SLRecord = {
        SL: SL,
        timestamp: T
    };
    if (data.length >= 100) {
        // Remove the first element from the array
        data.shift();
    }
    const points =
    [
        Point.measurement("SL")
            .setIntegerField("SLV", SL)
    ];
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        client.write(point, database)
            // separate points by 1 second
            .then(() => new Promise(resolve => setTimeout(resolve, 1000)));
    }
    
    data.push(SLRecord);
	res.send('success : ' + req.query.SLM +' '+ req.query.Ti)
})

app.get('/api/SLM', function (req, res) {
    res.json(data);
});

// app.get('/api/His', function (req, res){
//     let dateNow = new Date().toISOString().split('T')[0];
//     var data = [];
//     async function main() {
//         const query = `SELECT *
//         FROM "SL"
//         WHERE
//         time >= timestamp '${dateNow}T01:00:00.000Z' AND time <= timestamp '${dateNow}T13:00:00.000Z'`;
//         const rows = await client.query(query, 'SLM');

//         for await (const row of rows) {
//             let ants = row.SLV || '';
//             let time = new Date(row.time);
            
//             var SlvHis ={
//                 SlvH: ants.toString(),
//                 timeH: time.toLocaleTimeString('en-GB'),
//             } 
//             data.push(SlvHis);
//         }

//         res.json(data);
//     }
    
//     main()
    
// });

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
