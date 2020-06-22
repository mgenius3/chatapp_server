const users = [];

const addUser = ({ id, name, room }) => {
	//Moses Benjamin=mosesbenjamin
	name = name.trim().toLowerCase();
	room = room.trim().toLowerCase();
    console.log(users)
	const existingUser = users.find(
		(user) => user.room === room && user.name === name
	);
	if (existingUser) {
		return { error: "username is taken already" };
	}
	const user = { id, name, room };
	users.push(user);
	console.log(users)
	return { user };
};
const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};
const getUser = (id) => {
	console.log(users)
	var a = users.find((user) => user.id === id);
	return a;
}; 
 
const getUserInRoom = (room) => {
	const filterUser=users.filter((user) => user.room === room)
	const mapFilterUser=filterUser.map((user)=>({name:user.name,room:user.room}))
	return (mapFilterUser)
};

module.exports = { addUser, removeUser, getUser, getUserInRoom };
