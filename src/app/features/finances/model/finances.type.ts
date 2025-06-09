export interface CampaignData {
    id: string;
    title: string;
    organization: string;
    description: string;
    currentAmount: number;
    targetAmount: number;
    percentageCollected: number;
    contributors: number;
    daysRemaining: number;
    imageUrl: string;
  }