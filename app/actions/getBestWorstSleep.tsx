import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const getBestWorstSleep = async (): Promise<{
  bestSleep?: number;
  worstSleep?: number;
  error?: string;
}> => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
      select: { amount: true },
    });

    if (!records || records.length === 0) {
      return { bestSleep: 0, worstSleep: 0 }; // Return 0 if no records exist
    }

    const amounts = records.map((record) => record.amount);

    const bestSleep = Math.max(...amounts);
    const worstSleep = Math.min(...amounts);

    return { bestSleep, worstSleep };
  } catch (error) {
    console.error("Error fetching sleep amounts:", error); // Log the error
    return { error: "Database error" };
  }
};

export default getBestWorstSleep;
