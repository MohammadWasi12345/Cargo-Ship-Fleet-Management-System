using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Enums;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VoyagesController : ControllerBase
{
    private readonly IRepository<Voyage> _voyageRepo;
    private readonly IRepository<Ship> _shipRepo;
    private readonly IRepository<Captain> _captainRepo;
    private readonly IRepository<Port> _portRepo;
    private readonly IRepository<User> _userRepo;

    public VoyagesController(
        IRepository<Voyage> voyageRepo,
        IRepository<Ship> shipRepo,
        IRepository<Captain> captainRepo,
        IRepository<Port> portRepo,
        IRepository<User> userRepo)
    {
        _voyageRepo = voyageRepo;
        _shipRepo = shipRepo;
        _captainRepo = captainRepo;
        _portRepo = portRepo;
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var voyages = await _voyageRepo.GetAllAsync();
        var result = new List<VoyageResponseDto>();
        foreach (var v in voyages.OrderByDescending(v => v.CreatedAt))
        {
            var ship = await _shipRepo.GetByIdAsync(v.ShipId);
            var depPort = await _portRepo.GetByIdAsync(v.DeparturePortId);
            var arrPort = await _portRepo.GetByIdAsync(v.ArrivalPortId);
            Captain? captain = v.CaptainId.HasValue
                ? await _captainRepo.GetByIdAsync(v.CaptainId.Value) : null;
            User? captainUser = captain != null
                ? await _userRepo.GetByIdAsync(captain.UserId) : null;

            result.Add(new VoyageResponseDto
            {
                Id = v.Id,
                VoyageNumber = v.VoyageNumber,
                ShipId = v.ShipId,
                ShipName = ship?.Name ?? "",
                ImoNumber = ship?.ImoNumber ?? "",
                CaptainName = captainUser?.FullName,
                DeparturePort = depPort?.Name ?? "",
                ArrivalPort = arrPort?.Name ?? "",
                DeparturePortCode = depPort?.Code ?? "",
                ArrivalPortCode = arrPort?.Code ?? "",
                PlannedDeparture = v.PlannedDeparture,
                PlannedArrival = v.PlannedArrival,
                ActualDeparture = v.ActualDeparture,
                ActualArrival = v.ActualArrival,
                Status = v.Status.ToString(),
                DistanceNauticalMiles = v.DistanceNauticalMiles,
                FuelConsumedMT = v.FuelConsumedMT,
                CargoWeightMT = v.CargoWeightMT,
                CargoDescription = v.CargoDescription,
                Notes = v.Notes,
                CreatedAt = v.CreatedAt
            });
        }
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Create([FromBody] CreateVoyageDto dto)
    {
        var ship = await _shipRepo.GetByIdAsync(dto.ShipId);
        if (ship == null) return NotFound(new { message = "Ship not found." });

        var voyageNumber = $"VOY-{DateTime.UtcNow:yyyyMMdd}-{ship.ImoNumber[^4..]}";

        var voyage = new Voyage
        {
            VoyageNumber = voyageNumber,
            ShipId = dto.ShipId,
            CaptainId = dto.CaptainId,
            DeparturePortId = dto.DeparturePortId,
            ArrivalPortId = dto.ArrivalPortId,
            PlannedDeparture = dto.PlannedDeparture,
            PlannedArrival = dto.PlannedArrival,
            CargoWeightMT = dto.CargoWeightMT,
            CargoDescription = dto.CargoDescription,
            DistanceNauticalMiles = dto.DistanceNauticalMiles,
            Notes = dto.Notes,
            Status = VoyageStatus.Planned
        };

        await _voyageRepo.AddAsync(voyage);
        await _voyageRepo.SaveChangesAsync();
        return Ok(new { message = "Voyage created.", id = voyage.Id, voyageNumber });
    }

    [HttpPost("{id}/depart")]
    [Authorize(Roles = "Admin,FleetManager,Captain")]
    public async Task<IActionResult> Depart(Guid id)
    {
        var voyage = await _voyageRepo.GetByIdAsync(id);
        if (voyage == null) return NotFound(new { message = "Voyage not found." });

        voyage.Status = VoyageStatus.UnderWay;
        voyage.ActualDeparture = DateTime.UtcNow;
        voyage.UpdatedAt = DateTime.UtcNow;
        _voyageRepo.Update(voyage);

        var ship = await _shipRepo.GetByIdAsync(voyage.ShipId);
        if (ship != null)
        {
            ship.Status = ShipStatus.UnderWay;
            ship.UpdatedAt = DateTime.UtcNow;
            _shipRepo.Update(ship);
        }

        await _voyageRepo.SaveChangesAsync();
        return Ok(new { message = "Voyage departed." });
    }

    [HttpPost("{id}/arrive")]
    [Authorize(Roles = "Admin,FleetManager,Captain")]
    public async Task<IActionResult> Arrive(Guid id, [FromBody] decimal? fuelConsumed)
    {
        var voyage = await _voyageRepo.GetByIdAsync(id);
        if (voyage == null) return NotFound(new { message = "Voyage not found." });

        voyage.Status = VoyageStatus.Completed;
        voyage.ActualArrival = DateTime.UtcNow;
        voyage.FuelConsumedMT = fuelConsumed;
        voyage.UpdatedAt = DateTime.UtcNow;
        _voyageRepo.Update(voyage);

        var ship = await _shipRepo.GetByIdAsync(voyage.ShipId);
        if (ship != null)
        {
            ship.Status = ShipStatus.InPort;
            ship.UpdatedAt = DateTime.UtcNow;
            _shipRepo.Update(ship);
        }

        await _voyageRepo.SaveChangesAsync();
        return Ok(new { message = "Voyage completed. Ship arrived." });
    }
}