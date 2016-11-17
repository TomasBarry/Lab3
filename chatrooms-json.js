/**
 * JSON schema for the chatrooms
 * 
 * chatrooms: {
 *     room: [
 *         {
 *             room_id: int,  // unique identifier for the room
 *             messages: [string] // in the form "Timestamp - client_name: <message text>"
 *             members: [
 *                 {
 *                     join_id: int,
 *                     client_name: string
 *                 }
 *             ]
 *         }
 *     ]
 * }
 */

var chatrooms = {}

module.exports = chatrooms;
