import { analyticsService } from './analyticsService';
import { historyService } from './historyService';

export const reportService = {
  generateHealthReport: async (userId, userName) => {
    try {
      // Fetch aggregated analytical data
      const insights = await analyticsService.getEmployeeInsights(userId);
      const history = await historyService.getUserMedicalHistory(userId);
      
      let reportContent = `=================================================\n`;
      reportContent += `              HEALIO HEALTH REPORT               \n`;
      reportContent += `=================================================\n`;
      reportContent += `Patient: ${userName || 'User'}\n`;
      reportContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
      
      reportContent += `--- ANALYTICS SUMMARY ---\n`;
      reportContent += `Total Health Spend (YTD): ₹${insights.totalSpend}\n`;
      reportContent += `Medical Consultations: ${insights.consultationCount}\n`;
      reportContent += `Diagnostic Tests: ${insights.diagnosticsCount}\n`;
      reportContent += `Most Visited Provider: ${insights.mostVisitedProvider || 'N/A'}\n`;
      if (insights.preventiveRecommendation) {
        reportContent += `\n>> PREVENTIVE RECOMMENDATION: ${insights.preventiveRecommendation}\n`;
      }
      reportContent += `\n`;
      
      reportContent += `--- DETAILED LIFETIME MEDICAL HISTORY ---\n`;
      if (history.length === 0) {
        reportContent += `No medical history found on the Healio platform.\n`;
      } else {
        history.forEach(item => {
          reportContent += `\n[${new Date(item.date).toLocaleDateString()}] ${item.type.toUpperCase()}: ${item.title}\n`;
          reportContent += `   Provider/Hospital: ${item.provider}\n`;
          reportContent += `   Amount: ₹${item.amount}\n`;
          if (item.status) reportContent += `   Status: ${item.status}\n`;
        });
      }
      
      // Create and trigger download via virtual anchor
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Healio_Health_Report_${userName?.replace(/\s+/g, '_') || 'User'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Failed to generate report', err);
      return false;
    }
  }
};
