export interface IStore {
	isLoading: boolean;
	communities: ICommunity[]
}

export interface IMember {
	name: string;
	email: string;
	status: Status;
}

export interface ISession {
	host: IMember,
	startTime: Date,
	category: string,
	description: string,
	url: string
}

export interface ICommunity {
    isLoading?: boolean;
    isLeaving?: boolean;
	name: string;
	members: IMember[],
	helpRequests: ISession[],
	broadcasts: ISession[]
}

export enum Status {
	available = "available",
	away = "away",
	doNotDisturb = "doNotDisturb",
	offline = "offline"
};