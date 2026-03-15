// This service simulates an AI-powered OCR extraction system for medical bills

export const aiService = {
  extractBillDetails: async (file) => {
    // In a real application, this would send the file to an OCR / AI endpoint
    // For this prototype, we simulate a network delay and return structured mock data
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random mock extraction for demonstration purposes
        const mockProviders = ['Apollo Clinic Pune', 'Ruby Hall Clinic', 'Dr Lal PathLabs', 'CityCare Diagnostics', 'Unknown Local Pharmacy'];
        const mockTreatments = ['Blood Test & Diagnostics', 'General Physician Consultation', 'Dental X-Ray', 'Prescription Medication', 'Physical Therapy Session'];
        
        const randomProvider = mockProviders[Math.floor(Math.random() * mockProviders.length)];
        const randomTreatment = mockTreatments[Math.floor(Math.random() * mockTreatments.length)];
        const randomAmount = Math.floor(Math.random() * 5000) + 500;
        
        const extractedData = {
          provider: randomProvider,
          description: randomTreatment,
          amount: randomAmount,
          date: new Date().toISOString().split('T')[0],
          confidence: Math.floor(Math.random() * 20) + 80 // 80-99% confidence
        };
        
        resolve(extractedData);
      }, 1500); // 1.5s simulated processing time
    });
  }
};
