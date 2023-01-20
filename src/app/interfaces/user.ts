export interface User {
    username: string;
    alias: string;
    image: string | null;
    email: string;
    password: string;
    creationDate: Date | null;
    activated: boolean;
    isUploader: boolean; //* Can upload Manga
    isCreator: boolean; //* Can upload their own Manga
    isPro: boolean; //* Subscription
    lastLogin: Date | null;
    lastPasswordChange: Date | null;
    lastEmailChange: Date | null;
    lastEmailVerificationCode: string | null;
}

export interface Session {
    username: string;
    alias: string;
    image: string | null;
    email: string;
    isUploader: boolean; //* Can upload Manga
    isCreator: boolean; //* Can upload their own Manga
    isPro: boolean; //* Subscription
}