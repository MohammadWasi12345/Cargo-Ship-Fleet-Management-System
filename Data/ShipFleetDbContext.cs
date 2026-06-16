using Microsoft.EntityFrameworkCore;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Enums;

namespace ShipFleet.Infrastructure.Data;

public class ShipFleetDbContext : DbContext
{
    public ShipFleetDbContext(DbContextOptions<ShipFleetDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Ship> Ships => Set<Ship>();
    public DbSet<Captain> Captains => Set<Captain>();
    public DbSet<CaptainAssignment> CaptainAssignments => Set<CaptainAssignment>();
    public DbSet<Port> Ports => Set<Port>();
    public DbSet<Voyage> Voyages => Set<Voyage>();
    public DbSet<BookingRequest> BookingRequests => Set<BookingRequest>();
    public DbSet<FuelLog> FuelLogs => Set<FuelLog>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<ShipLocation> ShipLocations => Set<ShipLocation>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<LoginAttempt> LoginAttempts => Set<LoginAttempt>();
    public DbSet<VoyageLog> VoyageLogs => Set<VoyageLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Soft delete filters
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Ship>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BookingRequest>().HasQueryFilter(e => !e.IsDeleted);

        // User
        modelBuilder.Entity<User>(e => {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        // Ship
        modelBuilder.Entity<Ship>(e => {
            e.HasIndex(s => s.ImoNumber).IsUnique();
            e.Property(s => s.Type).HasConversion<string>();
            e.Property(s => s.Status).HasConversion<string>();
            e.Property(s => s.PrimaryFuelType).HasConversion<string>();
            e.Property(s => s.GrossTonnage).HasPrecision(12, 2);
            e.Property(s => s.DeadweightTonnage).HasPrecision(12, 2);
            e.Property(s => s.LengthOverall).HasPrecision(8, 2);
            e.Property(s => s.Beam).HasPrecision(8, 2);
            e.Property(s => s.Draft).HasPrecision(8, 2);
            e.Property(s => s.MaxSpeedKnots).HasPrecision(6, 2);
            e.Property(s => s.FuelCapacityMT).HasPrecision(10, 2);
            e.Property(s => s.NauticalMilesTravelled).HasPrecision(12, 2);
            e.Property(s => s.CurrentLatitude).HasPrecision(10, 6);
            e.Property(s => s.CurrentLongitude).HasPrecision(10, 6);
            e.Property(s => s.CurrentSpeedKnots).HasPrecision(6, 2);
            e.Property(s => s.CurrentHeading).HasPrecision(6, 2);
        });

        // Captain
        modelBuilder.Entity<Captain>(e => {
            e.HasOne(c => c.User)
                .WithOne(u => u.Captain)
                .HasForeignKey<Captain>(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        // CaptainAssignment
        modelBuilder.Entity<CaptainAssignment>(e => {
            e.HasOne(ca => ca.Ship)
                .WithMany(s => s.CaptainAssignments)
                .HasForeignKey(ca => ca.ShipId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        // BookingRequest
        modelBuilder.Entity<BookingRequest>(e => {
            e.Property(b => b.Status).HasConversion<string>();
            e.Property(b => b.CargoWeightMT).HasPrecision(12, 2);
            e.HasOne(b => b.Requester)
                .WithMany(u => u.BookingRequests)
                .HasForeignKey(b => b.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.Approver)
                .WithMany(u => u.ApprovedRequests)
                .HasForeignKey(b => b.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.DeparturePort)
                .WithMany(p => p.DepartureBookings)
                .HasForeignKey(b => b.DeparturePortId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.ArrivalPort)
                .WithMany(p => p.ArrivalBookings)
                .HasForeignKey(b => b.ArrivalPortId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Voyage
        modelBuilder.Entity<Voyage>(e => {
            e.Property(v => v.Status).HasConversion<string>();
            e.Property(v => v.DistanceNauticalMiles).HasPrecision(10, 2);
            e.Property(v => v.FuelConsumedMT).HasPrecision(10, 2);
            e.Property(v => v.CargoWeightMT).HasPrecision(12, 2);
            e.HasOne(v => v.DeparturePort)
                .WithMany(p => p.DepartureVoyages)
                .HasForeignKey(v => v.DeparturePortId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.ArrivalPort)
                .WithMany(p => p.ArrivalVoyages)
                .HasForeignKey(v => v.ArrivalPortId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.BookingRequest)
                .WithOne(b => b.Voyage)
                .HasForeignKey<Voyage>(v => v.BookingRequestId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        // FuelLog
        modelBuilder.Entity<FuelLog>(e => {
            e.Property(f => f.FuelType).HasConversion<string>();
            e.Property(f => f.QuantityMT).HasPrecision(10, 2);
            e.Property(f => f.CostPerMT).HasPrecision(10, 2);
            e.Property(f => f.NauticalMilesAtBunkering).HasPrecision(12, 2);
            e.Ignore(f => f.TotalCost);
            e.HasOne(f => f.Ship)
                .WithMany(s => s.FuelLogs)
                .HasForeignKey(f => f.ShipId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            e.HasOne(f => f.LoggedBy)
                .WithMany()
                .HasForeignKey(f => f.LoggedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        // MaintenanceRecord
        modelBuilder.Entity<MaintenanceRecord>(e => {
            e.Property(m => m.Type).HasConversion<string>();
            e.Property(m => m.Cost).HasPrecision(12, 2);
            e.Property(m => m.NauticalMilesAtService).HasPrecision(12, 2);
            e.HasOne(m => m.Ship)
                .WithMany(s => s.MaintenanceRecords)
                .HasForeignKey(m => m.ShipId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            e.HasOne(m => m.LoggedBy)
                .WithMany()
                .HasForeignKey(m => m.LoggedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        // ShipLocation
        modelBuilder.Entity<ShipLocation>(e => {
            e.Property(l => l.Latitude).HasPrecision(10, 6);
            e.Property(l => l.Longitude).HasPrecision(10, 6);
            e.Property(l => l.SpeedKnots).HasPrecision(6, 2);
            e.Property(l => l.HeadingDegrees).HasPrecision(6, 2);
            e.HasOne(l => l.Ship)
                .WithMany(s => s.LocationHistory)
                .HasForeignKey(l => l.ShipId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        // Port
        modelBuilder.Entity<Port>(e => {
            e.HasIndex(p => p.Code).IsUnique();
            e.Property(p => p.Latitude).HasPrecision(10, 6);
            e.Property(p => p.Longitude).HasPrecision(10, 6);
        });

        // Seed admin user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            FullName = "System Admin",
            Email = "admin@shipfleet.com",
            PasswordHash = "$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed ports
        var ports = new[]
        {
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000010"), Name = "Port of Shanghai", Code = "CNSHA", Country = "China", City = "Shanghai", Latitude = 31.2304m, Longitude = 121.4737m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000011"), Name = "Port of Singapore", Code = "SGSIN", Country = "Singapore", City = "Singapore", Latitude = 1.2966m, Longitude = 103.8006m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000012"), Name = "Port of Rotterdam", Code = "NLRTM", Country = "Netherlands", City = "Rotterdam", Latitude = 51.9225m, Longitude = 4.4792m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000013"), Name = "Port of Dubai", Code = "AEDXB", Country = "UAE", City = "Dubai", Latitude = 25.2048m, Longitude = 55.2708m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000014"), Name = "Port Qasim", Code = "PKPQI", Country = "Pakistan", City = "Karachi", Latitude = 24.7925m, Longitude = 67.3218m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000015"), Name = "Port of Los Angeles", Code = "USLAX", Country = "USA", City = "Los Angeles", Latitude = 33.7287m, Longitude = -118.2620m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000016"), Name = "Port of Hamburg", Code = "DEHAM", Country = "Germany", City = "Hamburg", Latitude = 53.5753m, Longitude = 10.0153m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Port { Id = Guid.Parse("00000000-0000-0000-0000-000000000017"), Name = "Port of Colombo", Code = "LKCMB", Country = "Sri Lanka", City = "Colombo", Latitude = 6.9271m, Longitude = 79.8612m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
        };
        modelBuilder.Entity<Port>().HasData(ports);

        // VoyageLog — tamper proof (no update/delete)
modelBuilder.Entity<VoyageLog>(e => {
    e.HasKey(v => v.Id);
    e.Property(v => v.Checksum).IsRequired();
    e.ToTable("VoyageLogs");
});

// AuditLog
modelBuilder.Entity<AuditLog>(e => {
    e.HasIndex(a => a.Timestamp);
    e.HasIndex(a => a.UserId);
    e.HasIndex(a => a.EntityType);
});

// LoginAttempt
modelBuilder.Entity<LoginAttempt>(e => {
    e.HasIndex(l => l.Email);
    e.HasIndex(l => l.AttemptedAt);
});

        // Seed 8 ships
        var ships = new[]
        {
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000020"), ImoNumber = "IMO9234567", Name = "MV Pacific Star", Flag = "Panama", Type = ShipType.ContainerShip, Status = ShipStatus.UnderWay, YearBuilt = 2018, GrossTonnage = 85000, DeadweightTonnage = 95000, LengthOverall = 300, Beam = 45, Draft = 14, MaxSpeedKnots = 22, FuelCapacityMT = 3000, PrimaryFuelType = FuelType.VLSFO, NauticalMilesTravelled = 125000, CurrentLatitude = 22.3m, CurrentLongitude = 114.1m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000021"), ImoNumber = "IMO9345678", Name = "MV Atlantic Horizon", Flag = "Liberia", Type = ShipType.BulkCarrier, Status = ShipStatus.InPort, YearBuilt = 2016, GrossTonnage = 45000, DeadweightTonnage = 75000, LengthOverall = 225, Beam = 32, Draft = 12, MaxSpeedKnots = 14, FuelCapacityMT = 2000, PrimaryFuelType = FuelType.HFO, NauticalMilesTravelled = 98000, CurrentLatitude = 51.9m, CurrentLongitude = 4.4m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000022"), ImoNumber = "IMO9456789", Name = "MV Indian Ocean", Flag = "Marshall Islands", Type = ShipType.Tanker, Status = ShipStatus.UnderWay, YearBuilt = 2019, GrossTonnage = 60000, DeadweightTonnage = 110000, LengthOverall = 250, Beam = 44, Draft = 15, MaxSpeedKnots = 15, FuelCapacityMT = 2500, PrimaryFuelType = FuelType.MGO, NauticalMilesTravelled = 75000, CurrentLatitude = 12.5m, CurrentLongitude = 65.3m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000023"), ImoNumber = "IMO9567890", Name = "MV Arabian Gulf", Flag = "UAE", Type = ShipType.CargoVessel, Status = ShipStatus.InPort, YearBuilt = 2020, GrossTonnage = 35000, DeadweightTonnage = 55000, LengthOverall = 200, Beam = 30, Draft = 11, MaxSpeedKnots = 18, FuelCapacityMT = 1500, PrimaryFuelType = FuelType.VLSFO, NauticalMilesTravelled = 45000, CurrentLatitude = 25.2m, CurrentLongitude = 55.2m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000024"), ImoNumber = "IMO9678901", Name = "MV Baltic Pioneer", Flag = "Norway", Type = ShipType.GeneralCargo, Status = ShipStatus.Anchored, YearBuilt = 2017, GrossTonnage = 28000, DeadweightTonnage = 42000, LengthOverall = 185, Beam = 28, Draft = 10, MaxSpeedKnots = 16, FuelCapacityMT = 1200, PrimaryFuelType = FuelType.MGO, NauticalMilesTravelled = 62000, CurrentLatitude = 55.6m, CurrentLongitude = 12.5m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000025"), ImoNumber = "IMO9789012", Name = "MV Mediterranean Express", Flag = "Greece", Type = ShipType.RoRo, Status = ShipStatus.UnderWay, YearBuilt = 2021, GrossTonnage = 42000, DeadweightTonnage = 58000, LengthOverall = 210, Beam = 35, Draft = 11, MaxSpeedKnots = 20, FuelCapacityMT = 1800, PrimaryFuelType = FuelType.LNG, NauticalMilesTravelled = 28000, CurrentLatitude = 36.8m, CurrentLongitude = 22.4m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000026"), ImoNumber = "IMO9890123", Name = "MV Karachi Trader", Flag = "Pakistan", Type = ShipType.CargoVessel, Status = ShipStatus.InPort, YearBuilt = 2015, GrossTonnage = 22000, DeadweightTonnage = 35000, LengthOverall = 170, Beam = 26, Draft = 9, MaxSpeedKnots = 14, FuelCapacityMT = 900, PrimaryFuelType = FuelType.HFO, NauticalMilesTravelled = 88000, CurrentLatitude = 24.7m, CurrentLongitude = 67.3m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
            new Ship { Id = Guid.Parse("00000000-0000-0000-0000-000000000027"), ImoNumber = "IMO9901234", Name = "MV Pearl of Asia", Flag = "Singapore", Type = ShipType.ContainerShip, Status = ShipStatus.UnderWay, YearBuilt = 2022, GrossTonnage = 95000, DeadweightTonnage = 115000, LengthOverall = 340, Beam = 48, Draft = 16, MaxSpeedKnots = 24, FuelCapacityMT = 4000, PrimaryFuelType = FuelType.LNG, NauticalMilesTravelled = 18000, CurrentLatitude = 1.3m, CurrentLongitude = 103.8m, CreatedAt = new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
        };
        modelBuilder.Entity<Ship>().HasData(ships);
    }
}