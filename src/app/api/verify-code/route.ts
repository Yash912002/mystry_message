import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";
// import { z } from "zod";
// import { userNameValidation } from "@/schemas/signupSchema";

export async function POST(request: Request) {
	try {
		// Connect to the db
		await dbConnection();

		// extract username and code from request body
		const { username, code } = await request.json();

		// Decode the username
		const decodedUsername = decodeURIComponent(username);

		// Find the username in the db
		const user = await UserModel.findOne({ username: decodedUsername });

		// Return error, if user not found.
		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 500 }
			);
		}

		// Check if the code is valid or not
		const isCodeValid = user.verifyCode === code;

		// Check if the code is expired or not
		const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

		// If the code is both correct and not expired then
		// verify the user and save it in the database.
		if (isCodeValid && isCodeNotExpired) {
			user.isVerified = true;
			await user.save();

			//* Return success response
			return NextResponse.json(
				{
					success: true,
					message: "Account verified",
				},
				{ status: 200 }
			);
		}
		//! Return error, if code is expired
		 else if (!isCodeNotExpired) {
			return NextResponse.json(
				{
					success: false,
					message: "Verification Code has expired. Please sign up again",
				},
				{ status: 400 }
			);
		} 
		//! Return error, if verification code is incorrect. 
		else {
			return NextResponse.json(
				{
					success: false,
					message: "Incorrect verification code",
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error verifying User", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error verifying User",
			},
			{ status: 500 }
		);
	}
}
