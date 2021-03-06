import React from 'react';
import TextField from 'material-ui/TextField';

// Import socket and connect
import io from 'socket.io-client';
const socket = io.connect('/');

export default class Home extends React.Component {

  constructor(props) {
		super(props);
		this.state = { open: false };
	};

  handleNewRoomInput(event) {
    if (event.keyCode === 13) {
			if (event.target.value && event.target.value.length > 0) {
        var room = event.target.value;

        // Emit socket event for new todo
        socket.emit('newRoom', {
          name: event.target.value,
          createdAt: new Date()
        });

        event.target.value = '';

        // this.setState({room: room});
        localStorage.setItem("room", room);
        window.location.href = '/' + room;

			}
			else {
				this.setState({ error: 'Room must have a name'});
			}
		}
  }

  render() {
		return (<div>
        Enter a room to start chatting!
        <TextField  style={{ margin: 20 }}
            hintText="new room"
  					errorText={ this.state.error }
  					onKeyDown={this.handleNewRoomInput} />
		</div>);
	}
}
