export type UserSession = {
    id: string;
    userId: string | null;
    csrfSecret: string;
    expiresOn: Date | null;
};
export type BaseUser = {
    provider: string;
    id: string;
    displayName: string;
    email: string | null;
    picture: string | null;
    emailVerified: boolean;
};
export type VotingToken = {
    id: string;
    pollId: string;
    movieId: number | null;
    unshared: boolean;
    unused: boolean;
    label: string;
    createdAt: Date;
};
export type Poll = {
    id: string;
    name: string;
    createdAt: Date;
    expiresOn: Date | null;
    isActive: boolean | null;
    movies: [number];
};
export type MoviePoll = {
    pollId: string;
    movieId: number;
};
