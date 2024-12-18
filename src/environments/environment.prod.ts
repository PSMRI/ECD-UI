/* 
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/


const ecdIP = 'https://amritwprdev.piramalswasthya.org/';
const commonIP = 'https://amritwprdev.piramalswasthya.org/';
const adminIP = 'https://amritwprdev.piramalswasthya.org/';
const COMMON_API = `${commonIP}commonapi-ecd-jwt/`;
const ADMIN_API = `${adminIP}adminapi-v3.0.0/`;
const ECD_API = `${ecdIP}ecdapi-v3.0.0/`;
const biologicalScreeningDeviceAPI = `${ADMIN_API}diagnostics/biologicalScreeningDevice`; 
const sessionStorageEncKey = '<>';

export const environment = {
  production: true,
  encKey: sessionStorageEncKey,
  ioturl: `${biologicalScreeningDeviceAPI}`,
  extendSessionUrl: `${ECD_API}common/extend/redisSession`,
  language: 'English',
  licenseUrl: `${COMMON_API}license.html`,

  getSecurityQuestionURL: `${COMMON_API}user/getsecurityquetions`,
  getLoginURL: `${COMMON_API}user/userAuthenticate`,
  userLogoutPreviousSessionUrl: `${COMMON_API}user/logOutUserFromConcurrentSession`,
  setForgotPasswordURL: `${COMMON_API}user/setForgetPassword`,
  saveUserQuestionAns: `${COMMON_API}user/saveUserSecurityQuesAns`,
  validateSecQuesAnsURL: `${COMMON_API}user/validateSecurityQuestionAndAnswer`,
  forgotPasswordURL: `${COMMON_API}user/forgetPassword`,
  getSessionExistsURL: `${COMMON_API}user/getLoginResponse`,
  logoutUrl: `${COMMON_API}user/userLogout`,
  getLanguageList: `${COMMON_API}beneficiary/getLanguageList`,

  /* Supervisor Urls */
  getCallConfigsUrl: `${ECD_API}callConfiguration/getByPSMId/`,

  createCallConfigurationUrl: `${ECD_API}callConfiguration/create`,
  updateCallConfigurationUrl: `${ECD_API}callConfiguration/update`,
  getUnallocatedCallsUrl: `${ECD_API}callAllocation/getEligibleRecordsInfo`,
  getAllocateCallsUrl: `${ECD_API}callAllocation/allocateCalls`,
  deleteReallocationUrl: `${ECD_API}callAllocation/moveToBin`,
  getAllocatedCountUrl: `${ECD_API}callAllocation/getAllocatedCallCountUser`,
  updateRealloateCallsUrl: `${ECD_API}callAllocation/reAllocateCalls`,


  saveQuestionnaireUrl: `${ECD_API}Questionnaire/createQuestionnaires`,
  getQuestionnaireUrl: `${ECD_API}Questionnaire/getQuestionnairesByPSMId`,
  updateQuestionnaireUrl: `${ECD_API}Questionnaire/updateQuestionnaire`,
  getDataUploadURL: `${ECD_API}uploadRCHData`,
  getUploadTemplateURL: `${ECD_API}dataTemplate/uploadTemplate`,
  getDownloadTemplateURL: `${ECD_API}dataTemplate/downloadTemplate`,
  createParentChildMappingURL:`${ECD_API}Questionnaire/createQuestionnairesMap`,
  getQuestionnairesForMappingURL:`${ECD_API}Questionnaire/getQuestionnaires`,
  getMappedQuestionsURL:`${ECD_API}Questionnaire/getMappedParentChildQuestionnaire`,
  updateParentChildMappingURL:`${ECD_API}Questionnaire/editQuestionnairesMap`,


  // supervisor - section configuration Urls
  getSectionConfigurationsUrl: `${ECD_API}Questionnaire/getSectionsByProvider/`,
  getAlertsNotificationUrl: `${COMMON_API}notification/getSupervisorNotification`,
  getNotificationTypeUrl: `${COMMON_API}notification/getNotificationType`,
  createSuprSectionConfigurationUrl: `${ECD_API}Questionnaire/createSections`,
  updateSuprSectionConfigurationUrl: `${ECD_API}Questionnaire/updateSection`,

  getQuestionnaireTypeUrl: `${ECD_API}master/getQuestionnaireType`,
  getAnswerTypeUrl: `${ECD_API}master/getAnswerType`,
  getRolesURL: `${COMMON_API}user/getRolesByProviderID`,
  getOfficesFromRoleURL: `${COMMON_API}user/getLocationsByProviderID`,
  updateNotificationURL: `${COMMON_API}notification/updateNotification`,
  createNotificationURL: `${COMMON_API}notification/createNotification`,
  getSupervisorNotificationsURL: `${COMMON_API}notification/getSupervisorNotification`,
  forceUserLogoutURL: `${COMMON_API}user/forceLogout`,
  publishAlertURL: `${COMMON_API}alerts/publishAlerts`,
  publishNotificationURL: `${COMMON_API}notifications/publishNotifications`,
  publishLocationMessagesURL: `${COMMON_API}locationMessages/publishLocationMessage`,
  getDateWiseAuditorWorklistUrl:  `${ECD_API}qualityAudit/getQualityAuditorWorklistDatewise`,

  saveQuestionnaireSectionMappingUrl: `${ECD_API}Questionnaire/mapQuestionnairesAndSection`,
  updateQuestionnaireSectionMappingUrl: `${ECD_API}Questionnaire/editQuestionnaireSectionMap`,
  getSectionMastersUrl: `${ECD_API}Questionnaire/getSectionsByProvider`,
  getSectionQuestionnaireMapUrl: `${ECD_API}Questionnaire/getQuestionnairesAndSectionMapByProvider`,
  getAuditSectionMapUrl: `${ECD_API}sectionConfiguration/getByPSMId`,
  getUnMappedQuestionnairesUrl: `${ECD_API}Questionnaire/getUnMappedQuestionnaires`,
  getSMSTypeUrl: `${ECD_API}get/smsType`,
  getAutoPreviewDialingUrl: `${ECD_API}get/call/isAutoPreviewDialing`,
  createCallSectionMappingUrl: `${ECD_API}callConfiguration/mapCallAndSection`,
  getMappedSectionsUrl: `${ECD_API}callConfiguration/getCallAndSectionMapByPsmIdAndCallConfigId/`,
  getSectionsUrl: `${COMMON_API}callConfiguration/callConfiguration`,
  dialPreferenceURL: `${ECD_API}autoPreviewDialing/addDialPreference`,
  fetchDialPreferenceUrl: `${ECD_API}autoPreviewDialing/getDialPreference`,

  getLocationsURL: `${COMMON_API}user/getLocationsByProviderID`,
  
  /**Quality Supervisor Urls */
  getCentreOverallQualityRatingUrl: `${ECD_API}charts/getCentreOverallQualityRating/`,
  getSkillSetQualityRatingUrl: `${ECD_API}charts/getActorWiseQualityRatings/`,
  getCustomerSatisfactionUrl: `${ECD_API}charts/getCSatScoreByPSMIdAndFrequency`,
  getTenureWiseQualityRatingUrl: `${ECD_API}charts/getTenureWiseQualityRating/`,
  getNumberOfAgentScoreUrl: `${ECD_API}charts/getGradeWiseAgentCount/`,
  getRoleMasterUrl: `${ECD_API}master/getRolesByPsmId`,
  getOfficeMasterUrl: `${ECD_API}master/getOfficesByPSMID`,
  getFrequencyMasterUrl: `${ECD_API}master/getFrequency`,
  getAuditorMastersUrl: `${ECD_API}get/getAuditorByPSMId`,
  getRoleMastersUrl: `${ECD_API}master/getRolesByPsmId`,
  saveQualityAuditorAgentUrl: `${ECD_API}agentQualityAuditorMap/create`,
  updateQualityAuditorAgentUrl: `${ECD_API}agentQualityAuditorMap/update`,
  getAgentMappedDataUrl:`${ECD_API}agentQualityAuditorMap/getByPSMId`,
  saveGradesUrl:`${ECD_API}gradeConfiguration/create`,
  updateGradeConfigurationUrl:`${ECD_API}gradeConfiguration/update`,
  getGradeMastersUrl:`${ECD_API}master/getGrades`,
  getQuestionnaireDataUrl: `${ECD_API}questionnaireConfiguration/getByPSMId`,
  updateQuestionConfigurationUrl: `${ECD_API}questionnaireConfiguration/update`,
  saveQuestionConfigurationUrl: `${ECD_API}questionnaireConfiguration/create`,
  getOfficeMasterDataUrl: `${ADMIN_API}m/location/getAlllocationNew`,

  createSectionConfigurationUrl: `${ECD_API}sectionConfiguration/create`,
  updateSectionConfigurationUrl: `${ECD_API}sectionConfiguration/update`,
  deleteSectionConfigurationUrl: `${ECD_API}callConfigurationController/put/configuration`,
  qualitySupervisorReportURL: `${ECD_API}callConfigurationController/put/configuration`,

  /**Quality Auditor Urls */
  getAuditorWorklistUrl: `${ECD_API}qualityAudit/getQualityAuditorWorklist`,
  getLanguageMasterUrl:  `${ECD_API}master/getLanguage`, 
  getLanguageMasterByUserIdUrl:  `${ECD_API}master/getLanguageByUserId/`, 
  getQualityAuditGradesByPsmIdUrl: `${ECD_API}qualityAudit/getQualityAuditGradesByPSMID/`,
  getQuesSecForQualityUrl: `${ECD_API}qualityAudit/getQuestionSectionForCallRatings/`,
  saveQualityRatingsUrl: `${ECD_API}qualityAudit/saveCallQualityRatings`,
  getBenCallRatingsUrl: `${ECD_API}qualityAudit/getCallQualityRatings/`,
  getCallRecordingUrl: `${COMMON_API}call/getFilePathCTI`,
  updateQualityRatingsUrl: `${ECD_API}qualityAudit/call-reaudit`,

  getAlertsAndNotificatonsUrl: `${COMMON_API}notification/getAlertsAndNotificationDetail`,
  getAlertsAndNotificatonsCountUrl: `${COMMON_API}notification/getAlertsAndNotificationCount`,
  deleteAlertNotifLocMsgsUrl: `${COMMON_API}notification/markDelete`,
  changeNotificationStatusUrl: `${COMMON_API}notification/changeNotificationStatus`,

  getMappedGradeURL:`${ECD_API}gradeConfiguration/getByPSMId`,
  getCycleMastersUrl:`${ECD_API}master/getCycles`,
  saveSampleUrl:`${ECD_API}sampleSelectionConfiguration/create`,
  getMappedCycleURL:`${ECD_API}sampleSelectionConfiguration/getByPSMId`,
  updateCycleConfigurationURL:`${ECD_API}sampleSelectionConfiguration/update`,
  getAgentMastersUrl:`${ECD_API}master/getAgentsByRoleId`,
  getCaseSheetDataURL:`${ECD_API}qualityAudit/getBeneficiaryCasesheet`,
  /** Associate-anm-mo Urls */
  getAgentAuditScoreUrl: `${ECD_API}autoPreviewDialing/getRatingsByUserIdAndPsmId`,
  updateCallClosureUrl:`${ECD_API}closure/closeCall`,
  saveBenCallDetails:`${ECD_API}callHistory/saveBenCallDetails`,
  getAgentMasterDataUrl: `${ECD_API}get/masterData`,
  getAgentAutoPreviewDialingUrl:`${ECD_API}autoPreviewDialing/getAutoPreviewDialingByUserIdAndRoleIdAndPsmId`,
  getCallAnsweredVerifiedCount:`${ECD_API}agent/get-call-statistics`,
  getBenHistoryURL: `${COMMON_API}cti/getAgentCallStats`,
  getBenHrpHrniDetailsUrl: `${ECD_API}callHistory/getHrpHrniDetails?`,
  getBeneficiaryQuestionnaire: `${ECD_API}Questionnaire/getQuesAndSecMapAssociateByProvider/`,
  saveBenQuestionnaireResponseUrl: `${ECD_API}callHistory/create/beneficiaryQuestionnaireResponse`,
  getMotherOutboundWorkListUrl:`${ECD_API}outbound-worklist/get-mother-data`,
  getChildOutboundWorkListUrl:`${ECD_API}outbound-worklist/get-child-data`,
  updateCommonCallClosureUrl:`${COMMON_API}call/closeCall`,
  patchBenHistoryURL: `${COMMON_API}cti/getAgentCallStats`,
  getCallTypesUrl:`${COMMON_API}call/getCallTypes`,
  getNoFurtherCallsReasonUrl:`${ECD_API}master/getNoFurtherCallsReason`,
  getReasonsOfNotCallAnsweredUrl:`${ECD_API}master/getCallNotAnswered`,
  getTypeOfComplaintsUrl:`${ECD_API}master/getTypeOfComplaints`,
  getHrpReasonMasterUrl:`${ECD_API}master/getHRPReasons`,
  getHrniReasonMasterUrl:`${ECD_API}master/getHRNIReasons`,
  getCongentialAnomaliesMasterUrl:`${ECD_API}master/getCongenitalAnomalies`,

  getBeneficiaryCallHistoryUrl:`${ECD_API}callHistory/getBeneficiaryCallHistory`,
  getCallHistoryDetailsUrl:`${ECD_API}callHistory/getBeneficiaryCallDetails`,
  /**CTI Urls */
  ctiUrl: `http://192.168.45.55/`,
  ctiEventUrl: `bar/cti_handler.php?e=`,
  getLoginKeyUrl:`${COMMON_API}cti/getLoginKey`,
  getAgentsDataUrl: `${ECD_API}master/getAgentsByRoleId`,
  getAgentState:`${COMMON_API}cti/getAgentState`,
  getCallStatistics:`${COMMON_API}cti/getAgentCallStats`,
  getAgentIpAddressUrl:`${COMMON_API}cti/getAgentIPAddress`,
  getWrapupTimeUrl:`${COMMON_API}user/role`,
  callBeneficiaryManualUrl: `${COMMON_API}cti/callBeneficiary`,
  getDisconnectCallUrl:`${COMMON_API}cti/disconnectCall`,
  agentCtiLogOutUrl:`${COMMON_API}cti/doAgentLogout`,


  // SMSTenplateURLS
  getSMStemplates_url:`${COMMON_API}sms/getSMSTemplates`,
  getSMStypes_url:`${COMMON_API}sms/getSMSTypes`,
  sendSMS_url:`${COMMON_API}sms/sendSMS`,
  // SMSTenplateURLS
  saveSMStemplate_url: `${COMMON_API}sms/saveSMSTemplate`,
  updateSMStemplate_url: `${COMMON_API}sms/updateSMSTemplate`,
  getSMSparameters_url: `${COMMON_API}sms/getSMSParameters`,
  getFullSMSTemplate_url: `${COMMON_API}sms/getFullSMSTemplate`,

  getSMSTypesURL: `${ECD_API}master/getSMSTypes`,
  getSMSParamsURL: `${ECD_API}master/getSMSParameters`,
  getSMSValuesURL: `${ECD_API}master/getSMSValues`,
  getListOfMapQuestionaireConfigurationUrl:`${ECD_API}questionnaireConfiguration/getByPSMId`,


  /**Demographic Masters */
  getStatesMasterUrl: `${COMMON_API}location/states`,
  getDistrictMasterUrl: `${COMMON_API}location/districts`,
  getBlockMasterUrl: `${COMMON_API}location/taluks`,
  getVillageMasterUrl: `${COMMON_API}location/village`,

  /**Beneficiary Registration & Update Url */
  registerBeneficiaryUrl:`${ECD_API}beneficary/registration`,
  updateBeneficiaryUrl:`${ECD_API}beneficary/updateBeneficiaryDetails`,

  /** Gender Master */
  getGenderMasterUrl:`${ECD_API}master/getGender`,
  
 // Reports 
downloadCumulativeReportURL:`${ECD_API}ecdReportController/getECDCumulativeDistrictReport`,
downloadCallDetailReportURL:`${ECD_API}ecdReportController/getECDCallDetailsReport`,
downloadCallSummaryReportURL:`${ECD_API}ecdReportController/getECDCallSummaryReport`,
downloadBenificiaryWiseReportURL:`${ECD_API}ecdReportController/getECDBeneficiarywisefollowupdetailsReport`,
downloadCallUniqueReportURL: `${ECD_API}ecdReportController/getECDCallDetailReportUnique`,
downloadBirthDefectReportURL: `${ECD_API}ecdReportController/getECDBirthDefectReport`,
downloadAashaHomeReportURL: `${ECD_API}ecdReportController/getECDAashaHomeVisitGapReport`,
downloadCalciumIfaReportURL: `${ECD_API}ecdReportController/getECDCalciumIFATabNonadherenceReport`,
downloadAbsenceVhsndReportURL: `${ECD_API}ecdReportController/getECDAbsenceInVHSNDReport`,
downloadVaccineDropoutReportURL: `${ECD_API}ecdReportController/getECDVaccineDropOutIdentifiedReport`,
downloadVaccineLeftoutReportURL:`${ECD_API}ecdReportController/getECDVaccineLeftOutIdentifiedReport`,
downloadDevDelayReportURL: `${ECD_API}ecdReportController/getECDDevelopmentalDelayReport`,
downloadAbortionReportURL:`${ECD_API}ecdReportController/getECDAbortionReport`,
downloadDeliveryStatusReportURL:`${ECD_API}ecdReportController/getECDDeliveryStatusReport`,
downloadHrpwCasesReportURL: `${ECD_API}ecdReportController/getECDHRPCasesIdentifiedReport`,
downloadInfantHighRiskReportURL:`${ECD_API}ecdReportController/getECDInfantsHighRiskReport`,
downloadMaternalDeathReportURL:`${ECD_API}ecdReportController/getECDMaternalDeathReport`,
downloadStillBirthReportURL: `${ECD_API}ecdReportController/getECDStillBirthReport`,
downloadBabyDeathReportURL:`${ECD_API}ecdReportController/getECDBabyDeathReport`,
downloadNotConnectedReportURL:`${ECD_API}ecdReportController/getECDNotConnectedPhonelistDiffformatReport`,
downloadJsyReportURL: `${ECD_API}ecdReportController/getECDJSYRelatedComplaintsReport`,
downloadMiscarriageReportURL:`${ECD_API}ecdReportController/getECDMiscarriageReport`,

};