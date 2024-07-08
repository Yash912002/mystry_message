import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";

// It's a POST request
export async function POST(request: Request) {
	await dbConnection();

	const { username, content } = await request.json();

	try {
		const user = await UserModel.findOne({ username });

		if (!user) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		if (!user.isAcceptingMessage) {
			return Response.json(
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

		return Response.json(
			{
				success: true,
				message: "Message sent successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.log("Error adding messages", error);
		return Response.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
