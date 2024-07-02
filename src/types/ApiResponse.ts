import { Message } from "@/model/user.model";

export interface ApiResponse {
	message: string;
	success: boolean;
	isAcceptingMessages?: boolean;
	messages?: Array<Message>;
}
