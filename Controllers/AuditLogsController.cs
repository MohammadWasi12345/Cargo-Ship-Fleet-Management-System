using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IRepository<AuditLog> _auditRepo;
    private readonly IRepository<LoginAttempt> _loginAttemptRepo;

    public AuditLogsController(
        IRepository<AuditLog> auditRepo,
        IRepository<LoginAttempt> loginAttemptRepo)
    {
        _auditRepo = auditRepo;
        _loginAttemptRepo = loginAttemptRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _auditRepo.GetAllAsync();
        return Ok(logs.OrderByDescending(l => l.Timestamp).Take(500));
    }

    [HttpGet("login-attempts")]
    public async Task<IActionResult> GetLoginAttempts()
    {
        var attempts = await _loginAttemptRepo.GetAllAsync();
        return Ok(attempts.OrderByDescending(a => a.AttemptedAt).Take(200));
    }

    [HttpGet("login-attempts/{email}")]
    public async Task<IActionResult> GetLoginAttemptsByEmail(string email)
    {
        var attempts = await _loginAttemptRepo.FindAsync(
            a => a.Email == email.ToLower());
        return Ok(attempts.OrderByDescending(a => a.AttemptedAt));
    }

    [HttpGet("failed-logins")]
    public async Task<IActionResult> GetFailedLogins()
    {
        var attempts = await _loginAttemptRepo.FindAsync(a => !a.IsSuccess);
        return Ok(attempts.OrderByDescending(a => a.AttemptedAt).Take(100));
    }
}