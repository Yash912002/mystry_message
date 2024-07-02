import mongoose from "mongoose";

type ConnectionObject = {
	isConnected?: number;
};
const connection: ConnectionObject = {};

async function dbConnection(): Promise<void> {
	// Check if the database is already connected
	if (connection) {
		console.log("Database is already connected");
		return;
	}
	try {
		// Attempt to connect to the database using the environment variable
		const db = await mongoose.connect(process.env.MONGODB_URL || "");

		// Update the connection state to the current state
		connection.isConnected = db.connections[0].readyState;
		console.log("Database connection successfull");
	} catch (error) {
		console.log("Database connection failed", error);
		process.exit(1);
	}
}

export default dbConnection;
