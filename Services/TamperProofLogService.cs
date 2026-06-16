using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Services;

public class TamperProofLogService
{
    private readonly IRepository<VoyageLog> _voyageLogRepo;
    private readonly IConfiguration _config;

    public TamperProofLogService(
        IRepository<VoyageLog> voyageLogRepo,
        IConfiguration config)
    {
        _voyageLogRepo = voyageLogRepo;
        _config = config;
    }

    private string ComputeChecksum(VoyageLog log)
    {
        var secret = _config["JwtSettings:SecretKey"] ?? "default-secret";
        var data = $"{log.Id}{log.VoyageId}{log.ShipId}{log.EventType}" +
                   $"{log.Description}{log.EventTime:O}{secret}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hash);
    }

    public async Task LogVoyageEventAsync(
        Guid voyageId, Guid shipId,
        string shipName, string imoNumber,
        string eventType, string description,
        Guid? loggedByUserId = null,
        string? loggedByName = null,
        string? latitude = null,
        string? longitude = null)
    {
        var log = new VoyageLog
        {
            VoyageId = voyageId,
            ShipId = shipId,
            ShipName = shipName,
            ImoNumber = imoNumber,
            EventType = eventType,
            Description = description,
            LoggedByUserId = loggedByUserId,
            LoggedByName = loggedByName,
            Latitude = latitude,
            Longitude = longitude,
            EventTime = DateTime.UtcNow,
            Checksum = ""
        };

        // Compute checksum after setting all fields
        log.Checksum = ComputeChecksum(log);

        await _voyageLogRepo.AddAsync(log);
        await _voyageLogRepo.SaveChangesAsync();
    }

    public async Task<bool> VerifyLogIntegrityAsync(Guid voyageLogId)
    {
        var log = await _voyageLogRepo.GetByIdAsync(voyageLogId);
        if (log == null) return false;

        var storedChecksum = log.Checksum;
        log.Checksum = "";
        var computedChecksum = ComputeChecksum(log);

        return storedChecksum == computedChecksum;
    }

    public async Task<IEnumerable<VoyageLog>> GetVoyageLogsAsync(Guid voyageId)
    {
        return await _voyageLogRepo.FindAsync(l => l.VoyageId == voyageId);
    }
}