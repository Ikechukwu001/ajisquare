import "server-only";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/admin";

// Only admin login code imports this file
export const adminAuth = () => getAuth(getAdminApp());