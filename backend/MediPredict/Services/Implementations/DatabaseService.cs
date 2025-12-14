using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MediPredict.Services.Implementations
{
    public interface IDatabaseService
    {
        Task<IEnumerable<T>> QueryAsync<T>(string storedProcedure, object parameters = null, int? commandTimeout = null);
        Task<T> QuerySingleAsync<T>(string storedProcedure, object parameters = null, int? commandTimeout = null);
        Task<int> ExecuteAsync(string storedProcedure, object parameters = null, int? commandTimeout = null);
        Task<SqlConnection> CreateConnectionAsync();
    }

    public class DatabaseService : IDatabaseService
    {
        private readonly string _connectionString;
        private readonly ILogger<DatabaseService> _logger;
        private const int DefaultCommandTimeout = 60; // 60 seconds

        public DatabaseService(IConfiguration configuration, ILogger<DatabaseService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string not found");
            _logger = logger;
        }

        public async Task<SqlConnection> CreateConnectionAsync()
        {
            var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            return connection;
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(string storedProcedure, object parameters = null, int? commandTimeout = null)
        {
            try
            {
                _logger.LogInformation("Executing stored procedure: {StoredProcedure} with timeout: {Timeout}s", 
                    storedProcedure, commandTimeout ?? DefaultCommandTimeout);
                
                using var connection = await CreateConnectionAsync();
                var result = await connection.QueryAsync<T>(
                    storedProcedure,
                    parameters,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: commandTimeout ?? DefaultCommandTimeout
                );
                
                _logger.LogInformation("Stored procedure {StoredProcedure} completed successfully", storedProcedure);
                return result;
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "SQL error executing stored procedure: {StoredProcedure}. Error: {ErrorMessage}", 
                    storedProcedure, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing stored procedure: {StoredProcedure}", storedProcedure);
                throw;
            }
        }

        public async Task<T> QuerySingleAsync<T>(string storedProcedure, object parameters = null, int? commandTimeout = null)
        {
            try
            {
                _logger.LogInformation("Executing stored procedure: {StoredProcedure} with timeout: {Timeout}s", 
                    storedProcedure, commandTimeout ?? DefaultCommandTimeout);
                
                using var connection = await CreateConnectionAsync();
                var result = await connection.QueryFirstOrDefaultAsync<T>(
                    storedProcedure,
                    parameters,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: commandTimeout ?? DefaultCommandTimeout
                );
                
                _logger.LogInformation("Stored procedure {StoredProcedure} completed successfully", storedProcedure);
                return result;
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "SQL error executing stored procedure: {StoredProcedure}. Error: {ErrorMessage}", 
                    storedProcedure, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing stored procedure: {StoredProcedure}", storedProcedure);
                throw;
            }
        }

        public async Task<int> ExecuteAsync(string storedProcedure, object parameters = null, int? commandTimeout = null)
        {
            try
            {
                _logger.LogInformation("Executing stored procedure: {StoredProcedure} with timeout: {Timeout}s", 
                    storedProcedure, commandTimeout ?? DefaultCommandTimeout);
                
                using var connection = await CreateConnectionAsync();
                var result = await connection.ExecuteAsync(
                    storedProcedure,
                    parameters,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: commandTimeout ?? DefaultCommandTimeout
                );
                
                _logger.LogInformation("Stored procedure {StoredProcedure} completed successfully", storedProcedure);
                return result;
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "SQL error executing stored procedure: {StoredProcedure}. Error: {ErrorMessage}", 
                    storedProcedure, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing stored procedure: {StoredProcedure}", storedProcedure);
                throw;
            }
        }
    }
}