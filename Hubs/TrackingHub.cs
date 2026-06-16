using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ShipFleet.API.Hubs;

[Authorize]
public class TrackingHub : Hub
{
    public async Task JoinFleetTracking()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "fleet-tracking");
    }

    public async Task LeaveFleetTracking()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "fleet-tracking");
    }
}