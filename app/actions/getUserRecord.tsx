"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";

const getUserRecord = async () => {
  const { userId } = await auth();

  if (!userId) {
    return { error };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
    });

    const record = records.reduce((sum, record) => sum + record.amount, 0);

    const daysWithRecords = records.filter(
      (record) => record.amount > 0
    ).length;

    return { record, daysWithRecords };
  } catch (error) {
    console.error("Error fetching user record:", error);
    return { error: "Database error" };
  }
};

export default getUserRecord;
