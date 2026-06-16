using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShipFleet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(10,6)", precision: 10, scale: 6, nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(10,6)", precision: 10, scale: 6, nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImoNumber = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Flag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    YearBuilt = table.Column<int>(type: "int", nullable: false),
                    GrossTonnage = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    DeadweightTonnage = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    LengthOverall = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    Beam = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    Draft = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    MaxSpeedKnots = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    FuelCapacityMT = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    PrimaryFuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NauticalMilesTravelled = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentLatitude = table.Column<decimal>(type: "decimal(10,6)", precision: 10, scale: 6, nullable: true),
                    CurrentLongitude = table.Column<decimal>(type: "decimal(10,6)", precision: 10, scale: 6, nullable: true),
                    CurrentSpeedKnots = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    CurrentHeading = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    LastPositionUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ships", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShipLocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(10,6)", precision: 10, scale: 6, nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(10,6)", precision: 10, scale: 6, nullable: false),
                    SpeedKnots = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    HeadingDegrees = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShipLocations_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BookingRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequesterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeparturePortId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ArrivalPortId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlannedDeparture = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlannedArrival = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CargoWeightMT = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    CargoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApproverId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookingRequests_Ports_ArrivalPortId",
                        column: x => x.ArrivalPortId,
                        principalTable: "Ports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingRequests_Ports_DeparturePortId",
                        column: x => x.DeparturePortId,
                        principalTable: "Ports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingRequests_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookingRequests_Users_ApproverId",
                        column: x => x.ApproverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingRequests_Users_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Captains",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LicenseNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LicenseClass = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LicenseExpiry = table.Column<DateTime>(type: "datetime2", nullable: false),
                    YearsExperience = table.Column<int>(type: "int", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    Nationality = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Captains", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Captains_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FuelLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoggedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    QuantityMT = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    CostPerMT = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    NauticalMilesAtBunkering = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PortOfBunkering = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Supplier = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FuelLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FuelLogs_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FuelLogs_Users_LoggedByUserId",
                        column: x => x.LoggedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoggedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceProvider = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PortOfMaintenance = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NauticalMilesAtService = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    NextServiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenanceRecords_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MaintenanceRecords_Users_LoggedByUserId",
                        column: x => x.LoggedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CaptainAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaptainId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCurrent = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaptainAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaptainAssignments_Captains_CaptainId",
                        column: x => x.CaptainId,
                        principalTable: "Captains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CaptainAssignments_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Voyages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VoyageNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaptainId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BookingRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeparturePortId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ArrivalPortId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlannedDeparture = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlannedArrival = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualDeparture = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualArrival = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DistanceNauticalMiles = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    FuelConsumedMT = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    CargoWeightMT = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    CargoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Voyages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Voyages_BookingRequests_BookingRequestId",
                        column: x => x.BookingRequestId,
                        principalTable: "BookingRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Voyages_Captains_CaptainId",
                        column: x => x.CaptainId,
                        principalTable: "Captains",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Voyages_Ports_ArrivalPortId",
                        column: x => x.ArrivalPortId,
                        principalTable: "Ports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Voyages_Ports_DeparturePortId",
                        column: x => x.DeparturePortId,
                        principalTable: "Ports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Voyages_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Ports",
                columns: new[] { "Id", "City", "Code", "Country", "CreatedAt", "IsDeleted", "Latitude", "Longitude", "Name", "Notes", "TimeZone", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000010"), "Shanghai", "CNSHA", "China", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 31.2304m, 121.4737m, "Port of Shanghai", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000011"), "Singapore", "SGSIN", "Singapore", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 1.2966m, 103.8006m, "Port of Singapore", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000012"), "Rotterdam", "NLRTM", "Netherlands", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 51.9225m, 4.4792m, "Port of Rotterdam", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000013"), "Dubai", "AEDXB", "UAE", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 25.2048m, 55.2708m, "Port of Dubai", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000014"), "Karachi", "PKPQI", "Pakistan", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 24.7925m, 67.3218m, "Port Qasim", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000015"), "Los Angeles", "USLAX", "USA", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 33.7287m, -118.2620m, "Port of Los Angeles", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000016"), "Hamburg", "DEHAM", "Germany", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 53.5753m, 10.0153m, "Port of Hamburg", null, null, null },
                    { new Guid("00000000-0000-0000-0000-000000000017"), "Colombo", "LKCMB", "Sri Lanka", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, 6.9271m, 79.8612m, "Port of Colombo", null, null, null }
                });

            migrationBuilder.InsertData(
                table: "Ships",
                columns: new[] { "Id", "Beam", "CreatedAt", "CurrentHeading", "CurrentLatitude", "CurrentLongitude", "CurrentSpeedKnots", "DeadweightTonnage", "Draft", "Flag", "FuelCapacityMT", "GrossTonnage", "ImoNumber", "IsDeleted", "LastPositionUpdate", "LengthOverall", "MaxSpeedKnots", "Name", "NauticalMilesTravelled", "Notes", "PrimaryFuelType", "Status", "Type", "UpdatedAt", "YearBuilt" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000020"), 45m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 22.3m, 114.1m, null, 95000m, 14m, "Panama", 3000m, 85000m, "IMO9234567", false, null, 300m, 22m, "MV Pacific Star", 125000m, null, "VLSFO", "UnderWay", "ContainerShip", null, 2018 },
                    { new Guid("00000000-0000-0000-0000-000000000021"), 32m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 51.9m, 4.4m, null, 75000m, 12m, "Liberia", 2000m, 45000m, "IMO9345678", false, null, 225m, 14m, "MV Atlantic Horizon", 98000m, null, "HFO", "InPort", "BulkCarrier", null, 2016 },
                    { new Guid("00000000-0000-0000-0000-000000000022"), 44m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 12.5m, 65.3m, null, 110000m, 15m, "Marshall Islands", 2500m, 60000m, "IMO9456789", false, null, 250m, 15m, "MV Indian Ocean", 75000m, null, "MGO", "UnderWay", "Tanker", null, 2019 },
                    { new Guid("00000000-0000-0000-0000-000000000023"), 30m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 25.2m, 55.2m, null, 55000m, 11m, "UAE", 1500m, 35000m, "IMO9567890", false, null, 200m, 18m, "MV Arabian Gulf", 45000m, null, "VLSFO", "InPort", "CargoVessel", null, 2020 },
                    { new Guid("00000000-0000-0000-0000-000000000024"), 28m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 55.6m, 12.5m, null, 42000m, 10m, "Norway", 1200m, 28000m, "IMO9678901", false, null, 185m, 16m, "MV Baltic Pioneer", 62000m, null, "MGO", "Anchored", "GeneralCargo", null, 2017 },
                    { new Guid("00000000-0000-0000-0000-000000000025"), 35m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 36.8m, 22.4m, null, 58000m, 11m, "Greece", 1800m, 42000m, "IMO9789012", false, null, 210m, 20m, "MV Mediterranean Express", 28000m, null, "LNG", "UnderWay", "RoRo", null, 2021 },
                    { new Guid("00000000-0000-0000-0000-000000000026"), 26m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 24.7m, 67.3m, null, 35000m, 9m, "Pakistan", 900m, 22000m, "IMO9890123", false, null, 170m, 14m, "MV Karachi Trader", 88000m, null, "HFO", "InPort", "CargoVessel", null, 2015 },
                    { new Guid("00000000-0000-0000-0000-000000000027"), 48m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 1.3m, 103.8m, null, 115000m, 16m, "Singapore", 4000m, 95000m, "IMO9901234", false, null, 340m, 24m, "MV Pearl of Asia", 18000m, null, "LNG", "UnderWay", "ContainerShip", null, 2022 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Department", "Email", "FullName", "IsActive", "IsDeleted", "PasswordHash", "PhoneNumber", "Role", "UpdatedAt" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "admin@shipfleet.com", "System Admin", true, false, "$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.", null, "Admin", null });

            migrationBuilder.CreateIndex(
                name: "IX_BookingRequests_ApproverId",
                table: "BookingRequests",
                column: "ApproverId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingRequests_ArrivalPortId",
                table: "BookingRequests",
                column: "ArrivalPortId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingRequests_DeparturePortId",
                table: "BookingRequests",
                column: "DeparturePortId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingRequests_RequesterId",
                table: "BookingRequests",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingRequests_ShipId",
                table: "BookingRequests",
                column: "ShipId");

            migrationBuilder.CreateIndex(
                name: "IX_CaptainAssignments_CaptainId",
                table: "CaptainAssignments",
                column: "CaptainId");

            migrationBuilder.CreateIndex(
                name: "IX_CaptainAssignments_ShipId",
                table: "CaptainAssignments",
                column: "ShipId");

            migrationBuilder.CreateIndex(
                name: "IX_Captains_UserId",
                table: "Captains",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FuelLogs_LoggedByUserId",
                table: "FuelLogs",
                column: "LoggedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FuelLogs_ShipId",
                table: "FuelLogs",
                column: "ShipId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecords_LoggedByUserId",
                table: "MaintenanceRecords",
                column: "LoggedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecords_ShipId",
                table: "MaintenanceRecords",
                column: "ShipId");

            migrationBuilder.CreateIndex(
                name: "IX_Ports_Code",
                table: "Ports",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShipLocations_ShipId",
                table: "ShipLocations",
                column: "ShipId");

            migrationBuilder.CreateIndex(
                name: "IX_Ships_ImoNumber",
                table: "Ships",
                column: "ImoNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Voyages_ArrivalPortId",
                table: "Voyages",
                column: "ArrivalPortId");

            migrationBuilder.CreateIndex(
                name: "IX_Voyages_BookingRequestId",
                table: "Voyages",
                column: "BookingRequestId",
                unique: true,
                filter: "[BookingRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Voyages_CaptainId",
                table: "Voyages",
                column: "CaptainId");

            migrationBuilder.CreateIndex(
                name: "IX_Voyages_DeparturePortId",
                table: "Voyages",
                column: "DeparturePortId");

            migrationBuilder.CreateIndex(
                name: "IX_Voyages_ShipId",
                table: "Voyages",
                column: "ShipId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CaptainAssignments");

            migrationBuilder.DropTable(
                name: "FuelLogs");

            migrationBuilder.DropTable(
                name: "MaintenanceRecords");

            migrationBuilder.DropTable(
                name: "ShipLocations");

            migrationBuilder.DropTable(
                name: "Voyages");

            migrationBuilder.DropTable(
                name: "BookingRequests");

            migrationBuilder.DropTable(
                name: "Captains");

            migrationBuilder.DropTable(
                name: "Ports");

            migrationBuilder.DropTable(
                name: "Ships");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
