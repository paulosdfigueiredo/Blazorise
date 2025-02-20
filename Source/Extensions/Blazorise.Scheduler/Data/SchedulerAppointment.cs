using System;

namespace Blazorise.Scheduler;

public class SchedulerAppointment
{
    public SchedulerAppointment( string title, string description, DateTime start, DateTime end )
    {
        Id = Guid.NewGuid().ToString();
        Title = title;
        Description = description;
        Start = start;
        End = end;
    }

    public SchedulerAppointment( string id, string title, string description, DateTime start, DateTime end )
    {
        Id = id;
        Title = title;
        Description = description;
        Start = start;
        End = end;
    }

    public string Id { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public DateTime Start { get; set; }

    public DateTime End { get; set; }
}
