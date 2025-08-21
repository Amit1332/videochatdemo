class PresenceService {
constructor() {
this.userIdToSocketId = new Map();
this.socketIdToUserId = new Map();
}
setOnline(userId, socketId) {
this.userIdToSocketId.set(userId, socketId);
this.socketIdToUserId.set(socketId, userId);
}
setOfflineBySocket(socketId) {
const userId = this.socketIdToUserId.get(socketId);
if (userId) {
this.socketIdToUserId.delete(socketId);
this.userIdToSocketId.delete(userId);
}
}
isOnline(userId) {
return this.userIdToSocketId.has(userId);
}
getOnlineUserIds() {
return Array.from(this.userIdToSocketId.keys());
}
getSocketIdByUserId(userId) {
return this.userIdToSocketId.get(userId);
}
}
export const presenceService = new PresenceService();