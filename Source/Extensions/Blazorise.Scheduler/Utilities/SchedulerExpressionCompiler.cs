#region Using directives
using System;
using System.Linq.Expressions;
#endregion

namespace Blazorise.Scheduler.Utilities;

/// <summary>
/// Utility class for compiling expressions.
/// </summary>
public static class SchedulerExpressionCompiler
{
    /// <summary>
    /// Builds a search predicate for the given item type.
    /// </summary>
    /// <typeparam name="TItem">The type of the item.</typeparam>
    /// <param name="startFieldName">The name of the field that represents the start date/time.</param>
    /// <param name="endFieldName">The name of the field that represents the end date/time.</param>
    /// <returns>A compiled search predicate.</returns>
    /// <exception cref="ArgumentException"></exception>
    public static Func<TItem, DateOnly, int, TimeSpan, bool> BuildSearchPredicate<TItem>( string startFieldName, string endFieldName )
    {
        var itemType = typeof( TItem );
        var itemParameter = Expression.Parameter( itemType, "x" );
        var dateParameter = Expression.Parameter( typeof( DateOnly ), "date" );
        var slotHourParameter = Expression.Parameter( typeof( int ), "slotHour" );
        var timeParameter = Expression.Parameter( typeof( TimeSpan ), "time" );

        var startProperty = itemType.GetProperty( startFieldName );
        var endProperty = itemType.GetProperty( endFieldName );

        if ( startProperty == null || endProperty == null )
        {
            throw new ArgumentException( "Invalid field names for Start or End." );
        }

        var startPropertyAccess = Expression.Property( itemParameter, startProperty );
        var endPropertyAccess = Expression.Property( itemParameter, endProperty );

        var startDateTime = ConvertToDateTimeExpression( startPropertyAccess, dateParameter );
        var endDateTime = ConvertToDateTimeExpression( endPropertyAccess, dateParameter );

        var dateCondition = Expression.Equal(
            Expression.Property( startDateTime, nameof( DateTime.Date ) ),
            Expression.Property( Expression.Call( dateParameter, nameof( DateOnly.ToDateTime ), null, Expression.Constant( TimeOnly.MinValue ) ), nameof( DateTime.Date ) )
        );

        var hourCondition = Expression.Equal(
            Expression.Property( startDateTime, nameof( DateTime.Hour ) ),
            slotHourParameter
        );

        var minuteCondition = Expression.AndAlso(
            Expression.GreaterThanOrEqual(
                Expression.Property( startDateTime, nameof( DateTime.Minute ) ),
                Expression.Property( timeParameter, nameof( TimeSpan.Minutes ) )
            ),
            Expression.LessThanOrEqual(
                Expression.Property( startDateTime, nameof( DateTime.Minute ) ),
                Expression.Property( timeParameter, nameof( TimeSpan.Minutes ) )
            )
        );

        var combinedCondition = Expression.AndAlso( dateCondition, Expression.AndAlso( hourCondition, minuteCondition ) );

        var lambda = Expression.Lambda<Func<TItem, DateOnly, int, TimeSpan, bool>>(
            combinedCondition, itemParameter, dateParameter, slotHourParameter, timeParameter
        );

        return lambda.Compile();
    }

    private static Expression ConvertToDateTimeExpression( Expression propertyAccess, ParameterExpression dateParameter )
    {
        if ( propertyAccess.Type == typeof( DateTime ) )
        {
            return propertyAccess;
        }
        else if ( propertyAccess.Type == typeof( TimeOnly ) )
        {
            var toDateTimeMethod = typeof( DateOnly ).GetMethod( nameof( DateOnly.ToDateTime ), new[] { typeof( TimeOnly ) } );
            return Expression.Call( dateParameter, toDateTimeMethod, propertyAccess );
        }
        else
        {
            throw new ArgumentException( "Field must be of type DateTime or TimeOnly." );
        }
    }

    /// <summary>
    /// Builds a function that returns a string value for the given field name.
    /// </summary>
    /// <typeparam name="TItem">The type of the item.</typeparam>
    /// <param name="fieldName">The name of the field that represents the title.</param>
    /// <returns>A compiled function that returns a string value for the given field name.</returns>
    /// <exception cref="ArgumentException">
    /// Invalid field name for {fieldName}.
    /// </exception>
    public static Func<TItem, string> BuildGetStringFunc<TItem>( string fieldName )
    {
        var itemType = typeof( TItem );
        var itemParameter = Expression.Parameter( itemType, "x" );

        var titleProperty = itemType.GetProperty( fieldName );

        if ( titleProperty == null )
        {
            throw new ArgumentException( $"Invalid field name for {fieldName}." );
        }

        var titlePropertyAccess = Expression.Property( itemParameter, titleProperty );

        var lambda = Expression.Lambda<Func<TItem, string>>( titlePropertyAccess, itemParameter );

        return lambda.Compile();
    }
}
