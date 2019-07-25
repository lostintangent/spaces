export interface IStore {
	isLoading: boolean;
	communities: ICommunity[]
}

export interface IMember {
	name: string;
	email: string;
	status: Status;
}

export interface ICommunity {
    isLoading?: boolean;
    isLeaving?: boolean;
	name: string;
	members: IMember[]
}

export enum Status {
	available = "available",
	away = "away",
	doNotDisturb = "doNotDisturb",
	offline = "offline"
};