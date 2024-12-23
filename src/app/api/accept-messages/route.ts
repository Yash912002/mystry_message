import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import { NextResponse } from "next/server";

// This function handles POST requests to update the user's message acceptance status.
export async function POST(request: Request) {
	await dbConnection();

	const session = await getServerSession(authOptions);

	const user: User = session?.user as User;

	if (!session || !session.user) {
		return NextResponse.json(
			{
				success: false,
				message: "Not Authenticated",
			},
			{ status: 401 }
		);
	}

	const userId = user._id;
	// const userId = user.id;

	const { acceptMessages } = await request.json();

	try {
		const updatedUser = await UserModel.findByIdAndUpdate(
			userId,
			{
				isAcceptingMessage: acceptMessages,
			},
			{ new: true }
		);

		if (!updatedUser) {
			return NextResponse.json(
				{
					success: false,
					message: "Failed to update user status to accept messages" ,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Message acceptance status updated successfully",
				updatedUser
			},
			{ status: 200 }
		);
	} catch (error) {
		console.log("Failed to update user status to accept messages",error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to update user status to accept messages",
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: Request) {
	await dbConnection();

	const session = await getServerSession(authOptions);

	const user: User = session?.user as User;

	if (!session || !session.user) {
		return NextResponse.json(
			{
				success: false,
				message: "Not Authenticated",
			},
			{ status: 401 }
		);
	}

	const userId = user._id;

	try {
		const foundUser = await UserModel.findById(userId);

		if (!foundUser) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				isAcceptingMessages: foundUser.isAcceptingMessage,
			},
			{ status: 200 }
		);
	} catch (error) {
    console.log("Error in getting message acceptance status", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error in getting message acceptance status",
			},
			{ status: 500 }
		);
  }
}
