"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface RecordData {
  text: string;
  amount: number;
  date: string;
}

interface RecordResult {
  data?: RecordData;
  error?: string;
}

const addSleepRecord = async (formData: FormData): Promise<RecordResult> => {
  const textValue = formData.get("text");
  const amountValue = formData.get("amount");
  const dateValue = formData.get("date");

  if (
    !textValue ||
    textValue === "" ||
    !amountValue ||
    amountValue === "" ||
    !dateValue ||
    dateValue === ""
  ) {
    return { error: "Text, Amount and Date are required fields." };
  }

  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());
  let date: string;

  try {
    date = new Date(dateValue.toString()).toISOString();
  } catch (error) {
    console.error("Invalid date format:", error);
    return { error: "Invalid date format." };
  }
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const existingRecord = await db.record.findFirst({
      where: {
        userId,
        date: date,
      },
    });

    let recordData: RecordData;

    if (existingRecord) {
      const updatedRecord = await db.record.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          text,
          amount,
        },
      });

      recordData = {
        text: updatedRecord.text,
        amount: updatedRecord.amount,
        date: updatedRecord.date?.toISOString() || date,
      };
    } else {
      const createRecord = await db.record.create({
        data: {
          text,
          amount,
          date,
          userId,
        },
      });
      recordData = {
        text: createRecord.text,
        amount: createRecord.amount,
        date: createRecord.date?.toISOString() || date,
      };
    }

    revalidatePath("/");
    return { data: recordData };
  } catch (error) {
    console.error("Error adding sleep record:", error); // Log the error
    return {
      error: "An unexpected error occurred while adding the sleep record.",
    };
  }
};

export default addSleepRecord;
