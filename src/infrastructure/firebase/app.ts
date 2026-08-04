import { initializeApp } from "firebase/app";
import firebaseConfig from "./config";

// Initialize Firebase (only once)
export const app = initializeApp(firebaseConfig);
