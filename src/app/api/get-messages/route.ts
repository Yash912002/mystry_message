import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	await dbConnection();

	// Retrieves the session object for the authenticated user
	const session = await getServerSession(authOptions);

	// Session's user object is extracted 
	const user: User = session?.user as User;

	// It ensures that a valid session and user 
	// exist before proceeding.
	if (!session || !session.user) {
		return NextResponse.json(
			{
				success: false,
				message: "Not Authenticated",
			},
			{ status: 401 }
		);
	}

	// The _id from the session's user object is 
	// converted into a mongoose.Types.ObjectId
	const userId = new mongoose.Types.ObjectId(user._id);

	// Aggregation pipeline is used to fetch and 
	// organize messages for the authenticated user: 
	try {
		const userMessages = await UserModel.aggregate([
			{ $match: { _id: userId } },
			{ $unwind: "$messages" },
			{ $sort: { "messages.createdAt": -1 } },
			{ $group: { _id: "$_id", messages: { $push: "$messages" } } },
		]);

		// Return error if messages doesn't exists
    if(!userMessages || userMessages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or has no messages",
        },
        { status: 401 }
      );
    }

		// Return the messages
    return NextResponse.json(
      {
        success: true,
        messages: userMessages[0].messages,
      },
      { status: 200 }
    );
	} catch (error) {
		console.log("An unexpected error occured ", error)
		return NextResponse.json(
			{
				success: false,
				message: "Unexpected error occured",
			},
			{ status: 500 }
		);
	}
}
