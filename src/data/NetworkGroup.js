class NetworkGroup {
    constructor(db, name, timestamp, members) {
        this.db = db;  // Firebase Firestore
        this.name = name;  // (string): the group name
        this.timestamp = timestamp;  // (string): the creation date/time
        this.members = members;  // (list of UID): list of group members
        this.users = [];  // (list of UserProfile): list of group members
    }

    getName() {
        return this.name;
    }

    getTimestamp() {
        return this.timestamp;
    }

    getMembers() {
        return this.members;
    }

    getUsers() {
        return this.users;
    }

    setUsers(users) {
        this.users = users;
    }

    addUser(user) {
        this.users.push(user);
    }
}

export default NetworkGroup;
