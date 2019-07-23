export interface IStore {
	isLoading: boolean;
	networks: INetwork[]
}

export interface IContact {
	name: string;
	email: string
}

export interface INetwork {
    isLoading?: boolean;
    isLeaving?: boolean;
	name: string;
	contacts: IContact[]
}