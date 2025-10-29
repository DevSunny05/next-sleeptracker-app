"use server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const deleteRecord = async (
  recordId: string
): Promise<{
  message?: string;
  error?: string;
}> => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    await db.record.delete({
      where: {
        id: recordId,
        userId: userId,
      },
    });

    revalidatePath("/");
    return { message: "Record deleted successfully" };
  } catch (error) {
    console.error("Error deleting record:", error);
    return { error: "Database error" };
  }
};

export default deleteRecord;
