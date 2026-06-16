using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.API.Services;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Enums;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IRepository<User> _userRepo;
    private readonly JwtService _jwtService;
    private readonly AuditService _auditService;

    public AuthController(
        IRepository<User> userRepo,
        JwtService jwtService,
        AuditService auditService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _auditService = auditService;
    }

    [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    if (await _auditService.IsAccountLockedAsync(dto.Email))
        return StatusCode(423, new { message = "Account locked." });

    var users = await _userRepo.FindAsync(
        u => u.Email.ToLower() == dto.Email.ToLower().Trim());
    var user = users.FirstOrDefault();

    if (user == null)
        return Unauthorized(new { message = "User not found." });

    if (!user.IsActive)
        return Unauthorized(new { message = "Account inactive." });

    if (!user.IsApproved)
        return Unauthorized(new { message = "Account pending approval." });

    if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
    {
        await _auditService.LogLoginAttemptAsync(dto.Email, false, "Wrong password");
        var failedAttempts = await _auditService.GetFailedAttemptsAsync(dto.Email);
        var remaining = 5 - failedAttempts;
        return Unauthorized(new { message = $"Invalid password. {remaining} attempts remaining." });
    }

    await _auditService.LogLoginAttemptAsync(dto.Email, true);
    await _auditService.LogActionAsync(
        user.Id, user.Email, user.Role.ToString(),
        "LOGIN", "User", user.Id.ToString());

    var token = _jwtService.GenerateToken(user);
    return Ok(new AuthResponseDto
    {
        Token = token,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role.ToString(),
        UserId = user.Id,
        ExpiresAt = DateTime.UtcNow.AddMinutes(480)
    });
}
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto dto)
{
    // Password match check
    if (dto.Password != dto.ConfirmPassword)
        return BadRequest(new { message = "Passwords do not match." });

    // Password strength check
    if (dto.Password.Length < 8)
        return BadRequest(new { message = "Password must be at least 8 characters." });

    // Email unique check
    var existing = await _userRepo.FindAsync(
        u => u.Email == dto.Email.ToLower().Trim());
    if (existing.Any())
        return BadRequest(new { message = "Email already registered." });

    // Admin role — only existing admin can create
    if (dto.Role == UserRole.Admin)
        return BadRequest(new { message = "Admin account cannot be self-registered. Contact system administrator." });

    // Determine approval status
    // Admin/FleetManager accounts need manual approval
    bool needsApproval = dto.Role == UserRole.FleetManager || dto.Role == UserRole.Captain;

    var user = new User
    {
        FullName = dto.FullName,
        Email = dto.Email.ToLower().Trim(),
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        Role = dto.Role,
        Department = dto.Department,
        PhoneNumber = dto.PhoneNumber,
        Company = dto.Company,
        IsActive = true,
        IsApproved = !needsApproval, // Employee & Customer auto-approved
        ApprovedAt = !needsApproval ? DateTime.UtcNow : null
    };

    await _userRepo.AddAsync(user);
    await _userRepo.SaveChangesAsync();

    await _auditService.LogActionAsync(
        user.Id, user.Email, user.Role.ToString(),
        "REGISTER", "User", user.Id.ToString(),
        newValues: $"Role: {user.Role}, Email: {user.Email}");

    if (needsApproval)
    {
        return Ok(new {
            message = $"Registration successful! Your {dto.Role} account is pending admin approval. You will be notified once approved.",
            requiresApproval = true,
            role = dto.Role.ToString()
        });
    }

    var token = _jwtService.GenerateToken(user);
    return Ok(new AuthResponseDto
    {
        Token = token,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role.ToString(),
        UserId = user.Id,
        ExpiresAt = DateTime.UtcNow.AddMinutes(480)
    });
}
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";

        await _auditService.LogActionAsync(
            userId != null ? Guid.Parse(userId) : null,
            email, role, "LOGOUT", "User", userId);

        return Ok(new { message = "Logged out successfully." });
    }
}