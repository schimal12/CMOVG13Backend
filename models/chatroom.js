const { default: mongoose } = require("mongoose");
const mongoos = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
    name: { type: String, required: true}
});
module.exports = mongoose.model("ChatRoom", chatRoomSchema);
