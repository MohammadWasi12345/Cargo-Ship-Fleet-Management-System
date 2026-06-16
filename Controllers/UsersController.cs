using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IRepository<User> _userRepo;

    public UsersController(IRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }


    [HttpGet("pending-approval")]
[Authorize(Roles = "Admin,FleetManager")]
public async Task<IActionResult> GetPendingApproval()
{
    var users = await _userRepo.FindAsync(u => !u.IsApproved && u.IsActive);
    return Ok(users.Select(u => new UserResponseDto
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = u.Role.ToString(),
        Department = u.Department,
        PhoneNumber = u.PhoneNumber,
        IsActive = u.IsActive,
        CreatedAt = u.CreatedAt
    }));
}

[HttpPost("{id}/approve")]
[Authorize(Roles = "Admin,FleetManager")]
public async Task<IActionResult> ApproveUser(Guid id)
{
    var user = await _userRepo.GetByIdAsync(id);
    if (user == null || user.IsDeleted)
        return NotFound(new { message = "User not found." });

    var approverId = Guid.Parse(
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    user.IsApproved = true;
    user.ApprovedAt = DateTime.UtcNow;
    user.ApprovedBy = approverId;
    user.UpdatedAt = DateTime.UtcNow;
    _userRepo.Update(user);
    await _userRepo.SaveChangesAsync();

    return Ok(new { message = $"User {user.FullName} approved successfully." });
}

    [HttpGet]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userRepo.GetAllAsync();
        return Ok(users.Select(u => new UserResponseDto
        {
            Id = u.Id, FullName = u.FullName, Email = u.Email,
            Role = u.Role.ToString(), Department = u.Department,
            PhoneNumber = u.PhoneNumber, IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var existing = await _userRepo.FindAsync(u => u.Email == dto.Email.ToLower().Trim());
        if (existing.Any())
            return BadRequest(new { message = "Email already exists." });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            Department = dto.Department,
            PhoneNumber = dto.PhoneNumber,
            IsActive = true
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();
        return Ok(new { message = "User created.", id = user.Id });
    }

    [HttpPatch("{id}/toggle-active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null || user.IsDeleted)
            return NotFound(new { message = "User not found." });

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();
        return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")}." });
    }

    [HttpPatch("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateUserRoleDto dto)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null || user.IsDeleted)
            return NotFound(new { message = "User not found." });

        user.Role = dto.Role;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();
        return Ok(new { message = "Role updated." });
    }
}