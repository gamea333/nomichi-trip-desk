import { z } from "zod";
import { GROUP_TYPES } from "./constants";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
  trip_id: z.string().uuid("Select a trip"),
  group_type: z.enum(GROUP_TYPES, { message: "Select a group type" }),
  preferred_month: z.string().min(1, "Select a preferred month"),
  vibe_note: z.string().max(500, "Maximum 500 characters").optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const tripSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Trip name is required"),
    destination: z.string().min(1, "Destination is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    price_incl_gst: z.number().min(1000, "Minimum price is ₹1,000"),
    total_seats: z.number().min(1, "At least 1 seat required"),
    seats_left: z.number().min(0, "Cannot be negative"),
    status: z.enum(["open", "closed"]),
    description: z.string().max(300, "Maximum 300 characters").optional(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  })
  .refine((data) => data.seats_left <= data.total_seats, {
    message: "Seats left cannot exceed total seats",
    path: ["seats_left"],
  });

export type TripInput = z.infer<typeof tripSchema>;
