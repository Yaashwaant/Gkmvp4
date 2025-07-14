import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      return {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      };
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
