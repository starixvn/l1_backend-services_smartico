using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;
using Smartico.Missions.Domain.Interfaces;
using Smartico.Missions.Infrastructure.Caching;
using Smartico.Missions.Infrastructure.Repositories;
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

        // Configure Smartico Bonus API Options
        services.Configure<SmarticoBonusApiOptions>(
            configuration.GetSection("SmarticoBonusApi"));

        // Configure Cache Options
        services.Configure<CacheOptions>(
            configuration.GetSection("Cache"));

        // Register Caching Service
        services.AddSingleton<ICacheService, MemoryCacheService>();

        // Register Progress Broadcaster (SignalR)
        // Handles all real-time events: Mission progress, Badge earned, Bonus issued/claimed/expired
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

        // Register Smartico Bonus API Client with Polly resilience
        services.AddHttpClient<ISmarticoBonusApiClient, SmarticoBonusApiClient>()
            .AddPolicyHandler(HttpPolicyExtensions
                .HandleTransientHttpError()
                .WaitAndRetryAsync(
                    retryCount: 3,
                    sleepDurationProvider: retryAttempt =>
                        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
            .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(TimeSpan.FromSeconds(30)));

        // Register Smartico Mini Game API Client (demo implementation, no HTTP needed)
        services.AddSingleton<ISmarticoMiniGameApiClient, SmarticoMiniGameApiClient>();

        // Register Smartico Tournament API Client (demo implementation, no HTTP needed)
        services.AddSingleton<ISmarticoTournamentApiClient, SmarticoTournamentApiClient>();

        // Register Smartico Level API Client (demo implementation, no HTTP needed)
        services.AddSingleton<ISmarticoLevelApiClient, SmarticoLevelApiClient>();

        // Register Smartico Jackpot API Client (demo implementation, no HTTP needed)
        services.AddSingleton<ISmarticoJackpotApiClient, SmarticoJackpotApiClient>();

        // Register MongoDB Read Repositories (read from backoffice database)
        services.AddScoped<IJackpotReadRepository, JackpotReadRepository>();
        services.AddScoped<IMissionReadRepository, MissionReadRepository>();
        services.AddScoped<IBadgeReadRepository, BadgeReadRepository>();

        return services;
    }
}

