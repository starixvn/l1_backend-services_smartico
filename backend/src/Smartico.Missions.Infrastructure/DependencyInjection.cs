using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;
using Smartico.Missions.Domain.Interfaces;
using Smartico.Missions.Infrastructure.Caching;
using Smartico.Missions.Infrastructure.SignalR;
using Smartico.Missions.Infrastructure.SmarticoApi;

namespace Smartico.Missions.Infrastructure;

/// <summary>
/// Extension methods for registering infrastructure services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds infrastructure services to the DI container.
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure Smartico API Options
        services.Configure<SmarticoApiOptions>(
            configuration.GetSection("Smartico"));

        // Configure Cache Options
        services.Configure<CacheOptions>(
            configuration.GetSection("Cache"));

        // Register Caching Service
        services.AddSingleton<ICacheService, MemoryCacheService>();

        // Register Progress Broadcaster (SignalR)
        // Note: Requires SignalR to be configured in API layer
        services.AddSingleton<IProgressBroadcaster, SignalRProgressBroadcaster>();

        // Register Smartico API Client with Polly resilience
        services.AddHttpClient<ISmarticoApiClient, SmarticoApiClient>()
            .AddPolicyHandler(HttpPolicyExtensions
                .HandleTransientHttpError()
                .WaitAndRetryAsync(
                    retryCount: 3,
                    sleepDurationProvider: retryAttempt =>
                        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
            .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(TimeSpan.FromSeconds(30)));

        return services;
    }
}

