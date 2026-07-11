import { z } from "zod";
export const imageMetadataSchema=z.object({mimeType:z.enum(["image/jpeg","image/png","image/webp"]),sizeBytes:z.number().int().positive().max(8*1024*1024),width:z.number().int().min(320).max(5000),height:z.number().int().min(320).max(5000)});
export function validateImageMetadata(input:unknown){ return imageMetadataSchema.safeParse(input); }
