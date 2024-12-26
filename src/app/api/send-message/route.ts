import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";
import { NextResponse } from "next/server";
// It's a POST request
export async function POST(request: Request) {
	await dbConnection();

	// const { username, content } = await request.json();
	// console.log(content);

	try {
		// Extrat the username and content from the request 
	  const { username, content } = await request.json();

		// Find the user by username from the database
		const user = await UserModel.findOne({ username });

		//! Return error, if user doesn't exist
		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		//! Return error, if user is not accepting messages
		if (!user.isAcceptingMessage) {
			return NextResponse.json(
				{
					success: false,
					message: "User is not accepting messages",
				},
				{ status: 403 }
			);
		}

		// Create the new message object with content and 
		// created at field
		const newMessage = { content, createdAt: new Date() };

		// Push the messages inside user object's message array
		user.messages.push(newMessage as Message);

		// Save the user
		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Message sent successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.log("Error adding messages", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
