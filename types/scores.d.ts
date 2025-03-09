export interface ScoreUser {
  id: string;
  username: string;
}


export interface ScoreRecord {
  value: number;
  user: ScoreUser;
}

export interface RankedScore extends ScoreRecord {
  rank: number;
}

export interface ScoresResponse {
  totalPlayers: number;
  scores: RankedScore[];
}


