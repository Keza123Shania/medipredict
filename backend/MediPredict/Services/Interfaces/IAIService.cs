using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;

namespace MediPredict.Services.Interfaces
{
    public interface IAIService
    {
        Task<List<Symptom>> GetAllSymptomsAsync();
        Task<List<Disease>> GetDiseasesBySymptomsAsync(List<Guid> symptomIds);
        Task<Guid> CreateSymptomEntryAsync(Guid patientId, SymptomEntryViewModel model);
        Task<List<AIPrediction>> GetPredictionsForSymptomEntryAsync(Guid symptomEntryId);
        Task<List<SymptomEntry>> GetPatientSymptomHistoryAsync(Guid patientId, int page = 1, int pageSize = 10);

        Task<List<AIPrediction>> GeneratePredictionsAsync(Guid symptomEntryId, List<string> symptomNames);
    }
}