using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Api.Middleware;
using Smartico.BackOffice.Application.Auth.Interfaces;
using Smartico.BackOffice.Application.Auth.Services;
using Smartico.BackOffice.Application.Bonuses.Commands;
using Smartico.BackOffice.Application.Bonuses.Interfaces;
using Smartico.BackOffice.Application.Bonuses.Services;
using Smartico.BackOffice.Application.LevelSystems.Interfaces;
using Smartico.BackOffice.Application.LevelSystems.Services;
using Smartico.BackOffice.Application.Badges.Interfaces;
using Smartico.BackOffice.Application.Badges.Services;
using Smartico.BackOffice.Application.BadgeSeries.Interfaces;
using Smartico.BackOffice.Application.BadgeSeries.Services;
using Smartico.BackOffice.Application.Jackpots.Interfaces;
using Smartico.BackOffice.Application.Jackpots.Services;
using Smartico.BackOffice.Application.Demo.Interfaces;
using Smartico.BackOffice.Application.Demo.Services;
using Smartico.BackOffice.Domain.Services;
using Smartico.BackOffice.Application.Leaderboard.Interfaces;
using Smartico.BackOffice.Application.Leaderboard.Services;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Application.Missions.Interfaces;
using Smartico.BackOffice.Application.Missions.Services;
using Smartico.BackOffice.Application.Missions.Validators;
using Smartico.BackOffice.Application.Tournaments.Interfaces;
using Smartico.BackOffice.Application.Tournaments.Services;
using Smartico.BackOffice.Application.Tournaments.Validators;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Infrastructure.Configuration;
using Smartico.BackOffice.Infrastructure.Data;
using Smartico.BackOffice.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to handle enums as strings
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configure MongoDB
var mongoSettings = builder.Configuration.GetSection("MongoDB").Get<MongoDbSettings>()
    ?? throw new InvalidOperationException("MongoDB settings not found in configuration");

builder.Services.AddSingleton<MongoDbSettings>(mongoSettings);

// Register MongoDB client and database
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<MongoDbSettings>();
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = sp.GetRequiredService<MongoDbSettings>();
    return client.GetDatabase(settings.DatabaseName);
});

// Register MongoDB index setup
builder.Services.AddScoped<MongoDbIndexSetup>();

// Register HttpContextAccessor for accessing operator context
builder.Services.AddHttpContextAccessor();

// Register repositories with factory pattern to extract OperatorId from HttpContext
builder.Services.AddScoped<ITournamentRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new TournamentRepository(database, operatorId);
});

builder.Services.AddScoped<ILeaderboardRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new LeaderboardRepository(database, operatorId);
});

builder.Services.AddScoped<IMissionRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new MissionRepository(database, operatorId);
});

builder.Services.AddScoped<IUserRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new UserRepository(database, operatorId);
});

builder.Services.AddScoped<IRoleRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new RoleRepository(database, operatorId);
});

builder.Services.AddScoped<IBonusRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new BonusRepository(database, operatorId);
});

builder.Services.AddScoped<IBonusClaimRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new BonusClaimRepository(database, operatorId);
});

builder.Services.AddScoped<IOperatorBonusLimitsRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new OperatorBonusLimitsRepository(database, operatorId);
});

builder.Services.AddScoped<ILevelSystemRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new LevelSystemRepository(database, operatorId);
});

builder.Services.AddScoped<IBadgeRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new BadgeRepository(database, operatorId);
});

builder.Services.AddScoped<IBadgeSeriesRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new BadgeSeriesRepository(database, operatorId);
});

builder.Services.AddScoped<IJackpotRepository>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();

    var operatorId = httpContextAccessor.HttpContext?.Items["OperatorId"] as ObjectId?
        ?? ObjectId.Parse("000000000000000000000001"); // Default for development

    return new JackpotRepository(database, operatorId);
});

// Register validators
builder.Services.AddValidatorsFromAssemblyContaining<TournamentValidator>();

// Register application services
builder.Services.AddScoped<ITournamentService, TournamentService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<IMissionService, MissionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBonusService, BonusService>();
builder.Services.AddScoped<IBonusLimitService, BonusLimitService>();
builder.Services.AddScoped<ILevelSystemService, LevelSystemService>();
builder.Services.AddScoped<IBadgeService, BadgeService>();
builder.Services.AddScoped<IBadgeSeriesService, BadgeSeriesService>();
builder.Services.AddScoped<IJackpotService, JackpotService>();
builder.Services.AddScoped<IDemoScenarioService, DemoScenarioService>();

// Register command handlers
builder.Services.AddScoped<PublishMissionCommandHandler>();
builder.Services.AddScoped<RecordBonusClaimCommandHandler>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

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
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// Configure OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "SabaONE Back Office API",
        Version = "v1",
        Description = "Campaign Management & Tournament Builder API"
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Initialize MongoDB indexes
using (var scope = app.Services.CreateScope())
{
    var indexSetup = scope.ServiceProvider.GetRequiredService<MongoDbIndexSetup>();
    await indexSetup.CreateIndexesAsync();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "SabaONE Back Office API v1");
    });
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

// Use authentication & authorization
app.UseAuthentication();
app.UseAuthorization();

// Use operator context middleware (extracts OperatorId from claims)
app.UseOperatorContext();

app.MapControllers();

app.Run();
