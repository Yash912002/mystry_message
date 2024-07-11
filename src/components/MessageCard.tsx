"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Message } from "@/model/user.model";
// import { useToast } from "./ui/use-toast";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";

type MessageCardProps = {
	message: Message;
	onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
	const { toast } = useToast();

	const handleDeleteConfirm = async () => {
		try {
			const response = await axios.delete<ApiResponse>(
				`/api/delete-message/${message._id}`
			);
			toast({
				title: response.data.message,
			});
			// onMessageDelete(message._id);
			onMessageDelete(message.id);
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: "Error",
				description:
					axiosError.response?.data.message ?? "Failed to delete message",
				variant: "destructive",
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">
							<X className="w-5 h-5" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								account and remove your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={handleDeleteConfirm}>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent></CardContent>
		</Card>
	);
};

export default MessageCard;
