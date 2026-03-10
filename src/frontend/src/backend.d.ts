import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: string;
    timestamp: Time;
}
export interface GameScore {
    user: Principal;
    score: bigint;
    timestamp: Time;
    gameName: string;
}
export type Time = bigint;
export interface UserProfile {
    created: Time;
    principal: Principal;
    lastReset: Time;
    tier: string;
    tokenBalance: bigint;
}
export interface ImageRequest {
    style: string;
    timestamp: Time;
    prompt: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addImageRequest(prompt: string, style: string): Promise<void>;
    addMessage(role: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    consumeTokens(amount: bigint, _actionName: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getHistory(): Promise<Array<Message>>;
    getImageHistory(): Promise<Array<ImageRequest>>;
    getTopScores(gameName: string): Promise<Array<GameScore>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(): Promise<void>;
    resetMonthlyTokens(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveScore(gameName: string, score: bigint): Promise<void>;
    upgradeToPremium(): Promise<void>;
}
