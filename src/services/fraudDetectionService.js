import { clinicService } from './clinicService';

export const fraudDetectionService = {
  calculateFraudRisk: async (transactionProvider) => {
    try {
      // Fetch verified clinics memory cache (or direct query)
      const clinics = await clinicService.getVerifiedClinics();
      
      // Convert to lowercase for loose matching
      const providerStr = transactionProvider.toLowerCase().trim();
      
      const matchedClinic = clinics.find(c => c.name.toLowerCase() === providerStr);
      
      if (matchedClinic) {
        if (matchedClinic.verified) {
          return 'LOW RISK';
        } else {
          return 'MEDIUM RISK';
        }
      }
      
      // If provider not found in system network at all
      return 'HIGH RISK';
      
    } catch (err) {
      console.error('Error calculating fraud risk:', err);
      // Fallback to unknown medium risk if DB fails
      return 'MEDIUM RISK';
    }
  }
};
