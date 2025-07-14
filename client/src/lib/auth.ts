import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    console.log("Starting Google sign-in with redirect...");
    await signInWithRedirect(auth, provider);
    console.log("Google sign-in redirect initiated");
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with name if provided
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
}

export async function handleRedirectResult() {
  try {
    console.log("Checking for redirect result...");
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Redirect result found:", result.user.email);
      const user = result.user;
      return {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      };
    }
    console.log("No redirect result found");
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
