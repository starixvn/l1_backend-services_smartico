using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Smartico.Missions.Api.Filters;
using Smartico.Missions.Api.Middleware;
using Smartico.Missions.Application;
using Smartico.Missions.Domain.Interfaces;
using Smartico.Missions.Infrastructure;
using Smartico.Missions.Infrastructure.SignalR;
using System.Text;
using System.Threading.RateLimiting;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/smartico-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting Smartico Missions & Badges API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging
    builder.Host.UseSerilog();

    // Add services to the container
    
    // Controllers with filters
    builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ValidateModelFilter>();
    });

    // SignalR for real-time updates
    builder.Services.AddSignalR();

    // Swagger/OpenAPI
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Smartico Missions & Badges API",
            Version = "v1",
            Description = "Backend API for Smartico Missions & Badges gamification feature"
        });

        // Add JWT authentication to Swagger
        options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
            Name = "Authorization",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                ?? new[] { "http://localhost:3000" };
            
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    // JWT Authentication
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var secretKey = jwtSettings["SecretKey"] 
        ?? throw new InvalidOperationException("JWT SecretKey is not configured");

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };

        // Support WebSocket authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            }
        };
    });

    builder.Services.AddAuthorization();

    // Rate Limiting (ASP.NET Core 9.0 built-in)
    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter("fixed", rateLimiterOptions =>
        {
            rateLimiterOptions.PermitLimit = 100;
            rateLimiterOptions.Window = TimeSpan.FromMinutes(1);
            rateLimiterOptions.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
            rateLimiterOptions.QueueLimit = 5;
        });
    });

    // Memory Cache
    builder.Services.AddMemoryCache();

    // Application services (MediatR, CQRS handlers)
    builder.Services.AddApplication();

    // Infrastructure services (Smartico API Client, etc.)
    builder.Services.AddInfrastructure(builder.Configuration);

    // Build the app
    var app = builder.Build();

    // Configure the HTTP request pipeline (ORDER MATTERS!)

    // 1. Exception handling (should be first)
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    // 2. Swagger (Development only)
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Smartico Missions API v1");
            options.RoutePrefix = "swagger";
        });
    }

    // 3. Request logging
    app.UseMiddleware<RequestLoggingMiddleware>();

    // 4. HTTPS redirection
    app.UseHttpsRedirection();

    // 5. CORS
    app.UseCors("AllowFrontend");

    // 6. Rate limiting
    app.UseRateLimiter();

    // 7. Authentication (must come before Authorization)
    app.UseAuthentication();

    // 8. Authorization
    app.UseAuthorization();

    // 9. Map controllers
    app.MapControllers();

    // 10. Health check endpoint
    app.MapGet("/health", () => Results.Ok(new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow,
        environment = app.Environment.EnvironmentName
    }))
    .WithName("HealthCheck")
    .AllowAnonymous();

    // 11. SignalR hubs for real-time updates
    app.MapHub<Smartico.Missions.Api.Hubs.ProgressHub>("/hubs/progress");

    Log.Information("Smartico Missions & Badges API started successfully");
    Log.Information("Swagger UI available at: {SwaggerUrl}", "/swagger");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

// Make Program class accessible for integration tests
public partial class Program { }
