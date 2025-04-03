import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchUserActivities = async () => {
  const response = await axios.get('/api/applications/my_activities/');
  return response.data;
};