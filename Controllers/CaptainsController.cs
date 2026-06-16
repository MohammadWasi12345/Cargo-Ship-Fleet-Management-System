using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CaptainsController : ControllerBase
{
    private readonly IRepository<Captain> _captainRepo;
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<CaptainAssignment> _assignmentRepo;
    private readonly IRepository<Ship> _shipRepo;

    public CaptainsController(
        IRepository<Captain> captainRepo,
        IRepository<User> userRepo,
        IRepository<CaptainAssignment> assignmentRepo,
        IRepository<Ship> shipRepo)
    {
        _captainRepo = captainRepo;
        _userRepo = userRepo;
        _assignmentRepo = assignmentRepo;
        _shipRepo = shipRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var captains = await _captainRepo.GetAllAsync();
        var result = new List<CaptainResponseDto>();
        foreach (var c in captains)
        {
            var user = await _userRepo.GetByIdAsync(c.UserId);
            result.Add(new CaptainResponseDto
            {
                Id = c.Id,
                UserId = c.UserId,
                FullName = user?.FullName ?? "Unknown",
                Email = user?.Email ?? "",
                LicenseNumber = c.LicenseNumber,
                LicenseClass = c.LicenseClass,
                LicenseExpiry = c.LicenseExpiry,
                YearsExperience = c.YearsExperience,
                IsAvailable = c.IsAvailable,
                Nationality = c.Nationality,
                CreatedAt = c.CreatedAt
            });
        }
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Create([FromBody] CreateCaptainDto dto)
    {
        var user = await _userRepo.GetByIdAsync(dto.UserId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        var existing = await _captainRepo.FindAsync(c => c.UserId == dto.UserId);
        if (existing.Any())
            return BadRequest(new { message = "User is already a captain." });

        var captain = new Captain
        {
            UserId = dto.UserId,
            LicenseNumber = dto.LicenseNumber,
            LicenseClass = dto.LicenseClass,
            LicenseExpiry = dto.LicenseExpiry,
            YearsExperience = dto.YearsExperience,
            Nationality = dto.Nationality,
            IsAvailable = true
        };

        await _captainRepo.AddAsync(captain);
        await _captainRepo.SaveChangesAsync();
        return Ok(new { message = "Captain registered.", id = captain.Id });
    }

    [HttpPost("assign")]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Assign([FromBody] AssignCaptainDto dto)
    {
        var captain = await _captainRepo.GetByIdAsync(dto.CaptainId);
        if (captain == null)
            return NotFound(new { message = "Captain not found." });

        var ship = await _shipRepo.GetByIdAsync(dto.ShipId);
        if (ship == null)
            return NotFound(new { message = "Ship not found." });

        var existing = await _assignmentRepo.FindAsync(
            a => a.ShipId == dto.ShipId && a.IsCurrent);
        foreach (var a in existing)
        {
            a.IsCurrent = false;
            a.EndDate = DateTime.UtcNow;
            _assignmentRepo.Update(a);
        }

        var assignment = new CaptainAssignment
        {
            ShipId = dto.ShipId,
            CaptainId = dto.CaptainId,
            StartDate = dto.StartDate,
            IsCurrent = true,
            Notes = dto.Notes
        };

        await _assignmentRepo.AddAsync(assignment);
        captain.IsAvailable = false;
        _captainRepo.Update(captain);
        await _assignmentRepo.SaveChangesAsync();
        return Ok(new { message = "Captain assigned to ship." });
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(Guid id)
    {
        var assignments = await _assignmentRepo.FindAsync(a => a.CaptainId == id);
        var result = new List<object>();
        foreach (var a in assignments)
        {
            var ship = await _shipRepo.GetByIdAsync(a.ShipId);
            result.Add(new
            {
                a.Id, ShipName = ship?.Name, ImoNumber = ship?.ImoNumber,
                a.StartDate, a.EndDate, a.IsCurrent, a.Notes
            });
        }
        return Ok(result);
    }
}