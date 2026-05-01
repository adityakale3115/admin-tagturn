import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";


/* ================= REGISTER VENDOR ================= */
export const registerVendor = async (email, password, shopName) => {
  if (!email || !password || !shopName) {
    throw new Error("All fields are required");
  }

  // 1️⃣ Create Auth user
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // 2️⃣ Save vendor profile (pending approval)
  await setDoc(doc(db, "vendors", user.uid), {
    uid: user.uid, // Good practice to store the UID inside the doc as well
    shopName,
    email,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // 3️⃣ Logout after registration so they don't auto-access the dashboard
  await signOut(auth);

  return user;
};

/* ================= LOGIN ================= */
export const loginVendor = async (email, password) => {
  // 1️⃣ Authenticate the user with Firebase Auth
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // 2️⃣ Fetch the vendor's document from Firestore
  const vendorRef = doc(db, "vendors", user.uid);
  const vendorSnap = await getDoc(vendorRef);

  // 3️⃣ Verify if the record exists
  if (!vendorSnap.exists()) {
    await signOut(auth); // Clean up the session
    throw new Error("USER_NOT_FOUND");
  }

  const vendorData = vendorSnap.data();

  // 4️⃣ Status Gatekeeping
  if (vendorData.status === "pending") {
    await signOut(auth); // Force logout unapproved users
    throw new Error("PENDING_APPROVAL");
  }

  if (vendorData.status === "rejected") {
    await signOut(auth); // Force logout rejected users
    throw new Error("REJECTED");
  }

  // If status is "approved", return the user object
  return user;
};

/* ================= LOGOUT ================= */
export const logoutVendor = async () => {
  await signOut(auth);
};


export const forgotPassword = async (email) => {
  if (!email) {
    throw { message: "Please enter your email" };
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};