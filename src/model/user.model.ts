import mongoose, { Schema, Document } from "mongoose";

// Interface for the Message model
export interface Message extends Document {
	content: string;
	createdAt: Date; // Timestamp when the message was created
}

// Schema definition for the Message model
const MessageSchema: Schema<Message> = new Schema({
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now, //
	},
});

// Interface for the User model
export interface User extends Document {
	username: string;
	email: string;
	password: string;
	verifyCode: string;
	verifyCodeExpiry: Date;
	isVerified: boolean;
	isAcceptingMessage: boolean;
	messages: Message[]; // Array of messages associated with the user
}

// Schema definition for the User model
const UserSchema: Schema<User> = new Schema({
	username: {
		type: String,
		required: [true, "Username is required"],
		trim: true,
		unique: true,
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
		match: [
			/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
			"Invalid email address",
		],
	},
	password: {
		type: String,
		required: [true, "Password is required"],
	},
	verifyCode: {
		type: String,
		required: [true, "Verify Code is required"],
	},
	verifyCodeExpiry: {
		type: Date,
		required: [true, "Verify Code Expiry is required"],
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	isAcceptingMessage: {
		type: Boolean,
		default: true,
	},
	// Embeds Message schema for storing user messages
	messages: [MessageSchema],
});

// Creating or retrieving the User model from mongoose models
const UserModel =
	(mongoose.models.User as mongoose.Model<User>) ||
	mongoose.model<User>("User", UserSchema);

export default UserModel;
