using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ShipFleet.API.DTOs;
using ShipFleet.API.Hubs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Enums;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShipsController : ControllerBase
{
    private readonly IRepository<Ship> _shipRepo;
    private readonly IRepository<ShipLocation> _locationRepo;
    private readonly IHubContext<TrackingHub> _hubContext;

    public ShipsController(
        IRepository<Ship> shipRepo,
        IRepository<ShipLocation> locationRepo,
        IHubContext<TrackingHub> hubContext)
    {
        _shipRepo = shipRepo;
        _locationRepo = locationRepo;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var ships = await _shipRepo.GetAllAsync();
        return Ok(ships.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var ship = await _shipRepo.GetByIdAsync(id);
        if (ship == null || ship.IsDeleted)
            return NotFound(new { message = "Ship not found." });
        return Ok(MapToDto(ship));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Create([FromBody] CreateShipDto dto)
    {
        var existing = await _shipRepo.FindAsync(s => s.ImoNumber == dto.ImoNumber);
        if (existing.Any())
            return BadRequest(new { message = "IMO number already exists." });

        var ship = new Ship
        {
            ImoNumber = dto.ImoNumber.ToUpper().Trim(),
            Name = dto.Name,
            Flag = dto.Flag,
            Type = dto.Type,
            YearBuilt = dto.YearBuilt,
            GrossTonnage = dto.GrossTonnage,
            DeadweightTonnage = dto.DeadweightTonnage,
            LengthOverall = dto.LengthOverall,
            Beam = dto.Beam,
            Draft = dto.Draft,
            MaxSpeedKnots = dto.MaxSpeedKnots,
            FuelCapacityMT = dto.FuelCapacityMT,
            PrimaryFuelType = dto.PrimaryFuelType,
            Status = ShipStatus.InPort,
            Notes = dto.Notes
        };

        await _shipRepo.AddAsync(ship);
        await _shipRepo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = ship.Id }, MapToDto(ship));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateShipDto dto)
    {
        var ship = await _shipRepo.GetByIdAsync(id);
        if (ship == null || ship.IsDeleted)
            return NotFound(new { message = "Ship not found." });

        if (dto.Flag != null) ship.Flag = dto.Flag;
        if (dto.Status.HasValue) ship.Status = dto.Status.Value;
        if (dto.Draft.HasValue) ship.Draft = dto.Draft.Value;
        if (dto.NauticalMilesTravelled.HasValue) ship.NauticalMilesTravelled = dto.NauticalMilesTravelled.Value;
        if (dto.Notes != null) ship.Notes = dto.Notes;
        ship.UpdatedAt = DateTime.UtcNow;

        _shipRepo.Update(ship);
        await _shipRepo.SaveChangesAsync();
        return Ok(new { message = "Ship updated." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ship = await _shipRepo.GetByIdAsync(id);
        if (ship == null || ship.IsDeleted)
            return NotFound(new { message = "Ship not found." });

        ship.IsDeleted = true;
        ship.UpdatedAt = DateTime.UtcNow;
        _shipRepo.Update(ship);
        await _shipRepo.SaveChangesAsync();
        return Ok(new { message = "Ship deleted." });
    }

    [HttpPost("{id}/location")]
    [Authorize(Roles = "Admin,FleetManager,Captain")]
    public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] UpdateLocationDto dto)
    {
        var ship = await _shipRepo.GetByIdAsync(id);
        if (ship == null || ship.IsDeleted)
            return NotFound(new { message = "Ship not found." });

        ship.CurrentLatitude = dto.Latitude;
        ship.CurrentLongitude = dto.Longitude;
        ship.CurrentSpeedKnots = dto.SpeedKnots;
        ship.CurrentHeading = dto.Heading;
        ship.LastPositionUpdate = DateTime.UtcNow;
        ship.UpdatedAt = DateTime.UtcNow;
        _shipRepo.Update(ship);

        var location = new ShipLocation
        {
            ShipId = id,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            SpeedKnots = dto.SpeedKnots,
            HeadingDegrees = dto.Heading,
            Status = ship.Status.ToString(),
            RecordedAt = DateTime.UtcNow
        };

        await _locationRepo.AddAsync(location);
        await _shipRepo.SaveChangesAsync();

        // Broadcast to SignalR clients
        await _hubContext.Clients.Group("fleet-tracking").SendAsync("LocationUpdate", new
        {
            shipId = id,
            shipName = ship.Name,
            imoNumber = ship.ImoNumber,
            latitude = dto.Latitude,
            longitude = dto.Longitude,
            speedKnots = dto.SpeedKnots,
            heading = dto.Heading,
            status = ship.Status.ToString(),
            timestamp = DateTime.UtcNow
        });

        return Ok(new { message = "Location updated." });
    }

    [HttpGet("{id}/location-history")]
    public async Task<IActionResult> GetLocationHistory(Guid id)
    {
        var history = await _locationRepo.FindAsync(l => l.ShipId == id);
        return Ok(history.OrderByDescending(l => l.RecordedAt).Take(100));
    }

    [HttpGet("positions")]
    public async Task<IActionResult> GetAllPositions()
    {
        var ships = await _shipRepo.GetAllAsync();
        var positions = ships.Where(s => s.CurrentLatitude.HasValue)
            .Select(s => new ShipLocationDto
            {
                ShipId = s.Id,
                ShipName = s.Name,
                ImoNumber = s.ImoNumber,
                Status = s.Status.ToString(),
                Type = s.Type.ToString(),
                Latitude = s.CurrentLatitude,
                Longitude = s.CurrentLongitude,
                SpeedKnots = s.CurrentSpeedKnots,
                Heading = s.CurrentHeading,
                LastUpdate = s.LastPositionUpdate
            });
        return Ok(positions);
    }

    private static ShipResponseDto MapToDto(Ship s) => new()
    {
        Id = s.Id,
        ImoNumber = s.ImoNumber,
        Name = s.Name,
        Flag = s.Flag,
        Type = s.Type.ToString(),
        Status = s.Status.ToString(),
        YearBuilt = s.YearBuilt,
        GrossTonnage = s.GrossTonnage,
        DeadweightTonnage = s.DeadweightTonnage,
        LengthOverall = s.LengthOverall,
        Beam = s.Beam,
        Draft = s.Draft,
        MaxSpeedKnots = s.MaxSpeedKnots,
        FuelCapacityMT = s.FuelCapacityMT,
        PrimaryFuelType = s.PrimaryFuelType.ToString(),
        NauticalMilesTravelled = s.NauticalMilesTravelled,
        CurrentLatitude = s.CurrentLatitude,
        CurrentLongitude = s.CurrentLongitude,
        CurrentSpeedKnots = s.CurrentSpeedKnots,
        CurrentHeading = s.CurrentHeading,
        LastPositionUpdate = s.LastPositionUpdate,
        Notes = s.Notes,
        CreatedAt = s.CreatedAt
    };
}