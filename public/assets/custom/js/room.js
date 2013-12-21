function Room(name,messages,users) {
    this.name=pick(name,"");
    this.messages = pick(messages,[]);
    this.users = pick(users,{});
}