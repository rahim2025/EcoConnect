import { axiosInstance } from "./axios";
import toast from "react-hot-toast";

export const seedBadges = async () => {
  try {
    const response = await axiosInstance.post("/admin/seed-badges");
    toast.success(response.data.message);
    return true;
  } catch (error) {
    console.error("Failed to seed badges:", error);
    toast.error("Failed to seed badges");
    return false;
  }
};
