export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface EmailCredentials {
  email: string;
  password: string;
}
