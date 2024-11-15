export interface User {
  id: string;
  name: string;
}

export interface Item {
  name: string;
  cost: number;
  paidById: string;
  // participants?: Participant[];
  participantIds?: string[];
}

export interface Transaction {
  debtorId: string;
  recipientId: string;
  owes: number;
}
