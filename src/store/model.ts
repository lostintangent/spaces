import { SessionType } from "./actions";

export interface IStore {
	isLoading: boolean;
	activeSession?: ISession;
	communities: ICommunity[]
}

export interface IMember {
	name: string;
	email: string;
	status: Status;
}

export interface ISession {
	id: string;
	host: string;
	startTime: Date;
	description: string;
	url: string;
	type: SessionType;
}

export interface ICommunity {
    isLoading?: boolean;
	isLeaving?: boolean;
	isExpanded?: boolean;
	name: string;
	members: IMember[],
	helpRequests: ISession[],
	codeReviews: ISession[],
	broadcasts: ISession[]
}

export enum Status {
	available = "available",
	away = "away",
	doNotDisturb = "doNotDisturb",
	offline = "offline"
};