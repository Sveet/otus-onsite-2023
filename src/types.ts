
export type User = {
  id: string;
  stage: number;
  created?: Date;
  updated?: Date;
};

export type ChallengeParams = {
  stage: number;
  url: string;
}