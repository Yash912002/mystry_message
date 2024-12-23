import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";
// import { z } from "zod";
// import { userNameValidation } from "@/schemas/signupSchema";

export async function POST(request: Request) {
	try {
		await dbConnection();
		const { username, code } = await request.json();

		const decodedUsername = decodeURIComponent(username);

		const user = await UserModel.findOne({ username: decodedUsername });

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 500 }
			);
		}

		const isCodeValid = user.verifyCode === code;

		const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

		if (isCodeValid && isCodeNotExpired) {
			user.isVerified = true;
			await user.save();

			return NextResponse.json(
				{
					success: true,
					message: "Account verified",
				},
				{ status: 200 }
			);
		} else if (!isCodeNotExpired) {
			return NextResponse.json(
				{
					success: false,
					message: "Verification Code has expired. Please sign up again",
				},
				{ status: 400 }
			);
		} else {
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
