// Tournament Registration Types
export enum TournamentRegistrationType {
  Free = 0,
  PaidPoints = 1,
  PaidGems = 2,
  PaidDiamonds = 3,
  InviteOnly = 4,
}

// Tournament Status
export enum TournamentStatus {
  Published = 0,
  Register = 1,
  Started = 2,
  Finalizing = 3,
  Finished = 4,
  Cancelled = 5,
}

// Tournament Registration Status
export enum TournamentRegistrationStatus {
  Registered = 0,
  InsufficientBalance = 1,
  TournamentFull = 2,
  AlreadyRegistered = 3,
  RegistrationClosed = 4,
  SegmentMismatch = 5,
  TournamentCancelled = 6,
  InviteRequired = 7,
  Failed = 99,
}

// Tournament Prize Type
export enum TournamentPrizeType {
  Points = 0,
  Bonus = 1,
  Manual = 2,
  RealMoney = 3,
  FreeSpins = 4,
  Custom = 99,
}

// Tournament Ribbon Type
export enum TournamentRibbonType {
  None = 0,
  Sale = 1,
  Hot = 2,
  New = 3,
  Vip = 4,
  Custom = 99,
}

// Tournament Prize
export interface TournamentPrize {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  placeFrom: number;
  placeTo: number;
  prizeType: TournamentPrizeType;
  pointValue: number | null;
  placeRangeDisplay: string;
}

// Tournament Participant (for leaderboard)
export interface TournamentParticipant {
  publicUsername: string;
  avatarUrl: string | null;
  position: number;
  score: number;
  externalUserId: string | null;
  crmBrandId: string | null;
  userId: string | null;
}

// Main Tournament interface
export interface Tournament {
  instanceId: number;
  tournamentId: number;
  name: string;
  description: string;
  primaryImage: string | null;
  secondaryImage: string | null;
  mobileImage: string | null;
  prizePoolSummary: string | null;
  customPriceText: string | null;
  startTime: number;
  endTime: number;
  registrationType: TournamentRegistrationType;
  registrationCost: number | null;
  registrationCount: number;
  minPlayers: number | null;
  maxPlayers: number | null;
  status: TournamentStatus;
  isActive: boolean;
  isFinished: boolean;
  isCancelled: boolean;
  canRegister: boolean;
  isUserRegistered: boolean;
  ribbon: TournamentRibbonType | null;
  priority: number;
  section: string | null;
  minimumQualifyingScore: number | null;
  hideLeaderboardMinScores: boolean;
  segmentDontMatchMessage: string | null;
  customData: string | null;
  prizes: TournamentPrize[];
  currentUserParticipation: TournamentParticipant | null;
}

// API Response types
export interface GetTournamentsResponse {
  tournaments: Tournament[];
}

export interface RegisterTournamentResponse {
  success: boolean;
  status: TournamentRegistrationStatus;
  errorMessage: string | null;
  updatedTournament: Tournament | null;
}

export interface GetLeaderboardResponse {
  participants: TournamentParticipant[];
}

// Helper functions
export function getRegistrationTypeLabel(type: TournamentRegistrationType): string {
  switch (type) {
    case TournamentRegistrationType.Free:
      return 'Free';
    case TournamentRegistrationType.PaidPoints:
      return 'Points';
    case TournamentRegistrationType.PaidGems:
      return 'Gems';
    case TournamentRegistrationType.PaidDiamonds:
      return 'Diamonds';
    case TournamentRegistrationType.InviteOnly:
      return 'Invite Only';
    default:
      return 'Unknown';
  }
}

export function getStatusLabel(status: TournamentStatus): string {
  switch (status) {
    case TournamentStatus.Published:
      return 'Published';
    case TournamentStatus.Register:
      return 'Registration Open';
    case TournamentStatus.Started:
      return 'In Progress';
    case TournamentStatus.Finalizing:
      return 'Finalizing';
    case TournamentStatus.Finished:
      return 'Finished';
    case TournamentStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function getStatusColor(status: TournamentStatus): string {
  switch (status) {
    case TournamentStatus.Published:
    case TournamentStatus.Register:
      return 'blue';
    case TournamentStatus.Started:
      return 'green';
    case TournamentStatus.Finalizing:
      return 'yellow';
    case TournamentStatus.Finished:
      return 'gray';
    case TournamentStatus.Cancelled:
      return 'red';
    default:
      return 'gray';
  }
}

export function formatTimeRemaining(endTime: number): string {
  const now = Date.now();
  const diff = endTime - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export function formatTimeUntilStart(startTime: number): string {
  const now = Date.now();
  const diff = startTime - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h`;
  return 'Starting soon';
}
