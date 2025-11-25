using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Smartico.BackOffice.Api.Utils;

/// <summary>
/// Development utility for generating mock JWT tokens for testing.
/// DO NOT USE IN PRODUCTION.
/// </summary>
public static class DevTokenGenerator
{
    private const string SecretKey = "THIS_IS_A_DEVELOPMENT_SECRET_KEY_DO_NOT_USE_IN_PRODUCTION_12345";
    private const string Issuer = "sabaone-backoffice-dev";
    private const string Audience = "sabaone-backoffice-api";

    /// <summary>
    /// Generates a mock JWT token for development/testing purposes.
    /// </summary>
    /// <param name="operatorId">The operator ID to include in the token.</param>
    /// <param name="userName">Optional username for the token.</param>
    /// <param name="expirationMinutes">Token expiration time in minutes (default: 60).</param>
    /// <returns>A JWT token string.</returns>
    public static string GenerateToken(
        string operatorId,
        string userName = "dev-user",
        int expirationMinutes = 60)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("operatorId", operatorId),
            new Claim(ClaimTypes.Name, userName),
            new Claim(ClaimTypes.NameIdentifier, operatorId),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Generates a token for the default development operator.
    /// </summary>
    /// <returns>A JWT token string for the default operator (000000000000000000000001).</returns>
    public static string GenerateDefaultOperatorToken()
    {
        return GenerateToken("000000000000000000000001", "default-operator");
    }

    /// <summary>
    /// Generates tokens for multiple test operators.
    /// </summary>
    /// <returns>Dictionary of operator names to their JWT tokens.</returns>
    public static Dictionary<string, string> GenerateTestOperatorTokens()
    {
        return new Dictionary<string, string>
        {
            ["operator1"] = GenerateToken("000000000000000000000001", "operator1-user"),
            ["operator2"] = GenerateToken("000000000000000000000002", "operator2-user"),
            ["operator3"] = GenerateToken("000000000000000000000003", "operator3-user")
        };
    }

    /// <summary>
    /// Prints usage instructions and sample tokens to the console.
    /// </summary>
    public static void PrintDevTokens()
    {
        Console.WriteLine("=== Development JWT Tokens ===");
        Console.WriteLine();
        Console.WriteLine("Use these tokens in the Authorization header:");
        Console.WriteLine("Authorization: Bearer <token>");
        Console.WriteLine();

        var tokens = GenerateTestOperatorTokens();

        foreach (var (operatorName, token) in tokens)
        {
            Console.WriteLine($"Operator: {operatorName}");
            Console.WriteLine($"Token: {token}");
            Console.WriteLine();
        }

        Console.WriteLine("Example curl command:");
        Console.WriteLine($"curl -H \"Authorization: Bearer {tokens["operator1"]}\" http://localhost:5000/api/tournaments");
        Console.WriteLine();
    }
}
