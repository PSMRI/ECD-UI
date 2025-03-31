// src/app/models/video-consultation.model.ts
export enum ConsentStatus {
    PENDING = 'PENDING',
    AGREED = 'AGREED',
    DECLINED = 'DECLINED'
  }
  
  export enum LinkStatus {
    NOT_SENT = 'NOT_SENT',
    SENT = 'SENT',
    FAILED = 'FAILED'
  }
  
  export enum ConsultationStatus {
    NOT_INITIATED = 'NOT_INITIATED',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED'
  }
  
  export interface VideoConsultation {
    beneficiaryId: string;
    consentStatus: ConsentStatus;
    linkStatus: LinkStatus;
    linkReceiptConfirmed: boolean;
    consultationStatus: ConsultationStatus;
    videoLink?: string;
  }