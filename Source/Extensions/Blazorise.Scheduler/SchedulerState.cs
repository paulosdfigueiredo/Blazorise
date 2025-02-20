using System;

namespace Blazorise.Scheduler;

public record SchedulerState
{
    public DateOnly SelectedDate { get; init; }
}
