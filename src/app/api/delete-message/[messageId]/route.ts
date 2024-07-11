import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";

export async function DELETE(
	request: Request,
	{ params }: { params: { messageId: string } }
) {
	const messageId = params.messageId;

	await dbConnection();

	const session = await getServerSession(authOptions);

	const user: User = session?.user as User;

	if (!session || !session.user) {
		return Response.json(
			{
				success: false,
				message: "Not Authenticated",
			},
			{ status: 401 }
		);
	}

	try {
		const updateResult = await UserModel.updateOne(
			{ _id: user._id },
			{ $pull: { messages: { _id: messageId } } }
		);

		if (updateResult.modifiedCount == 0) {
			return Response.json(
				{
					success: false,
					message: "Message not found or already deleted",
				},
				{ status: 404 }
			);
		}

		return Response.json(
			{
				success: true,
				message: "Message deleted successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.log("Error in deleting message ", error);
		return Response.json(
			{
				success: false,
				message: "Error deleting message",
			},
			{ status: 500 }
		);
	}
}
