using FluentValidation;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Tournaments.Commands;
using Smartico.BackOffice.Application.Tournaments.DTOs;
using Smartico.BackOffice.Application.Tournaments.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Tournaments.Services;

/// <summary>
/// Service implementation for tournament business logic.
/// </summary>
public class TournamentService : ITournamentService
{
    private readonly ITournamentRepository _repository;
    private readonly IValidator<CreateTournamentCommand> _validator;

    /// <summary>
    /// Initializes a new instance of the <see cref="TournamentService"/> class.
    /// </summary>
    /// <param name="repository">The tournament repository.</param>
    /// <param name="validator">The tournament validator.</param>
    public TournamentService(
        ITournamentRepository repository,
        IValidator<CreateTournamentCommand> validator)
    {
        _repository = repository;
        _validator = validator;
    }

    /// <inheritdoc/>
    public async Task<TournamentDto> CreateTournamentAsync(
        ObjectId operatorId,
        CreateTournamentCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate command
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Create entity
        var tournament = new Tournament
        {
            Id = ObjectId.GenerateNewId(),
            OperatorId = operatorId,
            Name = command.Name,
            Description = command.Description,
            Type = command.Type,
            Status = TournamentStatus.Draft,
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            ScoringType = command.ScoringType,
            PrizePool = command.PrizePool,
            PrizeDistribution = command.PrizeDistribution,
            MaxParticipants = command.MaxParticipants,
            EntryFee = command.EntryFee,
            EligibleGames = command.EligibleGames
        };

        await _repository.CreateAsync(tournament, cancellationToken);

        return MapToDto(tournament);
    }

    /// <inheritdoc/>
    public async Task<TournamentDto?> GetTournamentByIdAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default)
    {
        var tournament = await _repository.GetByIdAsync(operatorId, tournamentId, cancellationToken);
        return tournament != null ? MapToDto(tournament) : null;
    }

    /// <inheritdoc/>
    public async Task<List<TournamentDto>> GetAllTournamentsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        var tournaments = await _repository.GetAllAsync(operatorId, cancellationToken);
        return tournaments.Select(MapToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<TournamentDto> UpdateTournamentAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CreateTournamentCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate command
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Get existing tournament
        var existing = await _repository.GetByIdAsync(operatorId, tournamentId, cancellationToken);
        if (existing == null)
        {
            throw new InvalidOperationException($"Tournament {tournamentId} not found.");
        }

        // Update properties
        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.Type = command.Type;
        existing.StartDate = command.StartDate;
        existing.EndDate = command.EndDate;
        existing.ScoringType = command.ScoringType;
        existing.PrizePool = command.PrizePool;
        existing.PrizeDistribution = command.PrizeDistribution;
        existing.MaxParticipants = command.MaxParticipants;
        existing.EntryFee = command.EntryFee;
        existing.EligibleGames = command.EligibleGames;

        await _repository.UpdateAsync(existing, cancellationToken);

        return MapToDto(existing);
    }

    /// <inheritdoc/>
    public async Task DeleteTournamentAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(operatorId, tournamentId, cancellationToken);
    }

    /// <summary>
    /// Maps a tournament entity to a DTO.
    /// </summary>
    private static TournamentDto MapToDto(Tournament tournament)
    {
        return new TournamentDto
        {
            Id = tournament.Id.ToString(),
            OperatorId = tournament.OperatorId.ToString(),
            Name = tournament.Name,
            Description = tournament.Description,
            Type = tournament.Type,
            Status = tournament.Status,
            StartDate = tournament.StartDate,
            EndDate = tournament.EndDate,
            ScoringType = tournament.ScoringType,
            PrizePool = tournament.PrizePool,
            PrizeDistribution = tournament.PrizeDistribution,
            MaxParticipants = tournament.MaxParticipants,
            EntryFee = tournament.EntryFee,
            EligibleGames = tournament.EligibleGames,
            CreatedAt = tournament.CreatedAt,
            UpdatedAt = tournament.UpdatedAt
        };
    }
}
