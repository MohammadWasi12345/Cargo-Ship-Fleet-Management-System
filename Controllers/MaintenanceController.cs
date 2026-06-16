using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Enums;
using ShipFleet.Core.Interfaces;
using System.Security.Claims;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IRepository<MaintenanceRecord> _maintenanceRepo;
    private readonly IRepository<Ship> _shipRepo;
    private readonly IRepository<User> _userRepo;

    public MaintenanceController(
        IRepository<MaintenanceRecord> maintenanceRepo,
        IRepository<Ship> shipRepo,
        IRepository<User> userRepo)
    {
        _maintenanceRepo = maintenanceRepo;
        _shipRepo = shipRepo;
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var records = await _maintenanceRepo.GetAllAsync();
        var result = new List<MaintenanceResponseDto>();
        foreach (var m in records.OrderByDescending(m => m.ServiceDate))
        {
            var ship = await _shipRepo.GetByIdAsync(m.ShipId);
            var user = await _userRepo.GetByIdAsync(m.LoggedByUserId);
            result.Add(new MaintenanceResponseDto
            {
                Id = m.Id, ShipId = m.ShipId,
                ShipName = ship?.Name ?? "", ImoNumber = ship?.ImoNumber ?? "",
                Type = m.Type.ToString(), ServiceDate = m.ServiceDate, Cost = m.Cost,
                Description = m.Description, ServiceProvider = m.ServiceProvider,
                PortOfMaintenance = m.PortOfMaintenance,
                NauticalMilesAtService = m.NauticalMilesAtService,
                NextServiceDate = m.NextServiceDate, IsCompleted = m.IsCompleted,
                LoggedBy = user?.FullName ?? "", CreatedAt = m.CreatedAt
            });
        }
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Create([FromBody] CreateMaintenanceDto dto)
    {
        var ship = await _shipRepo.GetByIdAsync(dto.ShipId);
        if (ship == null) return NotFound(new { message = "Ship not found." });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var record = new MaintenanceRecord
        {
            ShipId = dto.ShipId,
            LoggedByUserId = userId,
            Type = dto.Type,
            ServiceDate = dto.ServiceDate,
            Cost = dto.Cost,
            Description = dto.Description,
            ServiceProvider = dto.ServiceProvider,
            PortOfMaintenance = dto.PortOfMaintenance,
            NauticalMilesAtService = dto.NauticalMilesAtService,
            NextServiceDate = dto.NextServiceDate,
            IsCompleted = true
        };

        await _maintenanceRepo.AddAsync(record);
        ship.Status = ShipStatus.UnderMaintenance;
        ship.UpdatedAt = DateTime.UtcNow;
        _shipRepo.Update(ship);
        await _maintenanceRepo.SaveChangesAsync();
        return Ok(new { message = "Maintenance record added.", id = record.Id });
    }
}