namespace ShipFleet.Core.Enums;

public enum ShipStatus
{
    InPort, UnderWay, Anchored, UnderMaintenance, OutOfService, Retired
}

public enum BookingStatus
{
    Pending, Approved, Rejected, UnderWay, Completed, Cancelled
}

public enum UserRole
{
    Admin, FleetManager, Captain, Employee, Customer
}

public enum MaintenanceType
{
    Scheduled, Repair, Inspection, Emergency, Drydock
}

public enum ShipType
{
    CargoVessel, ContainerShip, BulkCarrier, Tanker, RoRo, GeneralCargo
}

public enum FuelType
{
    HFO, MGO, VLSFO, LNG, MDO
}

public enum VoyageStatus
{
    Planned, UnderWay, Completed, Cancelled
}