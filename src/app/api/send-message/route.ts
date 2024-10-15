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
	  const { username, content } = await request.json();
		const user = await UserModel.findOne({ username });

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		if (!user.isAcceptingMessage) {
			return NextResponse.json(
				{
					success: false,
					message: "User is not accepting messages",
				},
				{ status: 403 }
			);
		}

		const newMessage = { content, createdAt: new Date() };

		user.messages.push(newMessage as Message);

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
