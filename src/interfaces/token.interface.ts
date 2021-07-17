export interface TokenAuthenticateData {
	token: string;
	expiresIn: number;
	refreshToken: string;
}

export interface TokenResetPasswordData {
	token: string;
	expiresIn: number;
}

export interface AuthenticateDataStoredIntoken {
	id: string;
	type: string;
}