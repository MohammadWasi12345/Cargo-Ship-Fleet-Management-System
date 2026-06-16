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
public class BookingsController : ControllerBase
{
    private readonly IRepository<BookingRequest> _bookingRepo;
    private readonly IRepository<Ship> _shipRepo;
    private readonly IRepository<Captain> _captainRepo;
    private readonly IRepository<Port> _portRepo;
    private readonly IRepository<Voyage> _voyageRepo;
    private readonly IRepository<User> _userRepo;

    public BookingsController(
        IRepository<BookingRequest> bookingRepo,
        IRepository<Ship> shipRepo,
        IRepository<Captain> captainRepo,
        IRepository<Port> portRepo,
        IRepository<Voyage> voyageRepo,
        IRepository<User> userRepo)
    {
        _bookingRepo = bookingRepo;
        _shipRepo = shipRepo;
        _captainRepo = captainRepo;
        _portRepo = portRepo;
        _voyageRepo = voyageRepo;
        _userRepo = userRepo;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var role = User.FindFirstValue(ClaimTypes.Role);

        IEnumerable<BookingRequest> bookings = role == "Employee"
            ? await _bookingRepo.FindAsync(b => b.RequesterId == userId)
            : await _bookingRepo.GetAllAsync();

        var result = new List<BookingResponseDto>();
        foreach (var b in bookings.OrderByDescending(b => b.CreatedAt))
        {
            var ship = await _shipRepo.GetByIdAsync(b.ShipId);
            var depPort = await _portRepo.GetByIdAsync(b.DeparturePortId);
            var arrPort = await _portRepo.GetByIdAsync(b.ArrivalPortId);
            var requester = await _userRepo.GetByIdAsync(b.RequesterId);

            result.Add(new BookingResponseDto
            {
                Id = b.Id,
                ShipId = b.ShipId,
                ShipName = ship?.Name ?? "",
                ImoNumber = ship?.ImoNumber ?? "",
                RequesterName = requester?.FullName ?? "",
                DeparturePort = depPort?.Name ?? "",
                ArrivalPort = arrPort?.Name ?? "",
                PlannedDeparture = b.PlannedDeparture,
                PlannedArrival = b.PlannedArrival,
                Purpose = b.Purpose,
                CargoWeightMT = b.CargoWeightMT,
                CargoDescription = b.CargoDescription,
                Status = b.Status.ToString(),
                RejectionReason = b.RejectionReason,
                ApprovedAt = b.ApprovedAt,
                CreatedAt = b.CreatedAt
            });
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        var ship = await _shipRepo.GetByIdAsync(dto.ShipId);
        if (ship == null || ship.IsDeleted)
            return NotFound(new { message = "Ship not found." });

        var booking = new BookingRequest
        {
            RequesterId = GetUserId(),
            ShipId = dto.ShipId,
            DeparturePortId = dto.DeparturePortId,
            ArrivalPortId = dto.ArrivalPortId,
            PlannedDeparture = dto.PlannedDeparture,
            PlannedArrival = dto.PlannedArrival,
            Purpose = dto.Purpose,
            CargoWeightMT = dto.CargoWeightMT,
            CargoDescription = dto.CargoDescription,
            Status = BookingStatus.Pending
        };

        await _bookingRepo.AddAsync(booking);
        await _bookingRepo.SaveChangesAsync();
        return Ok(new { message = "Booking submitted.", id = booking.Id });
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveBookingDto dto)
    {
        var booking = await _bookingRepo.GetByIdAsync(id);
        if (booking == null) return NotFound(new { message = "Booking not found." });
        if (booking.Status != BookingStatus.Pending)
            return BadRequest(new { message = "Booking is not pending." });

        var captain = await _captainRepo.GetByIdAsync(dto.CaptainId);
        if (captain == null) return NotFound(new { message = "Captain not found." });

        booking.Status = BookingStatus.Approved;
        booking.ApproverId = GetUserId();
        booking.ApprovedAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;
        _bookingRepo.Update(booking);

        var ship = await _shipRepo.GetByIdAsync(booking.ShipId);
        var voyageNumber = $"VOY-{DateTime.UtcNow:yyyyMMdd}-{ship?.ImoNumber[^4..]}";

        var voyage = new Voyage
        {
            VoyageNumber = voyageNumber,
            ShipId = booking.ShipId,
            CaptainId = dto.CaptainId,
            BookingRequestId = booking.Id,
            DeparturePortId = booking.DeparturePortId,
            ArrivalPortId = booking.ArrivalPortId,
            PlannedDeparture = booking.PlannedDeparture,
            PlannedArrival = booking.PlannedArrival,
            CargoWeightMT = booking.CargoWeightMT,
            CargoDescription = booking.CargoDescription,
            Status = VoyageStatus.Planned
        };

        await _voyageRepo.AddAsync(voyage);
        await _bookingRepo.SaveChangesAsync();
        return Ok(new { message = "Booking approved. Voyage created.", voyageNumber });
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin,FleetManager")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectBookingDto dto)
    {
        var booking = await _bookingRepo.GetByIdAsync(id);
        if (booking == null) return NotFound(new { message = "Booking not found." });
        if (booking.Status != BookingStatus.Pending)
            return BadRequest(new { message = "Booking is not pending." });

        booking.Status = BookingStatus.Rejected;
        booking.RejectionReason = dto.RejectionReason;
        booking.ApproverId = GetUserId();
        booking.UpdatedAt = DateTime.UtcNow;
        _bookingRepo.Update(booking);
        await _bookingRepo.SaveChangesAsync();
        return Ok(new { message = "Booking rejected." });
    }
}