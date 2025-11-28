using System.Text.Json.Serialization;
using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.Services;

namespace Smartico.BackOffice.Application.Bonuses.Commands;

/// <summary>
/// Command to record a bonus claim.
/// Used when a mission, tournament, store, or other channel issues a bonus to a player.
/// </summary>
public class RecordBonusClaimCommand
{
    /// <summary>
    /// The bonus template ID being claimed.
    /// </summary>
    [JsonPropertyName("bonusId")]
    public string BonusId { get; set; } = string.Empty;

    /// <summary>
    /// The external player ID.
    /// </summary>
    [JsonPropertyName("playerId")]
    public string PlayerId { get; set; } = string.Empty;

    /// <summary>
    /// The calculated claim value.
    /// </summary>
    [JsonPropertyName("claimValue")]
    public decimal ClaimValue { get; set; }

    /// <summary>
    /// The currency of the claim.
    /// </summary>
    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// The source channel issuing the bonus.
    /// </summary>
    [JsonPropertyName("source")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusClaimSource Source { get; set; }

    /// <summary>
    /// Reference to the source entity (e.g., MissionId, TournamentId).
    /// </summary>
    [JsonPropertyName("sourceId")]
    public string? SourceId { get; set; }
}

/// <summary>
/// Result of recording a bonus claim.
/// </summary>
public class RecordBonusClaimResult
{
    /// <summary>
    /// Whether the claim was successfully recorded.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// The claim ID if successful.
    /// </summary>
    public string? ClaimId { get; init; }

    /// <summary>
    /// Error message if failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// The limit check result if claim was rejected due to limits.
    /// </summary>
    public BonusClaimCheckResult? LimitCheckResult { get; init; }

    /// <summary>
    /// Creates a success result.
    /// </summary>
    public static RecordBonusClaimResult Succeeded(string claimId) => new()
    {
        Success = true,
        ClaimId = claimId
    };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    public static RecordBonusClaimResult Failed(string errorMessage, BonusClaimCheckResult? limitResult = null) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        LimitCheckResult = limitResult
    };
}

/// <summary>
/// Handler for recording bonus claims.
/// </summary>
public class RecordBonusClaimCommandHandler
{
    private readonly IBonusClaimRepository _claimRepository;
    private readonly IBonusLimitService _limitService;

    public RecordBonusClaimCommandHandler(
        IBonusClaimRepository claimRepository,
        IBonusLimitService limitService)
    {
        _claimRepository = claimRepository;
        _limitService = limitService;
    }

    /// <summary>
    /// Handles the command to record a bonus claim.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="command">The command containing claim details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result of the claim attempt.</returns>
    public async Task<RecordBonusClaimResult> HandleAsync(
        ObjectId operatorId,
        RecordBonusClaimCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate bonus ID
        if (!ObjectId.TryParse(command.BonusId, out var bonusId))
        {
            return RecordBonusClaimResult.Failed("Invalid bonus ID format.");
        }

        // Check limits before recording
        var limitCheck = await _limitService.CheckPlayerCanClaimAsync(
            operatorId,
            command.PlayerId,
            bonusId,
            command.ClaimValue,
            command.Currency,
            cancellationToken);

        if (!limitCheck.IsAllowed)
        {
            return RecordBonusClaimResult.Failed(
                limitCheck.RejectionReason ?? "Claim rejected due to limit constraints.",
                limitCheck);
        }

        // Create the claim record
        var claim = new BonusClaim
        {
            OperatorId = operatorId,
            BonusId = bonusId,
            PlayerId = command.PlayerId,
            ClaimValue = command.ClaimValue,
            Currency = command.Currency,
            Source = command.Source,
            SourceId = !string.IsNullOrEmpty(command.SourceId) && ObjectId.TryParse(command.SourceId, out var sourceId)
                ? sourceId
                : null,
            Status = BonusClaimStatus.Pending
        };

        var createdClaim = await _claimRepository.CreateAsync(claim, cancellationToken);

        return RecordBonusClaimResult.Succeeded(createdClaim.Id.ToString());
    }

    /// <summary>
    /// Updates the status of a claim after external API response.
    /// </summary>
    public async Task<BonusClaim?> UpdateClaimStatusAsync(
        ObjectId operatorId,
        ObjectId claimId,
        BonusClaimStatus status,
        string? externalReferenceId = null,
        CancellationToken cancellationToken = default)
    {
        return await _claimRepository.UpdateStatusAsync(
            operatorId,
            claimId,
            status,
            externalReferenceId,
            cancellationToken);
    }
}
