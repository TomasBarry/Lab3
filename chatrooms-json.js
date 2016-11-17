/**
 * JSON schema for the chatrooms
 * 
 * chatrooms: {
 *     room_id: {
 *         messages: [string] // in the form "(Room_ref) Timestamp - client_name: <message text>"
 *         members: [
 *             {
 *                 join_id: int,
 *                 client_name: string
 *             }
 *         ]
 *     }
 * }
 */

var chatrooms = {}

module.exports = chatrooms;
