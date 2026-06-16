using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Interfaces;
using ShipFleet.Core.Entities;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrackingController : ControllerBase
{
    private readonly IRepository<Ship> _shipRepo;

    public TrackingController(IRepository<Ship> shipRepo)
    {
        _shipRepo = shipRepo;
    }

    [HttpGet("fleet")]
    public async Task<IActionResult> GetFleetPositions()
    {
        var ships = await _shipRepo.GetAllAsync();
        var positions = ships.Select(s => new ShipLocationDto
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
}