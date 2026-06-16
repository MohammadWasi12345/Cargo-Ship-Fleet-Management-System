using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PortsController : ControllerBase
{
    private readonly IRepository<Port> _portRepo;

    public PortsController(IRepository<Port> portRepo)
    {
        _portRepo = portRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var ports = await _portRepo.GetAllAsync();
        return Ok(ports.Select(p => new PortResponseDto
        {
            Id = p.Id, Name = p.Name, Code = p.Code,
            Country = p.Country, City = p.City,
            Latitude = p.Latitude, Longitude = p.Longitude,
            TimeZone = p.TimeZone, Notes = p.Notes
        }));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Create([FromBody] CreatePortDto dto)
    {
        var existing = await _portRepo.FindAsync(p => p.Code == dto.Code.ToUpper());
        if (existing.Any())
            return BadRequest(new { message = "Port code already exists." });

        var port = new Port
        {
            Name = dto.Name, Code = dto.Code.ToUpper(),
            Country = dto.Country, City = dto.City,
            Latitude = dto.Latitude, Longitude = dto.Longitude,
            TimeZone = dto.TimeZone, Notes = dto.Notes
        };

        await _portRepo.AddAsync(port);
        await _portRepo.SaveChangesAsync();
        return Ok(new { message = "Port added.", id = port.Id });
    }
}