// 3RES Messager Sample App
// index.js

// Express
var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');

// Socket.io
var io = require('socket.io')(server);

// Rethinkdb
var r = require('rethinkdb');

//room name
var room = '';

// Socket.io changefeed events
var changefeedSocketEvents = function(socket, entityName) {
	// console.log("change feed socket events");
	return function(rows) {
		rows.each(function(err, row) {
			// console.log(row)
			// console.log(row.new_val.content);
			// socket.emit("insert", row);
			// socket.emit("insert", row.new_val);
			if (err) { return console.log(err); }
			else if (row.new_val && !row.old_val) {
				// console.log(row.new_val)
				socket.emit("message:insert", row.new_val);

			}
			else {
				socket.emit("message:insert", row);
			}
		});
	};
};

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// app.get('*', function(req, res) {
//   res.sendFile(path.join(__dirname + '/index.html'));
// });

app.get('/:room', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
	room = req.params.room;
	// console.log(room)
});

r.connect({ db: 'Messenger' })
.then(function(connection) {

	io.on('connection', function (socket) {

		//new room request
		socket.on('newRoom', function(room) {
			r.table('Rooms').insert(room).run(connection);
		});

		// insert new messages
		// var con = connection;
		socket.on('insert', function(message) {
			r.table('Messages').insert(message).run(connection);

		});

		//initial state
		r.table('Messages').orderBy({ index: r.asc('createdAt') }).filter({"room": room})
		.run(connection)
		.then(changefeedSocketEvents(socket, 'message'));

		// emit events for changes to messages
		r.table('Messages').filter({"room": room})
		.changes()
		.run(connection).then(changefeedSocketEvents(socket, 'message'));

	});
	server.listen(9000, () => {
		console.log("> Listening at port 9000");
	});
})
.error(function(error) {
	console.log('Error connecting to RethinkDB!');
	console.log(error);
});
