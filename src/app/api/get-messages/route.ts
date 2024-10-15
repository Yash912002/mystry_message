import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

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

	const userId = new mongoose.Types.ObjectId(user._id);

	try {
		const userMessages = await UserModel.aggregate([
			{ $match: { _id: userId } },
			{ $unwind: "$messages" },
			{ $sort: { "messages.createdAt": -1 } },
			{ $group: { _id: "$_id", messages: { $push: "$messages" } } },
		]);

    if(!userMessages || userMessages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or has no messages",
        },
        { status: 401 }
      );
    }

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
